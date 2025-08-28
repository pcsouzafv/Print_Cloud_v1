@echo off
echo 🐳 Iniciando ambiente Docker do Print Cloud...

REM Verificar se Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker Desktop.
    pause
    exit /b 1
)

REM Parar containers existentes se houver
echo 🛑 Parando containers existentes...
docker-compose down

REM Construir e iniciar os serviços
echo 🔨 Construindo containers...
docker-compose build

echo 🚀 Iniciando serviços...
docker-compose up -d postgres redis

REM Aguardar PostgreSQL estar pronto
echo ⏳ Aguardando PostgreSQL estar pronto...
:wait_postgres
docker-compose exec postgres pg_isready -U printcloud -d printcloud >nul 2>&1
if errorlevel 1 (
    echo Aguardando PostgreSQL...
    timeout /t 2 >nul
    goto wait_postgres
)

echo ✅ PostgreSQL está pronto!

REM Executar migrations
echo 🗄️ Executando migrations do banco...
docker-compose run --rm app npx prisma migrate deploy

REM Executar seed
echo 🌱 Populando banco com dados de teste...
docker-compose run --rm app npm run db:seed

REM Iniciar aplicação
echo 🚀 Iniciando aplicação...
docker-compose up -d app

echo.
echo 🎉 Ambiente Docker iniciado com sucesso!
echo.
echo 📋 Serviços disponíveis:
echo 🌐 Aplicação: http://localhost:3000
echo 🗄️ Adminer (DB): http://localhost:8080
echo    - Sistema: PostgreSQL
echo    - Servidor: postgres
echo    - Usuário: printcloud
echo    - Senha: printcloud123
echo    - Base: printcloud
echo.
echo 📊 Para ver logs:
echo docker-compose logs -f app
echo.
echo 🛑 Para parar:
echo docker-compose down
echo.
pause