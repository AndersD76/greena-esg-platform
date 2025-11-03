# Status do Deploy Railway - GREENA ESG

## ✅ Concluído

### 1. GitHub
- **Repositório:** https://github.com/AndersD76/greena-esg-platform
- **Branch:** master
- **Último commit:** Fix Railway deployment configuration (408aa24)
- **Status:** Código atualizado e pronto

### 2. Configurações Railway Corrigidas
- ✅ `backend/railway.json` - Configuração otimizada do backend
- ✅ `frontend/railway.json` - Configuração otimizada do frontend
- ✅ `backend/.node-version` - Node 18
- ✅ `frontend/.node-version` - Node 18
- ✅ `frontend/package.json` - Adicionado pacote `serve` para produção
- ✅ Migrations do Prisma incluídas

### 3. Banco de Dados Neon
- ✅ Configurado e populado
- ✅ 3 Pilares (E, S, G)
- ✅ 14 Temas
- ✅ 43 Critérios
- ✅ 215 Questões ESG

---

## 🔄 Próximos Passos no Railway

Como você já criou o projeto no Railway, agora precisa:

### 1. Verificar Deploy Automático
O Railway deve detectar o novo commit e iniciar o deploy automaticamente.

**Acesse:** https://railway.app/dashboard

Verifique se:
- ✅ Backend está buildando/deployed
- ✅ Frontend está buildando/deployed

### 2. Se o Deploy NÃO Iniciou Automaticamente

#### Backend:
1. Vá no serviço Backend
2. Clique em "Settings" → "Deploy"
3. Clique em "Redeploy"
4. Ou clique em "Deployments" → "Deploy Now"

#### Frontend:
1. Vá no serviço Frontend
2. Clique em "Settings" → "Deploy"
3. Clique em "Redeploy"
4. Ou clique em "Deployments" → "Deploy Now"

### 3. Configurar Variáveis de Ambiente (se ainda não configurou)

#### Backend Variables:
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

#### Frontend Variables:
```env
VITE_API_URL=https://SEU-BACKEND-URL.up.railway.app
```

### 4. Depois que Deploy Concluir

1. **Copie a URL do Backend** (ex: `https://greena-backend-production.up.railway.app`)
2. **Cole no Frontend:** Vá no frontend → Variables → Edite `VITE_API_URL`
3. **Copie a URL do Frontend** (ex: `https://greena-frontend-production.up.railway.app`)
4. **Atualize CORS no Backend:** Vá no backend → Variables → Edite `CORS_ORIGIN` com a URL do frontend
5. **Redeploy ambos** os serviços para aplicar as mudanças

---

## 🧪 Testar Deploy

### Backend Health Check:
```
https://SEU-BACKEND-URL.up.railway.app/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### Frontend:
```
https://SEU-FRONTEND-URL.up.railway.app
```

**Login de teste:**
- Email: `admin@greena.com`
- Senha: `admin123`

---

## 📋 Checklist Final

- [ ] Backend deployed com sucesso
- [ ] Frontend deployed com sucesso
- [ ] `VITE_API_URL` configurado no frontend
- [ ] `CORS_ORIGIN` configurado no backend
- [ ] Backend health check funcionando
- [ ] Frontend carregando
- [ ] Login funcionando
- [ ] Questionários ESG carregando (215 perguntas)

---

## 🐛 Se Houver Erros

### Ver Logs:
1. Vá no serviço (Backend ou Frontend)
2. Clique em "Deployments"
3. Clique no deployment mais recente
4. Clique em "View Logs"

### Problemas Comuns:

**Frontend não builda:**
- Verifique se `serve` está em `dependencies` no `package.json`
- Verifique se `.node-version` está presente

**Backend não conecta ao banco:**
- Verifique se `DATABASE_URL` está correta
- Verifique se as migrations rodaram (veja nos logs)

**CORS Error:**
- Verifique se `CORS_ORIGIN` no backend tem a URL do frontend
- Ou use `*` temporariamente para testar

---

## 🎉 Sistema Pronto!

Quando tudo estiver verde no Railway, você terá:
- ✅ Backend API rodando
- ✅ Frontend React rodando
- ✅ Banco Neon configurado
- ✅ 215 questões ESG disponíveis
- ✅ Sistema completo de avaliação ESG

**Repositório GitHub:** https://github.com/AndersD76/greena-esg-platform
