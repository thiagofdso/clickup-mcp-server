# Arquitetura das Tools - ClickUp MCP Server

## Visao geral
- As tools expostas ao MCP ficam centralizadas em `src/tools`, com um indice (`src/tools/index.ts`) que reexporta cada dominio (workspace, task, list, folder, tag, member, documents) para consumo pelo servidor.
- O servidor (`src/server.ts:167`, `src/server.ts:224`) registra as definicoes no handler de `ListTools`, roteia chamadas em `CallTool` e aplica filtros de habilitacao via `isToolEnabled`.
- Os servicos ClickUp sao instanciados uma unica vez em `src/services/shared.ts:23` e `src/services/shared.ts:43`, reutilizando `createClickUpServices` para manter configuracoes e logs consistentes.
- O `sponsorService` (`src/utils/sponsor-service.ts`) padroniza envelopes de sucesso/erro; handlers delegam a ele para garantir formato consistente e mensagens opcionais de patrocinio.

## Estrutura de diretorios relevante
```
src/
  server.ts                 # Registro das tools e roteamento das chamadas MCP
  services/
    shared.ts               # Singleton de servicos expostos aos handlers
    clickup/
      index.ts              # Factory que instancia workspace, task, list, folder, tag, time e document
      base.ts               # Cliente Axios comum, fila de requisicoes e erros tipados
      workspace.ts          # Cache de arvore do workspace e resolucoes por nome
      list.ts               # CRUD de listas com integracao ao workspace
      folder.ts             # CRUD de pastas e busca associada
      tag.ts                # Operacoes com tags de espaco e tarefa
      document.ts           # Operacoes com docs e paginas
      time.ts               # Servico de time tracking
      bulk.ts               # Orquestrador de operacoes em lote
      types.ts              # Tipos fortes usados por todos os modulos
      task/
        task-core.ts        # CRUD basico, caches e utilidades
        task-service.ts     # Composicao das capacidades (search, tags, anexos etc.)
        task-search.ts      # Heuristicas de busca e filtros de workspace
        task-attachments.ts # Upload e resolucao de anexos
        task-comments.ts    # Operacoes de comentarios
        task-tags.ts        # Sincronizacao de tags
        task-custom-fields.ts # Acesso a campos customizados
  tools/
    index.ts                # Reexporta todos os dominios de tool
    utils.ts                # Ponte para utilidades de data/resolucao
    workspace.ts            # Tool de hierarquia de workspace
    list.ts                 # Tools e handlers de listas
    folder.ts               # Tools e handlers de pastas
    tag.ts                  # Tools de tags
    member.ts               # Tools de membros/assignees
    documents.ts            # Tools modulares para documentos (ativados por config)
    task/
      index.ts              # Hub de exports para o dominio de tarefas
      main.ts               # Wrapper de handlers com sponsorService
      handlers.ts           # Implementacoes de regras de negocio
      single-operations.ts  # Definicoes de tools para operacoes unitarias
      bulk-operations.ts    # Definicoes de tools em lote
      workspace-operations.ts # Definicoes ligadas a consultas no workspace
      attachments.ts        # Tool de anexos (definicao + handler)
      time-tracking.ts      # Definicoes + handlers de controle de tempo
      utilities.ts          # Validacoes, formatacao e resolucao de IDs
      attachments.types.ts  # Tipagem auxiliar
```

## Fluxo de registro e execucao
1. **Registro das definicoes:** `src/server.ts:167` adiciona todas as tools na resposta de `ListTools` e filtra com `isToolEnabled` para obedecer variaveis de ambiente.
2. **Chamada de tools:** o handler de `CallTool` (`src/server.ts:224`) usa um `switch` manual para acionar os handlers exportados por dominio, convertendo erros em codigos JSON-RPC padrao.
3. **Ativacao condicional:** `documentModule()` (`src/server.ts:144`) so inclui as tools de documentos quando `config.documentSupport === 'true'`.
4. **Servicos compartilhados:** `clickUpServices` (`src/services/shared.ts:43`) injeta `taskService`, `listService`, `workspaceService` e demais dependencias usadas pelos handlers MCP.

## Separacao de responsabilidades
- **Definicao vs handler:** cada tool declara `Tool` + `inputSchema` e associa os handlers correspondentes; dominios simples concentram tudo no mesmo arquivo.
- **Dominio de tarefas:** o subdiretorio `task/` divide definicoes (`single`, `bulk`, `workspace`, `attachments`, `time-tracking`) dos handlers centrais, mantendo regras de negocio consolidadas em `handlers.ts`.
- **Wrappers e respostas:** `task/main.ts:80` encapsula handlers com `createHandlerWrapper`, padronizando o uso do `sponsorService` e mensagens adicionais.
- **Reuso de validacoes:** funcoes em `task/utilities.ts`, `tools/member.ts` e `tools/list.ts` cruzam dominios para evitar duplicacao, reaproveitando caches e resolucoes de IDs.

