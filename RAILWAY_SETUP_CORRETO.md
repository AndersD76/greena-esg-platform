# ⚠️ IMPORTANTE: Como Configurar Railway Corretamente

## Problema Identificado
O Railway está tentando fazer deploy do diretório raiz (monorepo), mas precisa apontar para `backend` e `frontend` separadamente.

---

## ✅ SOLUÇÃO: Configurar Root Directory

### Para o Serviço BACKEND:

1. **Vá no Railway Dashboard:** https://railway.app/dashboard
2. **Clique no serviço Backend**
3. **Clique em "Settings"**
4. **Procure por "Root Directory"** (ou "Service Root")
5. **Configure:**
   ```
   backend
   ```
6. **Clique em "Save"**
7. **Vá em "Deployments" → "Redeploy"**

---

### Para o Serviço FRONTEND:

1. **Clique no serviço Frontend**
2. **Clique em "Settings"**
3. **Procure por "Root Directory"** (ou "Service Root")
4. **Configure:**
   ```
   frontend
   ```
5. **Clique em "Save"**
6. **Vá em "Deployments" → "Redeploy"**

---

## 📋 Configurações Completas de Cada Serviço

### BACKEND Service Settings:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `backend` |
| **Build Command** | *(deixe vazio - nixpacks.toml cuida)* |
| **Start Command** | *(deixe vazio - nixpacks.toml cuida)* |
| **Watch Paths** | `backend/**` |

**Variables (Backend):**
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

---

### FRONTEND Service Settings:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `frontend` |
| **Build Command** | *(deixe vazio - nixpacks.toml cuida)* |
| **Start Command** | *(deixe vazio - nixpacks.toml cuida)* |
| **Watch Paths** | `frontend/**` |

**Variables (Frontend):**
```env
VITE_API_URL=https://SEU-BACKEND-URL.up.railway.app
```
*(Substitua pela URL real do backend depois que ele estiver rodando)*

---

## 🔍 Como Saber se Está Correto

Depois de configurar o Root Directory e fazer redeploy:

### Backend deve:
- ✅ Detectar `package.json` em `backend/`
- ✅ Rodar `npm ci`
- ✅ Rodar `npx prisma generate`
- ✅ Rodar `npm run build`
- ✅ Executar `npx prisma migrate deploy && npm start`

### Frontend deve:
- ✅ Detectar `package.json` em `frontend/`
- ✅ Rodar `npm ci`
- ✅ Rodar `npm run build`
- ✅ Executar `npx serve dist -s -l $PORT`

---

## 📸 Onde Encontrar Root Directory

**Localização no Railway:**
```
Dashboard → Seu Projeto → [Serviço] → Settings → Root Directory
```

Pode aparecer como:
- "Root Directory"
- "Service Root"
- "Source Directory"

---

## 🚀 Ordem de Ação

1. ✅ Configure Root Directory do **Backend** → `backend`
2. ✅ Configure Variables do Backend
3. ✅ Redeploy Backend
4. ⏱️ Aguarde Backend ficar online (~2-3 min)
5. 📋 Copie a URL do Backend
6. ✅ Configure Root Directory do **Frontend** → `frontend`
7. ✅ Configure Variables do Frontend (com URL do backend)
8. ✅ Redeploy Frontend
9. ⏱️ Aguarde Frontend ficar online (~2-3 min)
10. 🎉 Teste o sistema!

---

## 🐛 Se Ainda Der Erro

### Erro: "Nixpacks was unable to generate a build plan"
**Causa:** Root Directory não foi configurado

**Solução:**
1. Certifique-se que Root Directory está em `backend` ou `frontend`
2. Não deixe vazio
3. Não coloque `/` no final

### Erro: "Cannot find module"
**Causa:** Tentando rodar comando do diretório errado

**Solução:**
1. Verifique se Root Directory está correto
2. Verifique se `package.json` existe dentro do diretório

### Ver Logs Detalhados:
```
Dashboard → [Serviço] → Deployments → [Último Deploy] → View Logs
```

---

## ✅ Checklist Final

- [ ] Backend Root Directory = `backend`
- [ ] Frontend Root Directory = `frontend`
- [ ] Backend Variables configuradas (8 variáveis)
- [ ] Backend deployed com sucesso
- [ ] URL do Backend copiada
- [ ] Frontend Variables configuradas (com URL do backend)
- [ ] Frontend deployed com sucesso
- [ ] CORS_ORIGIN atualizado no backend com URL do frontend
- [ ] Health check funcionando: `/api/health`
- [ ] Frontend carregando
- [ ] Login funcionando

---

## 📞 URLs Importantes

- **GitHub Repo:** https://github.com/AndersD76/greena-esg-platform
- **Railway Dashboard:** https://railway.app/dashboard
- **Nixpacks Docs:** https://nixpacks.com

---

## 🎯 Resumo Super Rápido

```bash
Backend Service Settings:
  Root Directory: backend

Frontend Service Settings:
  Root Directory: frontend
```

**Isso é o mais importante!** Sem isso, o Railway não sabe onde procurar o código.

Salve, redeploy, e deve funcionar! 🚀
