# Plano preliminar – Tool `get_sprint_tasks`

## Objetivo
Criar a tool MCP `get_sprint_tasks` que recebe um `due_date_gt` (obrigatório) em formato `dd/mm/yyyy`, converte para timestamp e devolve tarefas + subtarefas da sprint que:
- possuam prazo (`due_date`) ≥ data filtrada;
- tenham pelo menos um membro da equipe como responsável;
- incluam tarefas fechadas;
- retornem campos enriquecidos (prioridade, markdown, checklists, comentários, responsáveis, datas relevantes, tags) também nas subtarefas elegíveis.

## Análise de serviços existentes
- **Members / equipe**: `WorkspaceService.getWorkspaceMembers()` já traz os integrantes do time via `/team/{teamId}` (`src/services/clickup/workspace.ts:444`). Basearemos o filtro de assignees nessa lista.
- **Listagem de tarefas**: `TaskService.search.getWorkspaceTasks()` suporta filtros `due_date_gt`, `include_closed`, `assignees`, `detail_level` e `subtasks` (`src/services/clickup/task/task-search.ts:151`, `src/services/clickup/task/task-core.ts:108`). A doc oficial confirma que `GET /v2/team/{team_Id}/task` aceita exatamente esses filtros, incluindo `subtasks`, `include_markdown_description` e `parent` para focar subtarefas (`openapi.json:19599-19890`).
- **Recuperação detalhada**: `TaskService.getTask` (core) pode incluir subtarefas e markdown (`openapi.json` `/v2/task/{task_id}` com `include_subtasks`, `include_markdown_description`). Podemos complementar com chamadas individuais apenas quando algum campo faltar, já que o payload de `/team/{team_Id}/task` já traz checklists e markdown.
- **Comentários**: `TaskServiceComments.getTaskComments` cobre `/task/{taskId}/comment` (`src/services/clickup/task/task-comments.ts:17`). Planejar uso para cada task/subtask retornada.
- **Subtarefas**: `TaskServiceCore.getSubtasks` busca subtasks via `/task/{id}?subtasks=true&include_subtasks=true` (`src/services/clickup/task/task-core.ts:305`). Avaliar se resposta contém campos suficientes; caso contrário, iterar com `getTask` por ID.
- **Conversão de datas**: `parseDueDate` ainda não entende `dd/mm/yyyy`. Será preciso estender `src/utils/date-utils.ts:366` (trecho dos regex) para suportar o formato antes de usar na nova tool.

## Fluxo proposto (alto nível)
1. **Parâmetros & validação**
   - Tool aceita objeto com `due_date_gt` (string `dd/mm/yyyy`). Validar presença e formato.
   - Converter para timestamp em ms reutilizando `parseDueDate` após suportar o padrão (assumir hora 23:59:59 para incluir todo o dia, ou documentar decisão).
2. **Carregar equipe**
   - Chamar `GET /v2/team` (via novo serviço fino) e extrair membros do `teamId` atual.
   - Criar estrutura `Set` com IDs numéricos para filtros e pós-filtragem.
3. **Buscar tarefas elegíveis**
   - Criar serviço dedicado que chama `GET /v2/team/{team_Id}/task` com:
     - `assignees[]=memberId` para cada integrante;
     - `due_date_gt=timestamp`, `include_closed=true`, `subtasks=true`, `include_markdown_description=true`.
   - Se necessário refinar para subtarefas isoladas, usar o mesmo endpoint com `parent=taskId`.
   - Deduplicar resultados e garantir via pós-filtragem local (`due_date >= filtro`, interseção de assignees).
   - Inspirar-se em `getTasks.js` para:
     - construir query params com `URLSearchParams`, preservando Arrays como `key[]`;
     - reconstruir hierarquia pai/filho com `Map` de tarefas por ID antes de aplicar filtros adicionais nas subtarefas.
4. **Enriquecimento de cada tarefa**
   - O payload já inclui prioridades, markdown, checklists, tags (`openapi.json:19920-20520`). Só complementar se algum campo vier ausente chamando `GET /v2/task/{task_id}?include_subtasks=true&include_markdown_description=true`.
   - Buscar comentários via `GET /v2/task/{task_id}/comment`, consolidando no resultado.
5. **Processar subtarefas**
   - Subtarefas retornadas pelo endpoint principal devem ser filtradas localmente com os mesmos critérios.
   - Para cada subtask válida, repetir coleta de comentários e organizar hierarquia.
6. **Resposta consolidada**
   - Estruturar lista final com tarefas e subtarefas aninhadas, incluindo metadados (timestamp aplicado, totais).

## Considerações técnicas
- **Desempenho & Rate Limits**: Chamar `getTask` e `getTaskComments` por item pode ser custoso. Avaliar lote/concurrency control via `processBatch` (`src/utils/concurrency-utils.ts`) ou similar para limitar chamadas simultâneas.
- **Campos ausentes**: Garantir fallback caso markdown não esteja disponível (usar `description`), listas sem checklists/comentários devem retornar arrays vazias.
- **Erro de parsing de data**: Propagar mensagem amigável quando `parseDueDate` retornar `undefined`.
- **Timezones**: Documentar se timestamp considera timezone local ou UTC para evitar divergência no >= (atualmente `parseDueDate` opera no timezone do host).

## Entregáveis
1. **Tool definition** (novo arquivo `src/tools/task/sprint-operations.ts` ou semelhante) com schema `{ due_date_gt: string }` e descrição clara.
2. **Handler** sob `src/tools/task/handlers.ts` (ou módulo dedicado) orquestrando fluxo descrito.
3. **Extensões utilitárias**: suporte `dd/mm/yyyy` em `parseDueDate`; helper opcional para conversão de string → timestamp com validação.
4. **Ajustes nos serviços** se necessário (ex.: wrapper `getTaskWithMarkdown`, cache de membros).
5. **Documentação**: nova página em `docs/` com exemplo de uso e campos retornados; atualizar `plano-tool-sprint.md` após implementação.
6. **Testes**: adicionar cenário em `src/tests/` cobrindo conversão da data e filtragem (mock de serviços ClickUp). Se viável, script de teste em `scripts/run-test.ts`.

## Próximos passos imediatos
1. Ajustar `parseDueDate` para aceitar `dd/mm/yyyy`.
2. Definir contrato de resposta detalhado (campos, estrutura de subtasks).
3. Mapear comportamento exato do filtro `assignees[]` (por doc ou teste rápido) e ajustar estratégia de busca.
4. Prototipar função que agrega tarefas detalhadas (pseudo-código) antes de criar tool final.
