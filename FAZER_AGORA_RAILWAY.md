# 🚂 FAÇA AGORA - Deploy Railway GREENA

## ⚡ AÇÃO RÁPIDA - 5 MINUTOS

### 1️⃣ DELETE O SERVIÇO ATUAL (que está dando erro)

1. Acesse: **https://railway.app/dashboard**
2. Clique no projeto GREENA
3. No card/serviço que está falhando, clique nos **3 pontinhos (⋮)**
4. Clique em **"Remove Service"** ou **"Delete"**
5. Confirme

---

### 2️⃣ CRIE O SERVIÇO BACKEND

1. Dentro do projeto, clique em **"+ New"** ou **"New Service"**
2. Selecione **"GitHub Repo"**
3. Procure e selecione: **`AndersD76/greena-esg-platform`**
4. Clique em **"Add Variables"** ANTES de finalizar
5. Cole estas variáveis:

```
DATABASE_URL=postgresql://neondb_owner:npg_YkjKCEgq9w4b@ep-shiny-dust-achm2ulc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
JWT_SECRET=greena_jwt_secret_2024_production_key_secure
JWT_REFRESH_SECRET=greena_jwt_refresh_secret_2024_production_key_secure
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=*
PORT=3000
```

6. Clique em **"Deploy"**
7. **IMPORTANTE:** Clique no serviço criado → **Settings** → **Root Directory** → Digite: `backend` → Save
8. Vá em **Deployments** → **Redeploy**
9. Aguarde 2-3 minutos até ver ✅ **Success**
10. **COPIE A URL** que aparece (algo como: `https://greena-backend-production-xxxx.up.railway.app`)

---

### 3️⃣ CRIE O SERVIÇO FRONTEND

1. Clique em **"+ New"** ou **"New Service"** novamente
2. Selecione **"GitHub Repo"**
3. Selecione: **`AndersD76/greena-esg-platform`** (mesmo repo)
4. Clique em **"Add Variables"**
5. Cole esta variável (substitua pela URL do backend que você copiou):

```
VITE_API_URL=https://SEU-BACKEND-URL-AQUI.up.railway.app
```

6. Clique em **"Deploy"**
7. **IMPORTANTE:** Clique no serviço criado → **Settings** → **Root Directory** → Digite: `frontend` → Save
8. Vá em **Deployments** → **Redeploy**
9. Aguarde 2-3 minutos até ver ✅ **Success**
10. **COPIE A URL** que aparece (algo como: `https://greena-frontend-production-xxxx.up.railway.app`)

---

### 4️⃣ ATUALIZE O CORS (Última etapa!)

1. Volte no **serviço Backend**
2. Clique em **"Variables"**
3. Procure por **`CORS_ORIGIN`**
4. Clique no lápis (editar)
5. Mude de `*` para a URL do frontend que você copiou:

```
https://SEU-FRONTEND-URL-AQUI.up.railway.app
```

6. Clique em **"Save"** ou **"Update"**
7. Vá em **"Deployments"** → **"Redeploy"** (para aplicar a mudança)

---

## ✅ PRONTO! Teste o Sistema:

### Teste o Backend:
Abra no navegador:
```
https://SEU-BACKEND-URL.up.railway.app/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

### Teste o Frontend:
Abra no navegador:
```
https://SEU-FRONTEND-URL.up.railway.app
```

### Faça Login:
- Email: `admin@greena.com`
- Senha: `admin123`

---

## 🎯 RESUMO SUPER RÁPIDO

```bash
1. DELETE o serviço que está falhando
2. Crie BACKEND → Root Directory: backend → Deploy
3. Crie FRONTEND → Root Directory: frontend → Deploy
4. Atualize CORS_ORIGIN no backend com URL do frontend
5. PRONTO! 🎉
```

---

## ⚠️ SE DER ERRO "Nixpacks was unable to generate a build plan"

**Significa que você esqueceu de configurar o Root Directory!**

**Solução:**
- Clique no serviço
- Settings → Root Directory
- Digite: `backend` (para backend) ou `frontend` (para frontend)
- Save → Deployments → Redeploy

---

## 📞 URLs Importantes

- **Dashboard Railway:** https://railway.app/dashboard
- **GitHub Repo:** https://github.com/AndersD76/greena-esg-platform
- **Neon Database:** Já configurado ✅

---

## 🆘 Se Precisar de Ajuda

Veja os logs do deploy:
```
Dashboard → [Serviço] → Deployments → [Último Deploy] → View Logs
```

Me envie os logs se der erro!

---

**🚀 VAI DAR CERTO! Siga os passos acima e em 5 minutos está no ar!**
