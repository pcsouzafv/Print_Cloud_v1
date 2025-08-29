# Print Cloud - Sistema de Gestão de Impressoras

Sistema completo de gestão de impressoras e bilhetagem empresarial integrado com Azure Active Directory.

## 🚀 Funcionalidades

### 📊 Dashboard Executivo
- Visão geral das impressoras e uso
- Estatísticas em tempo real
- Monitoramento de custos
- Alertas de manutenção

### 🖨️ Gestão de Impressoras
- Cadastro e configuração de impressoras
- Monitoramento de status (Ativa, Manutenção, Erro)
- Controle de cotas mensais
- Suporte para impressoras coloridas e P&B
- Localização e departamento

### 👥 Gestão de Usuários
- Integração completa com Azure AD
- Controle de cotas individuais (P&B e colorida)
- Diferentes níveis de permissão (Admin, Gerente, Usuário)
- Monitoramento de uso e custos

### 💰 Sistema de Bilhetagem
- Controle de impressões por usuário
- Cálculo automático de custos
- Cotas departamentais
- Relatórios de consumo

### 🔐 Segurança e Autenticação
- Login único com Microsoft/Azure AD
- Controle de acesso baseado em grupos
- Auditoria completa de ações

### 📈 Relatórios e Analytics
- Relatórios de uso por departamento
- Análise de custos
- Histórico de impressões
- Tendências de consumo

### 🤖 Assistente Inteligente com IA
- **Chatbot conversacional** integrado no dashboard
- **Análise inteligente** de padrões de impressão
- **Recomendações personalizadas** para otimização de custos
- **Insights automáticos** sobre sustentabilidade e eficiência
- Powered by **Azure OpenAI Service** e **Azure Text Analytics**

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones

### Backend
- **Next.js API Routes** - API REST
- **Prisma** - ORM e migrations
- **PostgreSQL** - Banco de dados

### Autenticação & IA
- **Microsoft Authentication Library (MSAL)** - Azure AD
- **Azure AD B2B/B2C** - Gerenciamento de usuários
- **Azure OpenAI Service** - Assistente IA conversacional
- **Azure Text Analytics** - Análise de sentimento e padrões

### Infraestrutura
- **Azure Container Apps** - Deploy e hospedagem
- **Azure Database for PostgreSQL** - Banco em produção
- **Docker** - Containerização para desenvolvimento

## 🚀 Instalação e Configuração

### 🐳 Opção 1: Docker (Recomendado para Testes)

**Pré-requisitos:**
- Docker Desktop instalado
- 4GB RAM disponível

**Início rápido:**
```bash
# Windows
docker\start.bat

# Linux/MacOS
chmod +x docker/start.sh && ./docker/start.sh
```

**Recursos incluídos:**
- 🌐 Aplicação completa em `http://localhost:3000`
- 🤖 **Assistente IA integrado** (dados simulados)
- 🗄️ Base de dados PostgreSQL + Redis
- 📊 Dashboard com análises inteligentes

📖 **[Guia completo Docker](DOCKER.md)**

---

### 💻 Opção 2: Instalação Local

**Pré-requisitos:**
- Node.js 18 ou superior
- PostgreSQL 12 ou superior
- Conta Azure com Azure AD configurado

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/print-cloud-v1.git
cd print-cloud-v1
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/printcloud?schema=public"

# Azure AD Configuration
NEXT_PUBLIC_AZURE_AD_CLIENT_ID="your-azure-ad-client-id"
NEXT_PUBLIC_AZURE_AD_TENANT_ID="your-azure-ad-tenant-id"

# Azure AI Services (Opcional - sem configuração usa dados simulados)
AZURE_OPENAI_ENDPOINT="https://seu-openai.openai.azure.com/"
AZURE_OPENAI_API_KEY="sua-api-key"
AZURE_TEXT_ANALYTICS_ENDPOINT="https://seu-text-analytics.cognitiveservices.azure.com/"
AZURE_TEXT_ANALYTICS_API_KEY="sua-api-key"
```

### 4. Configure o banco de dados
```bash
# Execute as migrations
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate

# (Opcional) Popule com dados de exemplo
npx prisma db seed
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🔧 Configuração do Azure AD