## Servicos ClickUp
- **Factory e singleton:** `createClickUpServices` instancia workspace, task, list, folder, tag, timeTracking e document com injecoes cruzadas (`src/services/clickup/index.ts:71`), enquanto `getClickUpServices` garante instancia unica e audita configuracoes (`src/services/shared.ts:23`, `src/services/shared.ts:43`).
- **Base service e controle de taxa:** `BaseClickUpService` centraliza Axios, `ServiceResponse` e `ClickUpServiceError` com codigos tipados (`src/services/clickup/base.ts:20`, `src/services/clickup/base.ts:33`, `src/services/clickup/base.ts:100`); `makeRequest` aplica fila com espera adaptativa e captura de metadata (`src/services/clickup/base.ts:386`), alem de ganchos de log (`src/services/clickup/base.ts:501`, `src/services/clickup/base.ts:509`).
- **WorkspaceService:** mantem a arvore do workspace em cache e reconstrui a hierarquia em lotes para respeitar limites da API (`src/services/clickup/workspace.ts:29`, `src/services/clickup/workspace.ts:134`), fornecendo metodos de busca por nome usados pelos tools de listas, pastas e documentos.
- **Servicos de entidades:** `ListService`, `FolderService`, `ClickUpTagService` e `DocumentService` exibem CRUDs aderentes ao base service (`src/services/clickup/list.ts:24`, `src/services/clickup/list.ts:56`, `src/services/clickup/document.ts:30`), logando operacoes e convertendo falhas em `ClickUpServiceError`.
- **TaskService e submodulos:** `TaskServiceCore` adiciona caches de validacao (TTL de 5 minutos) e integracao com `ListService` (`src/services/clickup/task/task-core.ts:33`, `src/services/clickup/task/task-core.ts:45`, `src/services/clickup/task/task-core.ts:52`); `TaskService` compoe buscas, anexos, comentarios, tags e campos customizados sem heranca linear (`src/services/clickup/task/task-service.ts:39`). O modulo de busca aplica heuristicas de `isNameMatch` e controle de tokens (`src/services/clickup/task/task-search.ts:23`).
- **Servicos especializados:** `BulkService` aproveita `processBatch` para paralelizar criacao, atualizacao, movimento e exclusao em massa (`src/services/clickup/bulk.ts:24`), enquanto `TimeTrackingService` encapsula operacoes de tempo retornando `ServiceResponse` uniforme (`src/services/clickup/time.ts:109`).

## Destaques por dominio
- **Workspace (`workspace.ts`):** disponibiliza `get_workspace_hierarchy` e gera arvore textual com base no cache da `WorkspaceService`.
- **Listas e Pastas (`list.ts`, `folder.ts`):** definem ferramentas CRUD que consultam `WorkspaceService` para resolver IDs quando apenas nomes sao fornecidos.
- **Tags (`tag.ts`):** acopla listagem de tags de espaco e atualizacoes em tarefas aos metodos de `ClickUpTagService`.
- **Membros (`member.ts`):** oferece `get_workspace_members`, `find_member_by_name` e `resolve_assignees`, combinando busca aproximada e cache leve.
- **Tarefas (`task/`):** reusa validacoes, caches de contexto e `BulkService` para cobrir operacoes unitarias, em lote, anexos e time tracking em um unico dominio.
- **Documentos (`documents.ts`):** cobre criacao, listagem e edicao de paginas, ativando-se apenas quando `documentSupport` esta habilitado e reutilizando o lookup de workspace.

## Utilitarios complementares
- `src/tools/utils.ts` reexporta utilidades genericas de data e resolucao de listas para manter um ponto de entrada unico.
- `src/utils/date-utils.ts` e `src/utils/resolver-utils.ts` suportam parsing de linguagem natural e matching aproximado de nomes, utilizados por services e tools.
- `src/utils/token-utils.ts` e `src/services/clickup/types.ts:1` fornecem funcoes auxiliares e tipagem compartilhada para buscas e formatacao de respostas.
- `src/utils/concurrency-utils.ts` define `BatchResult` e opcoes de lote usadas tanto por `BulkService` quanto pelos handlers MCP.
- `src/utils/sponsor-service.ts` adiciona mensagens de patrocinio e estrutura consistente de `content`/`error` para o MCP.

## Consideracoes de configuracao e extensibilidade
- Variaveis `ENABLED_TOOLS` e `DISABLED_TOOLS` permitem ativar/desativar metodos sem alterar codigo, pois o filtro se aplica na listagem e na execucao.
- Novas tools devem declarar o objeto `Tool`, reutilizar servicos compartilhados e registrar o handler correspondente no `switch` de `src/server.ts`.
- Servicos adicionais podem ser plugados estendendo `BaseClickUpService` para herdar rate limiting, logs e conversao de erros.
- Para funcionalidades de tarefas, inclua a definicao no modulo apropriado, implemente a logica em `handlers.ts` quando for regra central e ajuste `main.ts` se precisar de wrapper especial.

## Pontos de atencao identificados
- O `switch` centralizado em `src/server.ts` facilita rastreabilidade, mas pode ser evoluido para um mapa `tool -> handler` reaproveitando os arrays exportados.
- A mistura de arquivos com definicao + handler (ex.: `documents.ts`, `time-tracking.ts`) e outros com separacao estrita pode ser padronizada.
- O cache de contexto de tarefas (`src/tools/task/handlers.ts:46`) depende de nomes exatos; cenarios com nomes duplicados podem reutilizar o ID errado durante a janela de 5 minutos.
- A fila de rate limiting do `BaseClickUpService` pode introduzir latencia acumulada; monitorar `requestSpacing` em ambientes de alto volume e ajustar quando necessario.
