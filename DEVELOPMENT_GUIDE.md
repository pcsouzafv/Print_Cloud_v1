# 🛠️ Guia de Desenvolvimento - Print Cloud

## 📋 Visão Geral

Este guia fornece instruções detalhadas para desenvolvedores que desejam contribuir ou modificar o Print Cloud, incluindo setup do ambiente, estrutura de código, e boas práticas.

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios
```
Print_Cloud_v1/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── ai/           # Endpoints IA
│   │   │   ├── auth/         # Autenticação
│   │   │   ├── printers/     # Gestão impressoras
│   │   │   └── users/        # Gestão usuários
│   │   └── globals.css       # Estilos globais
│   ├── components/           # Componentes React
│   │   ├── ai/              # Componentes IA
│   │   ├── dashboard/       # Dashboard
│   │   ├── printers/        # Gestão impressoras
│   │   ├── users/           # Gestão usuários
│   │   └── ui/              # Componentes base
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── prisma.ts        # Cliente Prisma
│   │   ├── azure-ai.ts      # Cliente Azure AI
│   │   └── mock-ai.ts       # Sistema fallback
│   └── types/               # Definições TypeScript
├── prisma/                  # Schema e migrations
├── docker/                  # Configuração Docker
├── azure/                   # Scripts de deploy Azure
└── scripts/                 # Scripts de migração
```

### Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Azure AD (MSAL)
- **IA**: Azure OpenAI + Text Analytics
- **Deploy**: Docker + Azure Container Apps

## 🚀 Setup de Desenvolvimento

### Pré-requisitos
```bash
node -v    # v18.0.0+
npm -v     # 9.0.0+
git --version
docker --version  # Para testes locais
```

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/print-cloud-v1.git
   cd print-cloud-v1
   ```

2. **Instale dependências**
   ```bash
   npm install
   ```

3. **Configure ambiente de desenvolvimento**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure o banco de dados**
   ```bash
   # SQLite para desenvolvimento (padrão em .env.local)
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Inicie o servidor**
   ```bash
   npm run dev
   # Aplicação disponível em http://localhost:3000
   ```

## 🗄️ Banco de Dados

### Schema Principal

```prisma
model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String
  department    String
  role          Role         @default(USER)
  printJobs     PrintJob[]
  printQuotas   PrintQuota[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Printer {
  id            String       @id @default(cuid())
  name          String
  location      String
  department    String
  isColorPrinter Boolean     @default(false)
  status        PrinterStatus @default(ACTIVE)
  monthlyQuota  Int?
  printJobs     PrintJob[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model PrintJob {
  id          String    @id @default(cuid())
  userId      String
  printerId   String
  fileName    String
  pages       Int
  copies      Int       @default(1)
  isColor     Boolean   @default(false)
  cost        Float
  status      JobStatus @default(PENDING)
  submittedAt DateTime  @default(now())
  processedAt DateTime?
  
  user        User      @relation(fields: [userId], references: [id])
  printer     Printer   @relation(fields: [printerId], references: [id])
}
```

### Migrations

```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Reset do banco (desenvolvimento)
npx prisma migrate reset
```

### Seed Data

O arquivo `prisma/seed.ts` popula o banco com dados de teste:

```bash
npm run db:seed
```

## 🎨 Frontend Development

### Estrutura de Componentes

```typescript
// src/components/exemplo/exemplo.tsx
import { useState } from 'react';

interface ExemploProps {
  titulo: string;
  dados?: any[];
}

export function Exemplo({ titulo, dados = [] }: ExemploProps) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{titulo}</h2>
      {/* Conteúdo do componente */}
    </div>
  );
}
```

### Padrões de Estilo

**Tailwind Classes Comuns:**
```css
/* Layout */
.container = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
.card = "bg-white rounded-lg shadow border p-6"

/* Estados */
.btn-primary = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
.btn-secondary = "bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"

/* Utilitários */
.loading = "animate-pulse bg-gray-200 rounded"
.error = "text-red-600 bg-red-50 border border-red-200 rounded p-3"
```

### Estado e Hooks

```typescript
// Hook personalizado exemplo
import { useState, useEffect } from 'react';

export function usePrinters() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrinters() {
      try {
        setLoading(true);
        const response = await fetch('/api/printers');
        const data = await response.json();
        setPrinters(data.printers);
      } catch (err) {
        setError('Erro ao carregar impressoras');
      } finally {
        setLoading(false);
      }
    }

    fetchPrinters();
  }, []);

  return { printers, loading, error };
}
```

## 🔌 Backend Development

### API Routes Padrão

```typescript
// src/app/api/exemplo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const data = await prisma.model.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: await prisma.model.count(),
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação
    if (!body.name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const data = await prisma.model.create({
      data: body,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Utilitários Comuns

```typescript
// src/lib/api-client.ts
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

