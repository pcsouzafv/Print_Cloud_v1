#!/bin/bash

# Script robusto para setup do banco no Azure Container Apps
# Incluí verificações de conectividade e retry logic

set -e  # Parar se qualquer comando falhar

echo "🚀 Iniciando setup do banco de dados..."

# Função para verificar se o banco está acessível
check_database() {
    echo "🔍 Verificando conectividade com banco..."
    npx prisma db execute --stdin <<< "SELECT 1;" >/dev/null 2>&1
}

# Função para executar com retry
retry_command() {
    local cmd="$1"
    local desc="$2"
    local max_attempts=5
    local attempt=1
    
    echo "⚡ $desc..."
    
    while [ $attempt -le $max_attempts ]; do
        echo "📍 Tentativa $attempt/$max_attempts"
        
        if eval "$cmd"; then
            echo "✅ $desc - Sucesso!"
            return 0
        else
            echo "⚠️  $desc - Falhou (tentativa $attempt/$max_attempts)"
            
            if [ $attempt -eq $max_attempts ]; then
                echo "❌ $desc - Falhou após $max_attempts tentativas"
                return 1
            fi
            
            echo "⏳ Aguardando 10 segundos antes da próxima tentativa..."
            sleep 10
            attempt=$((attempt + 1))
        fi
    done
}

# Aguardar o banco ficar disponível
echo "⏳ Aguardando banco de dados ficar disponível..."
for i in {1..30}; do
    if check_database; then
        echo "✅ Banco de dados acessível!"
        break
    else
        echo "⏳ Banco não acessível, aguardando... ($i/30)"
        sleep 2
        
        if [ $i -eq 30 ]; then
            echo "❌ Timeout: Banco de dados não ficou acessível em 60 segundos"
            exit 1
        fi
    fi
done

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Setup do schema com retry
retry_command "npx prisma db push --accept-data-loss" "Setup do schema do banco"

# Seed do banco com retry
echo "🌱 Tentando seed via npm primeiro..."
if ! retry_command "npm run db:seed" "Seed do banco com dados de análise"; then
    echo "⚠️ npm run db:seed falhou, tentando via API..."
    
    # Tentar via API como fallback
    echo "🔄 Executando seed via API interna..."
    if curl -X POST http://localhost:3000/api/admin/seed -H "Content-Type: application/json" > /dev/null 2>&1; then
        echo "✅ Seed executado via API com sucesso"
    else
        echo "❌ Seed via API também falhou"
        return 1
    fi
fi

# Verificação final
echo "🔍 Verificação final - contando registros..."

# Executar queries de verificação
npx prisma db execute --stdin <<EOF | head -20
SELECT 
  'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 
  'departments' as tabela, COUNT(*) as total FROM departments  
UNION ALL
SELECT 
  'printers' as tabela, COUNT(*) as total FROM printers
UNION ALL
SELECT 
  'print_jobs' as tabela, COUNT(*) as total FROM print_jobs
UNION ALL
SELECT 
  'print_quotas' as tabela, COUNT(*) as total FROM print_quotas
UNION ALL
SELECT 
  'audit_logs' as tabela, COUNT(*) as total FROM audit_logs;
EOF

echo ""
echo "🎉 Setup do banco concluído com sucesso!"
echo "🤖 PrintBot pronto para analisar dados!"
echo "📊 Dados disponíveis na aplicação Azure!"