# Deploy GREENA no Railway - Guia Web Interface

## Repositório GitHub
✅ **Criado:** https://github.com/AndersD76/greena-esg-platform

---

## Passo 1: Acesse Railway
1. Vá para: https://railway.app/
2. Clique em "Login" (use sua conta GitHub - AndersD76)

---

## Passo 2: Criar Projeto Backend

### 2.1 - Novo Projeto
1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha: `AndersD76/greena-esg-platform`
4. Railway detectará automaticamente o monorepo

### 2.2 - Configurar Backend Service
1. Clique em "Add Service" → "GitHub Repo"
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npx prisma generate && npm run build`
4. **Start Command:** `npx prisma migrate deploy && npm start`

### 2.3 - Variáveis de Ambiente (Backend)
Clique em "Variables" e adicione:

```env
DATABASE_URL=postgresql://neondb_owner:npg_YkjKCEgq9w4b@ep-shiny-dust-achm2ulc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require

NODE_ENV=production

JWT_SECRET=greena_jwt_secret_2024_production_key_secure
JWT_REFRESH_SECRET=greena_jwt_refresh_secret_2024_production_key_secure
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGIN=*

PORT=3000
```

### 2.4 - Deploy Backend
1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. **Anote a URL gerada** (ex: `https://greena-backend-production.up.railway.app`)

---

## Passo 3: Criar Projeto Frontend

### 3.1 - Adicionar Frontend ao Mesmo Projeto
1. No mesmo projeto, clique em "New Service"
2. Selecione "GitHub Repo" → `AndersD76/greena-esg-platform`
3. **Root Directory:** `frontend`
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npx vite preview --host 0.0.0.0 --port $PORT`

### 3.2 - Variáveis de Ambiente (Frontend)
Clique em "Variables" e adicione:

```env
VITE_API_URL=<URL_DO_BACKEND_AQUI>
```

**⚠️ Importante:** Substitua `<URL_DO_BACKEND_AQUI>` pela URL gerada no Passo 2.4

### 3.3 - Deploy Frontend
1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. **Anote a URL gerada** (ex: `https://greena-frontend-production.up.railway.app`)

---

## Passo 4: Atualizar CORS no Backend

### 4.1 - Editar Variável CORS_ORIGIN
1. Volte para o serviço **Backend**
2. Clique em "Variables"
3. Edite `CORS_ORIGIN`:
```env
CORS_ORIGIN=https://greena-frontend-production.up.railway.app
```
*(Use a URL real do seu frontend)*

4. Clique em "Save"
5. O backend será reiniciado automaticamente

---

## Passo 5: Verificar Deployment

### 5.1 - Testar Backend
Abra no navegador: `https://SEU-BACKEND-URL.up.railway.app/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 5.2 - Testar Frontend
Abra no navegador: `https://SEU-FRONTEND-URL.up.railway.app`

Deve mostrar a tela de login do GREENA.

### 5.3 - Testar Login
**Usuário padrão criado no seed:**
- Email: `admin@greena.com`
- Senha: `admin123`

---

## Resumo das URLs

Após completar os passos acima, você terá:

- **Backend API:** `https://[seu-backend].up.railway.app`
- **Frontend App:** `https://[seu-frontend].up.railway.app`
- **Banco Neon:** Já configurado e populado com 215 questões

---

## Troubleshooting

### Backend não inicia
- Verifique se `DATABASE_URL` está correta
- Veja os logs em "Deployments" → "View Logs"

### Frontend não conecta ao Backend
- Verifique se `VITE_API_URL` aponta para a URL correta do backend
- Verifique se `CORS_ORIGIN` no backend inclui a URL do frontend

### Erro de Database
- O banco Neon já está configurado com todas as tabelas e dados
- Se precisar resetar: `npx prisma migrate reset --force` (via Railway CLI ou console)

---

## Pronto!
Seu sistema GREENA ESG está no ar! 🚀
