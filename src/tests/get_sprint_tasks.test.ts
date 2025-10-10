import dotenv from 'dotenv';
import assert from 'assert';
import { writeFileSync } from 'fs';

import { createClickUpServices } from '../services/clickup/index.js';
import { parseDueDate } from '../utils/date-utils.js';

dotenv.config();

async function testGetSprintTasks() {
  console.log('Iniciando teste de integração para get_sprint_tasks...');

  const apiKey = process.env.CLICKUP_API_KEY;
  const teamId = process.env.CLICKUP_TEAM_ID;

  if (!apiKey || !teamId) {
    console.error('Erro: defina CLICKUP_API_KEY e CLICKUP_TEAM_ID no ambiente antes de executar o teste.');
    process.exit(1);
  }

  const params = {
    dueDateString: '29/09/2025',
    //listIds: ['901110298672', '901109334014'],
    assigneeIds: ['81476929']
    //includeComments: false,
    //includeSubtasks: true
  };

  const dueDateTimestamp = parseDueDate(params.dueDateString, { defaultTime: 'start' });

  assert(dueDateTimestamp !== undefined, `Falha ao converter data ${params.dueDateString}`);

  const services = createClickUpServices({ apiKey, teamId });

  try {
    const result = await services.sprint.getSprintTasks({
      dueDateTimestamp: dueDateTimestamp!,
      //listIds: params.listIds.length ? params.listIds : undefined,
      assigneeIds: params.assigneeIds.length ? params.assigneeIds : undefined
      /*includeComments: params.includeComments,
      includeSubtasks: params.includeSubtasks*/
    });

    console.log('Resultado obtido:');
    const serialized = JSON.stringify({
      params: {
        due_date_gt: params.dueDateString,
        //list_ids: params.listIds,
        assignee_ids: params.assigneeIds
        /*include_comments: params.includeComments,
        include_subtasks: params.includeSubtasks*/
      },
      result
    }, null, 2);
    console.log(serialized);

    writeFileSync('sprint-teste.txt', serialized, { encoding: 'utf8' });

    assert(result.metadata !== undefined, 'O resultado deve conter metadados.');
    assert(Array.isArray(result.tasks), 'A propriedade tasks deve ser um array.');

    console.log('Teste de integração get_sprint_tasks concluído com sucesso.');
  } catch (error) {
    console.error('O teste de integração get_sprint_tasks falhou:', error);
    process.exit(1);
  }
}

testGetSprintTasks();
