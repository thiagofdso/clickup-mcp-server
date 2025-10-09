
import dotenv from 'dotenv';
import { WorkspaceService } from './workspace.js';
import assert from 'assert';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

async function testGetWorkspaceMembers() {
  console.log('Iniciando teste de integração para getWorkspaceMembers...');

  // Obter credenciais das variáveis de ambiente
  const apiKey = process.env.CLICKUP_API_KEY;
  const teamId = process.env.CLICKUP_TEAM_ID;

  // Validar se as credenciais foram fornecidas
  if (!apiKey || !teamId) {
    console.error('Erro: As variáveis de ambiente CLICKUP_API_KEY e CLICKUP_TEAM_ID devem ser definidas.');
    process.exit(1);
  }

  try {
    // Instanciar o serviço
    const workspaceService = new WorkspaceService(apiKey, teamId);

    // Chamar o método
    const members = await workspaceService.getWorkspaceMembers();

    // Exibir os resultados no console
    console.log(`Sucesso! ${members.length} membros encontrados no workspace.`);
    console.log('--------------------------------------------------');
    console.log('Membros:');
    console.log(JSON.stringify(members, null, 2));
    console.log('--------------------------------------------------');
    
    // Adicionar asserções básicas
    assert(Array.isArray(members), 'A resposta deveria ser um array.');
    if (members.length > 0) {
        const firstMember = members[0];
        assert(firstMember.hasOwnProperty('id'), 'O membro deve ter uma propriedade "id".');
        assert(firstMember.hasOwnProperty('name'), 'O membro deve ter uma propriedade "name".');
        assert(firstMember.hasOwnProperty('email'), 'O membro deve ter uma propriedade "email".');
    }
    
    console.log('Teste de integração concluído com sucesso!');

  } catch (error) {
    console.error('O teste de integração falhou:', error);
    process.exit(1);
  }
}

// Executar o teste
testGetWorkspaceMembers();