## 🤖 Desenvolvimento IA

### Adicionando Nova Funcionalidade IA

1. **API Route**
   ```typescript
   // src/app/api/ai/nova-funcionalidade/route.ts
   export const dynamic = 'force-dynamic';

   export async function GET(request: NextRequest) {
     // Implementar lógica
     if (isAzureAIConfigured()) {
       // Usar Azure AI
     } else {
       // Usar mock data
     }
   }
   ```

2. **Azure AI Service**
   ```typescript
   // src/lib/azure-ai.ts
   export async function novaFuncionalidadeAI(params: any) {
     // Implementar chamada Azure AI
   }
   ```

3. **Mock Fallback**
   ```typescript
   // src/lib/mock-ai.ts
   export function getMockNovaFuncionalidade() {
     return {
       // Dados simulados inteligentes
     };
   }
   ```

4. **Componente Frontend**
   ```typescript
   // src/components/ai/nova-funcionalidade.tsx
   export function NovaFuncionalidade() {
     // Implementar UI
   }
   ```

## 🧪 Testes

### Setup de Testes

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Exemplo de Teste

```typescript
// src/components/__tests__/exemplo.test.tsx
import { render, screen } from '@testing-library/react';
import { Exemplo } from '../exemplo/exemplo';

describe('Exemplo Component', () => {
  it('renders correctly', () => {
    render(<Exemplo titulo="Teste" />);
    expect(screen.getByText('Teste')).toBeInTheDocument();
  });
});
```

### Testes API

```typescript
// src/app/api/__tests__/exemplo.test.ts
import { GET } from '../exemplo/route';
import { NextRequest } from 'next/server';

describe('/api/exemplo', () => {
  it('returns data successfully', async () => {
    const request = new NextRequest('http://localhost/api/exemplo');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
  });
});
```

## 🚀 Build e Deploy

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Servidor produção
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run db:seed      # Popular banco
npm run db:studio    # Prisma Studio
```

### Docker Development

```bash
# Build da imagem
docker build -t printcloud .

# Executar localmente
docker run -p 3000:3000 printcloud

# Docker Compose (completo)
docker-compose up -d
```

### Azure Deploy

```bash
# Deploy automático
azure/scripts/deploy.bat

# Deploy manual
az containerapp up \
  --source . \
  --name printcloud-app \
  --resource-group rg-printcloud \
  --environment printcloud-env
```

## 🔧 Configurações

### TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ESLint

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

### Prettier

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 📊 Performance e Otimização

### Next.js Otimizações

```typescript
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};
```

### Lazy Loading

```typescript
import dynamic from 'next/dynamic';

const ComponentePesado = dynamic(
  () => import('./componente-pesado'),
  { 
    loading: () => <p>Carregando...</p>,
    ssr: false 
  }
);
```

### Memoização

```typescript
import { memo, useMemo } from 'react';

export const ComponenteOtimizado = memo(({ dados }) => {
  const dadosProcessados = useMemo(() => {
    return dados.map(item => processarItem(item));
  }, [dados]);

  return <div>{/* renderização */}</div>;
});
```

## 🐛 Debug e Troubleshooting

### Logs Úteis

```typescript
// Configuração de logs
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 20) + '...');
console.log('Azure AI Configured:', isAzureAIConfigured());
```

### Problemas Comuns

1. **Erro de Build - Dynamic Server Usage**
   ```typescript
   // Solução: Adicionar em API routes
   export const dynamic = 'force-dynamic';
   ```

2. **Prisma Connection Issues**
   ```bash
   # Regenerar cliente
   npx prisma generate
   
   # Reset do banco
   npx prisma migrate reset
   ```

3. **Azure AI Timeouts**
   ```typescript
   // Aumentar timeout
   const controller = new AbortController();
   setTimeout(() => controller.abort(), 10000);
   ```

## 🤝 Boas Práticas

### Código

- Use TypeScript para toda nova funcionalidade
- Implemente error boundaries para componentes React
- Valide dados de entrada em API routes
- Use environment variables para configurações
- Documente APIs com comentários JSDoc

### Git

```bash
# Branches
feature/nova-funcionalidade
bugfix/corrigir-problema
hotfix/urgente

# Commits
feat: adicionar nova funcionalidade
fix: corrigir bug específico
docs: atualizar documentação
refactor: refatorar código existente
```

### Segurança

- Nunca commite credenciais
- Valide e sanitize inputs
- Use HTTPS em produção
- Implemente rate limiting
- Monitore logs de segurança

---

**Happy Coding!** 🚀

Para dúvidas específicas, consulte a documentação individual de cada tecnologia ou abra uma issue no repositório.