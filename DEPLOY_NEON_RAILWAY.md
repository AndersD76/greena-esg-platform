# 🚀 DEPLOY GREENA ESG - NEON + RAILWAY

## 📋 GUIA COMPLETO DE DEPLOY

---

## PARTE 1: CONFIGURAR NEON DATABASE (PostgreSQL Serverless)

### 1.1 Criar conta no Neon
1. Acesse: https://neon.tech
2. Clique em "Sign Up" (pode usar GitHub)
3. Confirme seu email

### 1.2 Criar banco de dados
1. No dashboard do Neon, clique em "Create Project"
2. Configurações:
   - **Project name:** greena-esg
   - **Region:** escolha o mais próximo (ex: US East, AWS)
   - **PostgreSQL version:** 16 (recomendado)
3. Clique em "Create Project"

### 1.3 Copiar Connection String
1. Na página do projeto, vá em "Connection Details"
2. Copie a **Connection String** que parece com isso:
```
postgresql://neondb_owner:xxxxx@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```
3. **Guarde essa string!** Vamos usar no Railway

---

## PARTE 2: PREPARAR PROJETO PARA DEPLOY

### 2.1 Atualizar backend/.env (local)
```env
DATABASE_URL="postgresql://neondb_owner:xxxxx@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="seu-secret-super-seguro-production"
JWT_REFRESH_SECRET="seu-refresh-secret-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="production"
ALLOWED_ORIGINS="https://seu-frontend.railway.app"
```

### 2.2 Rodar migrations no Neon
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate deploy
npm run prisma:seed
```

Isso vai:
- ✅ Criar todas as tabelas no Neon
- ✅ Popular com 215 questões ESG

---

## PARTE 3: DEPLOY NO RAILWAY

### 3.1 Criar conta no Railway
1. Acesse: https://railway.app
2. Clique em "Login" (use GitHub para facilitar)

### 3.2 Deploy do Backend

#### Opção A: Via GitHub (Recomendado)
1. Faça push do código para GitHub (se ainda não fez)
2. No Railway, clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório `greena-esg`
5. Selecione a pasta `/backend`

#### Opção B: Via Railway CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Criar projeto
cd backend
railway init

# Deploy
railway up
```

### 3.3 Configurar variáveis de ambiente do Backend

No Railway dashboard do backend:
1. Vá em "Variables"
2. Adicione cada variável:

```
DATABASE_URL = postgresql://neondb_owner:xxxxx@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET = seu-secret-super-seguro-production-xyz123
JWT_REFRESH_SECRET = seu-refresh-secret-production-abc456
JWT_EXPIRES_IN = 24h
JWT_REFRESH_EXPIRES_IN = 7d
PORT = 3000
NODE_ENV = production
```

⚠️ **IMPORTANTE:** Gere secrets seguros! Use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.4 Configurar Build do Backend

No Railway, vá em "Settings":
- **Root Directory:** `/backend` (se estiver usando monorepo)
- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Start Command:** `npm start`
- **Watch Paths:** `/backend/**`

### 3.5 Deploy do Frontend

1. No Railway, clique em "New"
2. Selecione "Deploy from GitHub repo"
3. Escolha o mesmo repositório
4. Selecione a pasta `/frontend`

### 3.6 Configurar variáveis de ambiente do Frontend

No Railway dashboard do frontend:
1. Vá em "Variables"
2. Adicione:

```
VITE_API_URL = https://seu-backend.railway.app/api
VITE_APP_NAME = GREENA - Soluções em Sustentabilidade
```

⚠️ **Atenção:** Substitua `seu-backend.railway.app` pela URL real do backend!

### 3.7 Configurar Build do Frontend

No Railway, vá em "Settings":
- **Root Directory:** `/frontend` (se estiver usando monorepo)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx vite preview --host 0.0.0.0 --port $PORT`
- **Watch Paths:** `/frontend/**`

---

## PARTE 4: ATUALIZAR CORS NO BACKEND

Depois que o frontend estiver deployed, atualize o CORS:

1. No Railway, vá no backend → Variables
2. Atualize `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS = https://seu-frontend.railway.app,http://localhost:5173
```

3. Ou edite o código em `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: [
    'https://seu-frontend.railway.app',
    'http://localhost:5173'
  ],
  credentials: true,
}));
```

---

## PARTE 5: VERIFICAR DEPLOY

### 5.1 URLs geradas pelo Railway

Você terá 2 URLs:
- **Backend:** https://greena-backend-production.up.railway.app
- **Frontend:** https://greena-frontend-production.up.railway.app

### 5.2 Testar

**Health Check do Backend:**
```
https://seu-backend.railway.app/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "GREENA ESG API is running"
}
```

**Frontend:**
```
https://seu-frontend.railway.app
```

Deve mostrar a tela de login!

---

## 📊 MONITORAMENTO

### No Railway Dashboard:
- ✅ Logs em tempo real
- ✅ Métricas de uso
- ✅ Deploy automático a cada push
- ✅ Rollback com 1 clique
- ✅ Custom domains (se quiser)

### No Neon Dashboard:
- ✅ Queries executadas
- ✅ Tamanho do banco
- ✅ Conexões ativas
- ✅ Backups automáticos

---

## 🔧 TROUBLESHOOTING

### Erro: "P1001: Can't reach database server"
- Verifique se a DATABASE_URL está correta
- Confirme que o Neon database está ativo
- Teste a conexão localmente primeiro

### Erro: "Build failed"
```bash
# Limpe o cache
railway run npm cache clean --force
```

### Erro: "CORS error" no frontend
- Verifique ALLOWED_ORIGINS no backend
- Confirme que as URLs estão corretas
- Adicione as duas URLs (production + localhost)

### Migrations não rodam
```bash
# Execute manualmente
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

---

## 💰 CUSTOS

### Neon (Database)
- ✅ **Free tier:** 0.5 GB storage, compute sempre disponível
- ✅ **Branches:** desenvolvimento separado de produção
- ✅ **Backups:** automáticos no free tier

### Railway
- ✅ **$5/mês de crédito grátis**
- ✅ Cada projeto consome ~$1-2/mês
- ✅ Backend + Frontend = ~$3-4/mês
- ✅ **Primeiro mês grátis com trial!**

---

## 🎯 CHECKLIST FINAL

Antes de ir para produção:

- [ ] DATABASE_URL do Neon configurada
- [ ] JWT_SECRET forte gerado
- [ ] Migrations rodadas no Neon
- [ ] Seed executado (215 questões)
- [ ] Backend deployed no Railway
- [ ] Frontend deployed no Railway
- [ ] ALLOWED_ORIGINS atualizado
- [ ] VITE_API_URL apontando para backend
- [ ] Testado registro de usuário
- [ ] Testado login
- [ ] Testado criação de diagnóstico
- [ ] Testado questionário
- [ ] Testado cálculo de scores

---

## 🚀 PRONTO!

Sua aplicação GREENA ESG está no ar! 🎉

**Próximos passos:**
1. Configurar domínio personalizado (opcional)
2. Adicionar analytics (Google Analytics, PostHog)
3. Configurar monitoramento de erros (Sentry)
4. Implementar CI/CD completo
5. Adicionar testes automatizados

---

**Desenvolvido com 💚 para um mundo mais sustentável!**