### 1. Registre a aplicação no Azure Portal
1. Acesse [Azure Portal](https://portal.azure.com)
2. Vá para "Azure Active Directory" > "App registrations"
3. Clique em "New registration"
4. Configure:
   - Name: "Print Cloud"
   - Redirect URI: `http://localhost:3000` (desenvolvimento)

### 2. Configure as permissões
Na seção "API permissions", adicione:
- `User.Read` (Microsoft Graph)
- `Group.Read.All` (Microsoft Graph)

### 3. Obtenha as credenciais
- **Application (client) ID**: Use como `NEXT_PUBLIC_AZURE_AD_CLIENT_ID`
- **Directory (tenant) ID**: Use como `NEXT_PUBLIC_AZURE_AD_TENANT_ID`

## 📊 Estrutura do Banco de Dados

### Principais Entidades
- **Users**: Usuários sincronizados com Azure AD
- **Printers**: Impressoras cadastradas no sistema
- **PrintJobs**: Histórico de impressões
- **PrintQuotas**: Cotas dos usuários
- **Departments**: Departamentos da empresa
- **AuditLogs**: Log de auditoria

### Relacionamentos
- Usuário pode ter múltiplos trabalhos de impressão
- Impressora pode processar múltiplos trabalhos
- Cada usuário tem uma cota de impressão
- Departamentos têm custos específicos por página

## ☁️ Deploy na Azure

### 🚀 Deploy Rápido

**Pré-requisitos:**
- Subscription Azure ativa
- Azure CLI instalado
- Aplicação registrada no Azure AD

**Deploy automático:**
```bash
# Configurar credenciais Azure AD
export AZURE_AD_CLIENT_ID="seu-client-id"
export AZURE_AD_TENANT_ID="seu-tenant-id"

# Opcional: Configurar serviços de IA para funcionalidade completa
export AZURE_OPENAI_ENDPOINT="https://seu-openai.openai.azure.com/"
export AZURE_OPENAI_API_KEY="sua-api-key"

# Windows
azure\scripts\deploy.bat

# Linux/MacOS
chmod +x azure/scripts/deploy.sh && ./azure/scripts/deploy.sh
```

📖 **[Guia completo Azure](AZURE.md)** | **[Setup inicial](azure/SETUP.md)**

### 🏗️ Arquitetura Azure

```
Azure AD ←→ Container Apps ←→ PostgreSQL + Redis + Key Vault
```

**Serviços utilizados:**
- **Azure Container Apps** - Hospedagem da aplicação
- **Azure Database for PostgreSQL** - Banco de dados
- **Azure Cache for Redis** - Cache e sessões  
- **Azure Container Registry** - Registry de imagens
- **Azure Key Vault** - Gerenciamento de segredos
- **Azure OpenAI Service** - IA conversacional
- **Azure Text Analytics** - Análise inteligente
- **Azure Front Door** - CDN + WAF (produção)

**Custo estimado:** ~$170-240/mês

---

## 🎯 Roadmap

### Fase 1 - Funcionalidades Básicas ✅
- [x] Autenticação Azure AD
- [x] Gestão de impressoras com descoberta por IP
- [x] Gestão de usuários com interface completa
- [x] Dashboard básico
- [x] Sistema de cotas
- [x] **📊 Relatórios avançados com APIs reais**
- [x] **⚙️ Sistema de configurações persistentes**
- [x] Deploy Docker local
- [x] Deploy Azure Cloud
- [x] **🤖 Assistente IA conversacional**
- [x] **📊 Análises inteligentes e recomendações**

### Fase 2 - Bilhetagem Avançada
- [ ] API de integração com impressoras
- [ ] Captura automática de jobs
- [ ] Relatórios avançados
- [ ] Notificações automáticas
- [ ] Application Insights
- [ ] **🧠 IA preditiva para manutenção**
- [ ] **📈 Análise de tendências com ML**

### Fase 3 - Enterprise
- [ ] Multi-tenancy
- [ ] API para integrações externas
- [ ] Mobile app
- [ ] Integração com sistemas de RH

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte, envie um email para suporte@printcloud.com ou abra uma issue no GitHub.

---

**Print Cloud** - Transformando a gestão de impressão empresarial 🚀