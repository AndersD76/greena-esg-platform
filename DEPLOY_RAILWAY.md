# Deploy GREENA ESG Platform no Railway

## Pré-requisitos

- Conta no Railway (https://railway.app)
- Railway CLI instalado (`railway --version` para verificar)
- Git configurado

## Passo 1: Autenticação

Execute no terminal:
```bash
railway login
```

Isso abrirá seu navegador para autenticação. Após autenticar, volte ao terminal.

## Passo 2: Criar Projeto

```bash
cd "e:\APPS EM DESENVOLVIMENTO\App Greena"
railway init
```

Digite o nome do projeto: **greena-esg-platform**

## Passo 3: Adicionar PostgreSQL

```bash
railway add --plugin postgresql
```

Aguarde a criação do banco de dados.

## Passo 4: Deploy do Backend

### 4.1: Criar serviço do backend

```bash
cd backend
railway up
```

### 4.2: Configurar variáveis de ambiente do backend

Execute os comandos abaixo para configurar as variáveis:

```bash
# Database URL (será preenchida automaticamente pelo Railway)
railway variables --set DATABASE_URL=$POSTGRES_URL

# JWT Secret
railway variables --set JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456

# Port
railway variables --set PORT=3000

# Node Environment
railway variables --set NODE_ENV=production

# Frontend URL (ajuste após deploy do frontend)
railway variables --set FRONTEND_URL=https://seu-frontend.railway.app
```

### 4.3: Executar migrations

```bash
railway run npx prisma migrate deploy
railway run npx prisma generate
```

### 4.4: Popular dados iniciais (se necessário)

```bash
railway run npx tsx src/scripts/seed-plans.ts
railway run npx tsx src/scripts/seed-benefits.ts
```

## Passo 5: Deploy do Frontend

### 5.1: Voltar para a raiz e criar serviço do frontend

```bash
cd ..
cd frontend
railway up
```

### 5.2: Configurar variáveis de ambiente do frontend

```bash
# API URL (use a URL do backend)
railway variables --set VITE_API_URL=https://seu-backend.railway.app/api
```

## Passo 6: Atualizar variáveis cruzadas

Após obter as URLs dos serviços:

### No Backend:
```bash
cd backend
railway variables --set FRONTEND_URL=https://seu-frontend.railway.app
```

### No Frontend:
```bash
cd frontend
railway variables --set VITE_API_URL=https://seu-backend.railway.app/api
```

## Passo 7: Obter URLs dos serviços

```bash
# Backend URL
cd backend
railway domain

# Frontend URL
cd ../frontend
railway domain
```

## Passo 8: Testar

Acesse a URL do frontend e teste:
1. Landing page carrega
2. Registro de usuário funciona
3. Login funciona
4. Dashboard carrega
5. Criação de diagnóstico funciona

## Comandos Úteis

### Ver logs
```bash
# Backend
cd backend
railway logs

# Frontend
cd frontend
railway logs
```

### Abrir dashboard
```bash
railway open
```

### Redeployar
```bash
# Backend
cd backend
railway up --detach

# Frontend
cd frontend
railway up --detach
```

### Ver variáveis
```bash
railway variables
```

## Troubleshooting

### Erro de conexão com banco de dados
- Verifique se `DATABASE_URL` está configurada
- Execute `railway variables` para ver se `$POSTGRES_URL` está disponível

### Backend não inicia
- Verifique logs: `cd backend && railway logs`
- Verifique se migrations foram executadas

### Frontend não conecta no backend
- Verifique se `VITE_API_URL` está correta
- Verifique se backend está rodando
- Verifique CORS no backend

### Build falha
- Verifique se todas as dependências estão no package.json
- Limpe node_modules e reinstale: `rm -rf node_modules && npm install`

## Estrutura Final

```
Project: greena-esg-platform
├── PostgreSQL Plugin
├── Backend Service (Node.js)
│   └── Domain: https://greena-backend.railway.app
└── Frontend Service (Vite)
    └── Domain: https://greena-frontend.railway.app
```

## Configuração Automática com Scripts

Alternativamente, você pode usar os scripts Python incluídos:

```bash
python setup_railway_services.py
```

Ou usar o arquivo batch:

```bash
deploy_railway_cli.bat
```

## Notas Importantes

1. **Custos**: Railway oferece $5 de crédito gratuito por mês. Monitore o uso.
2. **Domínio Customizado**: Você pode adicionar domínio customizado no dashboard do Railway.
3. **Escalabilidade**: Ajuste o número de replicas nas configurações do serviço.
4. **Variáveis de Ambiente**: Nunca commite secrets no código.
5. **Migrations**: Sempre execute migrations antes de fazer deploy de mudanças no schema.

## Suporte

Se encontrar problemas, consulte:
- Documentação Railway: https://docs.railway.app
- Documentação Prisma: https://www.prisma.io/docs
- Logs do Railway: `railway logs`
