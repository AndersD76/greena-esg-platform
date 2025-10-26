# 🗄️ INSTALAÇÃO DO POSTGRESQL

## ⚠️ PostgreSQL é OBRIGATÓRIO para executar a aplicação!

O banco de dados PostgreSQL não está instalado no seu sistema.

---

## 📥 OPÇÃO 1: Instalar PostgreSQL (Recomendado)

### Windows:
1. Baixe o instalador: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Use estas configurações:
   - **Usuário:** postgres
   - **Senha:** postgres
   - **Porta:** 5432
4. Marque "pgAdmin 4" e "Stack Builder"
5. Conclua a instalação

### Após instalar:
```bash
# Verificar se está rodando
psql --version

# Se não estiver no PATH, adicione:
# C:\Program Files\PostgreSQL\16\bin
```

---

## 🐳 OPÇÃO 2: Usar Docker (Mais rápido)

### 1. Instalar Docker Desktop:
- Baixe: https://www.docker.com/products/docker-desktop/
- Instale e reinicie o computador
- Abra o Docker Desktop

### 2. Executar PostgreSQL:
```bash
cd "e:\APPS EM DESENVOLVIMENTO\App Greena"
docker-compose up -d
```

O arquivo `docker-compose.yml` já está configurado no projeto!

---

## ✅ VERIFICAR SE FUNCIONA

Após instalar, teste:

```bash
# Testar conexão
psql -U postgres -h localhost -p 5432

# Se pedir senha, digite: postgres
```

---

## 🚀 APÓS INSTALAR O POSTGRESQL

Execute os comandos na ordem:

```bash
# 1. Backend - Gerar Prisma Client
cd backend
npm run prisma:generate

# 2. Criar banco de dados e tabelas
npm run prisma:migrate

# 3. Popular com 215 questões ESG
npm run prisma:seed

# 4. Iniciar backend
npm run dev
```

Em outro terminal:

```bash
# 5. Frontend
cd frontend
npm run dev
```

---

## 🔗 ACESSO

Após iniciar tudo:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

---

## 📝 STRING DE CONEXÃO

A aplicação usa esta configuração (em `backend/.env`):

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/greena_esg"
```

Se você usou usuário/senha diferentes, ajuste o `.env` no backend!

---

## ❓ PROBLEMAS?

### Erro: "database greena_esg does not exist"
```bash
cd backend
npx prisma migrate dev --name init
```

### Erro: "password authentication failed"
- Verifique usuário e senha no `.env`
- Confirme se PostgreSQL está rodando

### Erro: "port 5432 already in use"
- Já tem PostgreSQL rodando em outra versão
- Use esse mesmo ou mude a porta no `.env`

---

**Qualquer dúvida, me avise!** 🌱
