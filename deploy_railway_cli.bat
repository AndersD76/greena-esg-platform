@echo off
chcp 65001 >nul
echo ========================================
echo Railway Deploy - GREENA ESG Platform
echo ========================================
echo.

cd /d "e:\APPS EM DESENVOLVIMENTO\App Greena"

echo Verificando autenticacao Railway...
railway whoami
if errorlevel 1 (
    echo.
    echo ERRO: Nao autenticado no Railway
    echo Execute: railway login
    pause
    exit /b 1
)

echo.
echo ========================================
echo CRIANDO SERVICO BACKEND
echo ========================================
echo.

cd backend
echo Inicializando projeto Railway no backend...
railway init --name "greena-backend"

echo.
echo Configurando variaveis de ambiente...
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_YkjKCEgq9w4b@ep-shiny-dust-achm2ulc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
railway variables set NODE_ENV="production"
railway variables set JWT_SECRET="greena_jwt_secret_2024_production_key_secure"
railway variables set JWT_REFRESH_SECRET="greena_jwt_refresh_secret_2024_production_key_secure"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set JWT_REFRESH_EXPIRES_IN="30d"
railway variables set CORS_ORIGIN="*"
railway variables set PORT="3000"

echo.
echo Fazendo deploy do backend...
railway up

echo.
echo ========================================
echo CRIANDO SERVICO FRONTEND
echo ========================================
echo.

cd ..\frontend
echo Inicializando projeto Railway no frontend...
railway init --name "greena-frontend"

echo.
echo Configurando variavel de ambiente...
echo ATENCAO: Voce precisara atualizar VITE_API_URL com a URL do backend!
railway variables set VITE_API_URL="https://BACKEND-URL-AQUI.up.railway.app"

echo.
echo Fazendo deploy do frontend...
railway up

echo.
echo ========================================
echo DEPLOY CONCLUIDO!
echo ========================================
echo.
echo Proximos passos:
echo 1. Obtenha a URL do backend: railway domain
echo 2. Atualize VITE_API_URL no frontend com a URL do backend
echo 3. Atualize CORS_ORIGIN no backend com a URL do frontend
echo.
echo Acesse: https://railway.app/dashboard
echo.
pause
