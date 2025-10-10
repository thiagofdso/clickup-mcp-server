/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * Sprint task tools
 */

export const getSprintTasksTool = {
  name: "get_sprint_tasks",
  description: `Recupera tarefas de sprint com prazo maior ou igual à data informada (formato dd/mm/yyyy). 
Inclui tarefas fechadas e subtarefas que atendam aos mesmos filtros e retorna prioridade, descrição em markdown, checklists, comentários, responsáveis, datas e tags.`,
  inputSchema: {
    type: "object",
    properties: {
      due_date_gt: {
        type: "string",
        description: "Data mínima (inclusive) no formato dd/mm/yyyy. A data é normalizada para 00:00."
      },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "Opcional: IDs de responsáveis a serem considerados. Se informado, evita buscar toda a equipe e usa esses IDs diretamente no filtro."
      },
      list_ids: {
        type: "array",
        items: { type: "string" },
        description: "Opcional: IDs de listas para restringir a busca. Quando informado, o serviço consulta apenas estas listas."
      },
      comments: {
        type: "boolean",
        description: "Define se os comentários das tarefas devem ser recuperados. Padrão: false.",
        default: false
      },
      includeSubtasks: {
        type: "boolean",
        description: "Quando true (padrão), inclui subtarefas na consulta e monta a hierarquia completa.",
        default: true
      }
    },
    required: ["due_date_gt"]
  }
};

export const sprintTaskTools = [
  getSprintTasksTool
];
