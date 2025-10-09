# Documentação do utilitário de datas

## Visão geral
- **Arquivo:** `src/utils/date-utils.ts`
- **Papel:** concentrar o tratamento de datas, timestamps e strings em linguagem natural antes de enviar dados para os serviços ClickUp.
- **Principais consumidores:** ferramentas sob `src/tools/`, em especial os fluxos de tarefas e time tracking.

## Funções exportadas
| Função | Assinatura | Descrição |
|--------|------------|-----------|
| `getRelativeTimestamp` | `(minutes?, hours?, days?, weeks?, months?) => number` | Retorna `Date.now()` ajustado pelos deslocamentos fornecidos. Utilizado internamente como base para expressões do tipo “X from now”. |
| `parseDueDate` | `(dateString: string) => number \| undefined` | Converte timestamps (`ms`) e várias expressões naturais (ex.: `tomorrow 9am`, `+2 weeks`, `03/10/2025`) em milissegundos. Retorna `undefined` quando não consegue interpretar. |
| `formatDueDate` | `(timestamp: number \| null \| undefined) => string \| undefined` | Gera uma string legível no formato `March 10, 2025, 10:56 PM` (locale `en-US`). Retorna `undefined` para valores inválidos. |
| `formatRelativeTime` | `(timestamp: string \| number) => string` | Calcula o tempo relativo a partir de `Date.now()`, devolvendo textos como `5 minutes ago` ou `2 months ago`. |

## Como `parseDueDate` funciona
1. **Short‑circuit para números:** se a string for um número maior que `946684800000` (01/01/2000), assume-se que já é um timestamp válido.
2. **Pré-processamento inteligente:** `preprocessDateString` normaliza o texto (lowercase, trim, correção de typos como `tommorow`, substituição de “a day ago” por `1 day ago`, remoção de stopwords como `at`, `on`, etc.).
3. **Padrões dedicados:** `getDatePatterns` cobre blocos como `±N days/weeks/months/years`, `yesterday|tomorrow` e variações com horário (`3pm`, `2:30am`). Horários são convertidos para formato 24h por `parseTimeComponents` e aplicados via `setTimeOnDate` (que usa o final do dia `23:59:59.999` quando não há hora explícita).
4. **Atalhos semânticos:** termos como `now`, `today`, `start of today`, nomes de dia (`monday`, `next friday 5pm`) e expressões legadas (`5 days from now`) recebem tratamento específico.
5. **Formatos explícitos:** regex dedicadas cobrem `MM/DD/YYYY`, `MM/DD` (usa ano corrente) e `Month DD YYYY`, cada uma com suporte opcional a horário e sufixos `am/pm`.
6. **Fallbacks graduais:** `enhancedFallbackParsing` tenta `new Date()` para entrada pré-processada e original, aplica variações (removendo timezone, “next”, “this”, etc.), adiciona ano corrente em strings curtas e por fim tenta conversões ISO. Datas fora do intervalo [1 ano atrás, 10 anos à frente] são descartadas.
7. **Logging e erros:** cada etapa relevante emite `logger.debug` com o prefixo `DateUtils`. Em falhas inesperadas a função faz `logger.warn` e lança `Error`, permitindo ao chamador tratar a exceção.

## Exemplos de entradas aceitas
- `yesterday`, `tomorrow 6pm`, `day after tomorrow`
- `+3 days`, `-2 weeks 8am`, `5 months from now`
- `03/10/2025`, `9/15 14:30`, `march 10 2025 6:30pm`
- `1713302400000` (timestamp em milissegundos)
- `next friday` (retorna a próxima ocorrência; se já passou nesta semana, soma 7 dias)
- `today` (usa o fim do dia para alinhar com prazos do ClickUp)

## Integração no projeto
- `src/tools/utils.ts` reexporta as funções, simplificando imports em ferramentas MCP.
- `src/tools/task/handlers.ts` usa `parseDueDate` para construir `due_date`/`start_date` ao atualizar, criar e converter tarefas (`src/tools/task/handlers.ts:174`, `src/tools/task/handlers.ts:606`, `src/tools/task/handlers.ts:1060`).
- `src/tools/task/time-tracking.ts` converte filtros (`startDate`, `endDate`, `start`) vindos do usuário antes de chamar os serviços de time tracking (`src/tools/task/time-tracking.ts:220`, `src/tools/task/time-tracking.ts:224`, `src/tools/task/time-tracking.ts:411`).
- `src/tools/task/utilities.ts` usa `formatDueDate` para exibir `due_date`/`start_date` em respostas humanizadas (`src/tools/task/utilities.ts:28`).

## Conversões em requisições
- **Criação/atualização individual:** `createTaskHandler` normaliza `dueDate` e `startDate` com `parseDueDate` antes de enviar ao ClickUp (`src/tools/task/handlers.ts:606`). `buildUpdateData` faz o mesmo em updates e zera o campo quando a conversão falha (`src/tools/task/handlers.ts:174`).
- **Operações em lote:** o fluxo de criação em massa aplica `parseDueDate` para cada item antes da chamada (`src/tools/task/handlers.ts:1038`). Já `updateBulkTasksHandler` delega direto ao serviço; entradas devem chegar como timestamps, pois não há conversão adicional (`src/services/clickup/bulk.ts:72`).
- **Ferramentas de time tracking:** filtros `startDate`, `endDate` e o parâmetro `start` de novos lançamentos são convertidos para timestamp com `parseDueDate` (`src/tools/task/time-tracking.ts:220`, `src/tools/task/time-tracking.ts:224`, `src/tools/task/time-tracking.ts:411`).
- **Filtros de workspace:** parâmetros como `due_date_gt` e `date_created_lt` são encaminhados como recebidos; atualmente o handler espera timestamps já normalizados (`src/tools/task/handlers.ts:804`, `src/services/clickup/task/task-core.ts:123`).

## Conversões em respostas
- **Dados de tarefas:** sempre que o utilitário `formatTaskData` formata uma tarefa para retornar ao MCP, campos `due_date` e `start_date` são convertidos para o formato legível `Month DD, YYYY, HH:MM AM/PM` via `formatDueDate` (`src/tools/task/utilities.ts:28`).
- **Time tracking:** respostas mantêm `start` e `end` como timestamps para preservar precisão; apenas `duration` ganha uma versão textual através de `formatDuration` (`src/tools/task/time-tracking.ts:254`, `src/tools/task/time-tracking.ts:368`).
- **APIs pass-through:** handlers que simplesmente encaminham a resposta da API (ex.: `getWorkspaceTasksHandler`) conservarão os timestamps originais retornados pelo ClickUp (`src/tools/task/handlers.ts:880`).

## Boas práticas e extensões
- **Validação de entrada:** trate `undefined` retornado por `parseDueDate` como sinal para limpar campos ou solicitar confirmação do usuário (como feito em `buildUpdateData`).
- **Horários padrão:** ao omitir horas, lembre-se de que o utilitário assume o fim do dia. Ajuste `setTimeOnDate` ou acrescente novos padrões se precisar de comportamento diferente.
- **Novos padrões:** adicione entradas em `normalizations` (pré-processamento) ou em `getDatePatterns` para novas expressões. Prefira inserir antes das regex gerais para evitar “shadowing”.
- **Timezones:** o módulo opera na timezone local do servidor Node.js. Caso seja necessário suportar UTC ou offsets, avalie criar variantes usando `Date.UTC` ou bibliotecas como `luxon`.
- **Observabilidade:** mantenha o nível de log `debug` habilitado durante testes de parsing para inspecionar como as strings estão sendo normalizadas e em qual etapa são interpretadas.
