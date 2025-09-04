import { SearchIndexClient, AzureKeyCredential } from '@azure/search-documents';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local', override: true });

const searchClient = new SearchIndexClient(
  process.env.AZURE_SEARCH_ENDPOINT || '',
  new AzureKeyCredential(process.env.AZURE_SEARCH_KEY || '')
);

const indexName = 'printcloud-knowledge';

const indexDefinition: any = {
  name: indexName,
  fields: [
    {
      name: 'id',
      type: 'Edm.String',
      key: true,
      searchable: false,
      filterable: true,
      retrievable: true,
      sortable: false,
      facetable: false,
    },
    {
      name: 'content',
      type: 'Edm.String',
      searchable: true,
      filterable: false,
      retrievable: true,
      sortable: false,
      facetable: false,
      analyzer: 'pt-br.microsoft',
    },
    {
      name: 'title',
      type: 'Edm.String',
      searchable: true,
      filterable: true,
      retrievable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: 'type',
      type: 'Edm.String',
      searchable: false,
      filterable: true,
      retrievable: true,
      sortable: false,
      facetable: true,
    },
    {
      name: 'department',
      type: 'Edm.String',
      searchable: false,
      filterable: true,
      retrievable: true,
      sortable: false,
      facetable: true,
    },
    {
      name: 'tags',
      type: 'Collection(Edm.String)',
      searchable: true,
      filterable: true,
      retrievable: true,
      sortable: false,
      facetable: true,
    },
    {
      name: 'metadata',
      type: 'Edm.String',
      searchable: true,
      filterable: false,
      retrievable: true,
      sortable: false,
      facetable: false,
    },
    {
      name: 'createdAt',
      type: 'Edm.DateTimeOffset',
      searchable: false,
      filterable: true,
      retrievable: true,
      sortable: true,
      facetable: false,
    },
  ],
  semantic: {
    configurations: [
      {
        name: 'printcloud-semantic-config',
        prioritizedFields: {
          titleField: {
            fieldName: 'title',
          },
          prioritizedContentFields: [
            {
              fieldName: 'content',
            },
          ],
          prioritizedKeywordsFields: [
            {
              fieldName: 'tags',
            },
          ],
        },
      },
    ],
  },
  suggesters: [
    {
      name: 'printcloud-suggester',
      searchMode: 'analyzingInfixMatching',
      sourceFields: ['title', 'content', 'tags'],
    },
  ],
};

async function createSearchIndex() {
  try {
    console.log('🔍 Criando índice do Azure Cognitive Search...');
    
    // Verificar se o índice já existe
    try {
      const existingIndex = await searchClient.getIndex(indexName);
      console.log(`ℹ️  Índice '${indexName}' já existe. Deletando para recriar...`);
      await searchClient.deleteIndex(indexName);
      console.log('🗑️  Índice deletado com sucesso.');
    } catch (error: any) {
      if (error.statusCode !== 404) {
        throw error;
      }
      console.log(`ℹ️  Índice '${indexName}' não existe. Criando novo...`);
    }

    // Criar o índice
    const result = await searchClient.createIndex(indexDefinition);
    console.log('✅ Índice criado com sucesso!');
    console.log(`📊 Nome do índice: ${result.name}`);
    console.log(`🔢 Campos: ${result.fields?.length}`);
    console.log('🎯 Configurações disponíveis:');
    console.log('   - Busca vetorial com embeddings');
    console.log('   - Busca semântica');
    console.log('   - Sugestões automáticas');
    console.log('   - Análise em português brasileiro');

    return result;
  } catch (error) {
    console.error('❌ Erro ao criar índice:', error);
    throw error;
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  createSearchIndex()
    .then(() => {
      console.log('🎉 Processo concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Processo falhou:', error);
      process.exit(1);
    });
}

export { createSearchIndex };