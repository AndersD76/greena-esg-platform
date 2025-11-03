# Próximos Passos - Deploy Railway

## ✅ Concluído
- [x] Código commitado no GitHub
- [x] Push realizado para o repositório

## 📋 Agora faça no Railway Dashboard

### 1. Acesse o Railway Dashboard
https://railway.app/dashboard

### 2. Verifique o Build

O Railway deve ter detectado automaticamente o push e iniciado o build.

#### Para o Backend:
1. Clique no serviço **Backend**
2. Vá na aba **Deployments**
3. Veja se o build está em andamento ou completou
4. Se houver erros, verifique os logs

#### Para o Frontend:
1. Clique no serviço **Frontend**
2. Vá na aba **Deployments**
3. Veja se o build está em andamento ou completou
4. Se houver erros, verifique os logs

### 3. Configurar Variáveis de Ambiente

#### Backend - Variáveis Necessárias:

Vá em **Backend** → **Variables** e adicione:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=seu_jwt_secret_super_seguro_12345
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://seu-frontend-url.railway.app
```

**Importante:**
- `DATABASE_URL` deve referenciar o PostgreSQL que você já criou
- `JWT_SECRET` deve ser uma string aleatória segura (guarde bem!)
- `FRONTEND_URL` você pega após o deploy do frontend

#### Frontend - Variáveis Necessárias:

Vá em **Frontend** → **Variables** e adicione:

```
VITE_API_URL=https://seu-backend-url.railway.app/api
```

**Importante:**
- Use a URL do backend (você pega clicando em Settings → Domains no serviço backend)

### 4. Executar Migrations do Prisma

Após o backend fazer deploy com sucesso:

1. Vá no serviço **Backend**
2. Clique na aba **Deployments**
3. No deployment ativo, clique nos **3 pontinhos** → **View logs**
4. Verifique se as migrations rodaram automaticamente

Se NÃO rodaram, você precisa executar manualmente:

#### Opção A - Via Railway CLI:
```bash
railway link
railway run npx prisma migrate deploy
railway run npx prisma generate
```

#### Opção B - Via Shell no Dashboard:
1. No serviço Backend, vá em **Settings**
2. Role até **Service Settings**
3. Clique em **Execute Command**
4. Execute:
```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Popular Dados Iniciais

Execute estes comandos para criar os planos e benefícios:

```bash
railway run npx tsx backend/src/scripts/seed-plans.ts
railway run npx tsx backend/src/scripts/seed-benefits.ts
```

Ou se preferir via Dashboard Shell:
```bash
npx tsx src/scripts/seed-plans.ts
npx tsx src/scripts/seed-benefits.ts
```

### 6. Obter URLs dos Serviços

#### Backend URL:
1. Clique no serviço **Backend**
2. Vá em **Settings** → **Networking**
3. Em **Public Networking**, você verá a URL
4. Copie e atualize `VITE_API_URL` no frontend

#### Frontend URL:
1. Clique no serviço **Frontend**
2. Vá em **Settings** → **Networking**
3. Em **Public Networking**, você verá a URL
4. Copie e atualize `FRONTEND_URL` no backend

### 7. Forçar Redeploy (se necessário)

Após atualizar as variáveis de ambiente:

1. Vá em cada serviço
2. Clique nos **3 pontinhos** no canto superior direito
3. Clique em **Redeploy**

Ou via CLI:
```bash
cd backend
railway up --detach

cd ../frontend
railway up --detach
```

### 8. Testar a Aplicação

Acesse a URL do frontend e teste:

1. ✅ Landing page carrega
2. ✅ Navegação funciona (Sobre, Soluções, Contato)
3. ✅ Registro de usuário
4. ✅ Login funciona
5. ✅ Dashboard carrega
6. ✅ Criar novo diagnóstico
7. ✅ Responder questionário
8. ✅ Ver resultados
9. ✅ Página de perfil mostra plano Free
10. ✅ Upgrade de plano (teste com plano Basic)

### 9. Monitoramento

#### Ver Logs:
```bash
# Backend
railway logs --service backend

# Frontend
railway logs --service frontend
```

#### Ou no Dashboard:
- Clique no serviço
- Vá na aba **Deployments**
- Clique em **View Logs**

### 10. Troubleshooting

#### Backend não inicia:
- Verifique logs: olhe por erros de conexão com banco
- Confirme que `DATABASE_URL` está configurada corretamente
- Verifique se migrations rodaram: `railway run npx prisma migrate status`

#### Frontend não conecta no backend:
- Confirme `VITE_API_URL` no frontend
- Teste a URL do backend no browser: `https://seu-backend.railway.app/health`
- Verifique CORS no backend

#### Erros de banco de dados:
- Execute migrations: `railway run npx prisma migrate deploy`
- Verifique conexão: `railway run npx prisma db pull`

#### Build falha:
- Veja logs completos no Railway
- Confirme que `package.json` tem todos os scripts necessários
- Verifique se dependencies estão corretas

## 📊 Estrutura Final Esperada

```
Project: greena-esg-platform (via GitHub)
│
├── PostgreSQL Database
│   └── Conectado automaticamente
│
├── Backend Service
│   ├── Build: Node.js (Nixpacks)
│   ├── Start: npm run start
│   └── URL: https://greena-backend.railway.app
│
└── Frontend Service
    ├── Build: Vite
    ├── Start: npm run preview (ou similar)
    └── URL: https://greena-frontend.railway.app
```

## 🎯 Checklist Final

- [ ] Backend buildou com sucesso
- [ ] Frontend buildou com sucesso
- [ ] Variáveis de ambiente configuradas (Backend)
- [ ] Variáveis de ambiente configuradas (Frontend)
- [ ] Migrations executadas
- [ ] Seeds executados (planos e benefícios)
- [ ] URLs cruzadas atualizadas
- [ ] Redeploy forçado (se necessário)
- [ ] Teste completo da aplicação
- [ ] Monitoramento de logs configurado

## 💡 Dicas

1. **Custos**: Railway oferece $5/mês grátis. Monitore em Usage.
2. **Domínio Custom**: Pode adicionar em Settings → Networking → Custom Domain
3. **Rollback**: Se algo der errado, clique em um deploy antigo e selecione "Rollback"
4. **Escalabilidade**: Ajuste replicas em Settings → Resources
5. **Ambiente**: Considere criar ambientes staging/production separados

## 🆘 Precisa de Ajuda?

- Docs Railway: https://docs.railway.app
- Logs são seus amigos: sempre verifique primeiro
- Community: https://discord.gg/railway
