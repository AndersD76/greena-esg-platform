#!/bin/bash

echo "🚀 GREENA ESG - Deploy Automático para Railway + Neon"
echo "======================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI não está instalado!${NC}"
    echo ""
    echo "Instalando Railway CLI..."
    npm install -g @railway/cli
    echo -e "${GREEN}✅ Railway CLI instalado!${NC}"
fi

echo ""
echo -e "${YELLOW}📝 PASSO 1: Login no Railway${NC}"
railway login

echo ""
echo -e "${YELLOW}🗄️ PASSO 2: Configurar Neon Database${NC}"
echo ""
echo "Por favor, siga estes passos:"
echo "1. Acesse: https://neon.tech"
echo "2. Crie um projeto chamado 'greena-esg'"
echo "3. Copie a Connection String"
echo ""
read -p "Cole a CONNECTION STRING do Neon aqui: " DATABASE_URL

# Validar URL
if [[ ! $DATABASE_URL =~ ^postgresql:// ]]; then
    echo -e "${RED}❌ URL inválida! Deve começar com postgresql://${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Connection String configurada!${NC}"

echo ""
echo -e "${YELLOW}🔐 PASSO 3: Gerar secrets seguros${NC}"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✅ Secrets gerados!${NC}"

echo ""
echo -e "${YELLOW}🚀 PASSO 4: Deploy do BACKEND${NC}"
cd backend

# Criar projeto no Railway
railway init --name greena-backend

# Configurar variáveis de ambiente
echo "Configurando variáveis de ambiente..."
railway variables set DATABASE_URL="$DATABASE_URL"
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
railway variables set JWT_EXPIRES_IN="24h"
railway variables set JWT_REFRESH_EXPIRES_IN="7d"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"

echo -e "${GREEN}✅ Variáveis configuradas!${NC}"

# Gerar Prisma Client
echo "Gerando Prisma Client..."
npm run prisma:generate

# Rodar migrations
echo "Rodando migrations no Neon..."
npx prisma migrate deploy

# Popular banco de dados
echo "Populando banco com 215 questões ESG..."
npx prisma db seed

echo -e "${GREEN}✅ Banco de dados configurado!${NC}"

# Deploy
echo "Fazendo deploy do backend..."
railway up

# Pegar URL do backend
BACKEND_URL=$(railway domain)
echo -e "${GREEN}✅ Backend deployed em: $BACKEND_URL${NC}"

cd ..

echo ""
echo -e "${YELLOW}🎨 PASSO 5: Deploy do FRONTEND${NC}"
cd frontend

# Criar projeto no Railway
railway init --name greena-frontend

# Configurar variáveis de ambiente
echo "Configurando variáveis de ambiente..."
railway variables set VITE_API_URL="https://$BACKEND_URL/api"
railway variables set VITE_APP_NAME="GREENA - Soluções em Sustentabilidade"

echo -e "${GREEN}✅ Variáveis configuradas!${NC}"

# Deploy
echo "Fazendo deploy do frontend..."
railway up

# Pegar URL do frontend
FRONTEND_URL=$(railway domain)
echo -e "${GREEN}✅ Frontend deployed em: $FRONTEND_URL${NC}"

cd ..

echo ""
echo -e "${YELLOW}🔄 PASSO 6: Atualizar CORS no backend${NC}"
cd backend

# Atualizar ALLOWED_ORIGINS
railway variables set ALLOWED_ORIGINS="https://$FRONTEND_URL,http://localhost:5173"

echo -e "${GREEN}✅ CORS atualizado!${NC}"

cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}✅ DEPLOY COMPLETO!${NC}"
echo "=========================================="
echo ""
echo "📊 URLs da Aplicação:"
echo "  🔹 Backend:  https://$BACKEND_URL"
echo "  🔹 Frontend: https://$FRONTEND_URL"
echo "  🔹 API:      https://$BACKEND_URL/api"
echo "  🔹 Health:   https://$BACKEND_URL/health"
echo ""
echo "🗄️ Database:"
echo "  🔹 Neon:     https://console.neon.tech"
echo ""
echo "📝 Próximos passos:"
echo "  1. Teste a aplicação: https://$FRONTEND_URL"
echo "  2. Verifique logs: railway logs"
echo "  3. Configure domínio custom (opcional)"
echo ""
echo -e "${GREEN}🌱 GREENA ESG está no ar!${NC}"
