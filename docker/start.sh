#!/bin/bash

echo "🐳 Iniciando ambiente Docker do Print Cloud..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

# Parar containers existentes se houver
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e iniciar os serviços
echo "🔨 Construindo containers..."
docker-compose build

echo "🚀 Iniciando serviços..."
docker-compose up -d postgres redis

# Aguardar PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL estar pronto..."
until docker-compose exec postgres pg_isready -U printcloud -d printcloud > /dev/null 2>&1; do
    echo "Aguardando PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL está pronto!"

# Executar migrations
echo "🗄️ Executando migrations do banco..."
docker-compose run --rm app npx prisma migrate deploy

# Executar seed
echo "🌱 Populando banco com dados de teste..."
docker-compose run --rm app npm run db:seed

# Iniciar aplicação
echo "🚀 Iniciando aplicação..."
docker-compose up -d app

echo ""
echo "🎉 Ambiente Docker iniciado com sucesso!"
echo ""
echo "📋 Serviços disponíveis:"
echo "🌐 Aplicação: http://localhost:3000"
echo "🗄️ Adminer (DB): http://localhost:8080"
echo "   - Sistema: PostgreSQL"
echo "   - Servidor: postgres"
echo "   - Usuário: printcloud"
echo "   - Senha: printcloud123"
echo "   - Base: printcloud"
echo ""
echo "📊 Para ver logs:"
echo "docker-compose logs -f app"
echo ""
echo "🛑 Para parar:"
echo "docker-compose down"