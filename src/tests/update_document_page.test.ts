// Ensure required configuration values exist before importing modules that depend on them
process.env.CLICKUP_API_KEY = process.env.CLICKUP_API_KEY || 'test-api-key';
process.env.CLICKUP_TEAM_ID = process.env.CLICKUP_TEAM_ID || 'test-team-id';
process.env.DOCUMENT_SUPPORT = process.env.DOCUMENT_SUPPORT || 'true';

import assert from 'assert';

import type { UpdateDocumentPageData } from '../services/clickup/types.js';

class MockDocumentService {
  public calls: Array<{ documentId: string; pageId: string; data: UpdateDocumentPageData }> = [];

  async updatePage(documentId: string, pageId: string, data: UpdateDocumentPageData) {
    this.calls.push({ documentId, pageId, data });
    return {
      id: pageId,
      document_id: documentId,
      name: data.name,
      sub_title: data.sub_title,
      content: data.content,
      content_format: data.content_format ?? 'text/md',
      content_edit_mode: data.content_edit_mode ?? 'append'
    };
  }
}

async function run() {
  const { handleUpdateDocumentPage } = await import('../tools/documents.js');

  const documentId = '8cjfgwf-2251';
  const pageId = '8cjfgwf-1371';
  const content = `# Avisos
*   
# Retrospectiva
*   
## [@Arilton Tadeu dos Santos Amaral](#user_mention#81476912)
1. Atividade A
    1. Detalhamentos
2. Atividade B
    1. Detalhamentos

## [@Filipe C\u00E9sar Sucupira Maciel](#user_mention#81511149)
1. Atividade A
    1. Detalhamentos
2. Atividade B
    1. Detalhamentos

## [@Gabriel de Sousa Araujo](#user_mention#81479429)
1. Atividade A
    1. Detalhamentos
2. Atividade B
    1. Detalhamentos

## [@Jorge Santos da Cruz Junior](#user_mention#230653792)
1. Atividade A
    1. Detalhamentos
2. Atividade B
    1. Detalhamentos

## [@M\u00E1rio Augusto Fonseca Gomes](#user_mention#81483133)
1. Atividade A
    1. Detalhamentos
2. Atividade B
    1. Detalhamentos

## [@Michel Rocha Jaime](#user_mention#81483134)
1. Atividade A
    1. Detalhamentos
2. Atividade B
    1. Detalhamentos

## [@Thiago Fernandes da Silva Oliveira](#user_mention#81476929)

\u25B6\uFE0F Em andamento
1. Apoiar GERIN em an\u00E1lise de problema no elasticsearch de desenvolvimento
2. Revisar coment\u00E1rios nos documentos do MNP de Nuvem e apresenta\u00E7\u00E3o de pap\u00E9is`;

  const mockDocumentService = new MockDocumentService();
  const services: any = { document: mockDocumentService };

  const response = await handleUpdateDocumentPage(services, {
    documentId,
    pageId,
    content
  });

  assert.strictEqual(mockDocumentService.calls.length, 1, 'updatePage deve ser chamado uma vez');

  const call = mockDocumentService.calls[0];
  assert.strictEqual(call.documentId, documentId, 'documentId deve ser encaminhado corretamente');
  assert.strictEqual(call.pageId, pageId, 'pageId deve ser encaminhado corretamente');
  assert.deepStrictEqual(call.data, { content }, 'O payload enviado deve conter apenas o conte\u00FAdo fornecido');

  assert(Array.isArray(response.content), 'A resposta deve seguir o formato Model Context Protocol');
  assert(response.content.length > 0, 'A resposta deve incluir ao menos um item de conte\u00FAdo');

  const resultPayload = JSON.parse(response.content[0].text);
  assert.strictEqual(resultPayload.message, 'Page updated successfully', 'A mensagem de sucesso deve ser retornada');

  console.log('Teste update_document_page executado com sucesso.');
}

run().catch(error => {
  console.error('Teste update_document_page falhou:', error);
  process.exit(1);
});
