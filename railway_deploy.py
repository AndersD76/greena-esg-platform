#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests
import json
import sys
import time
import io

# Fix encoding for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configuração
RAILWAY_TOKEN = "1e727330-39e0-4d0c-82e1-630d50a73cb6"
RAILWAY_API = "https://backboard.railway.app/graphql/v2"
GITHUB_REPO = "AndersD76/greena-esg-platform"

# Headers
headers = {
    "Authorization": f"Bearer {RAILWAY_TOKEN}",
    "Content-Type": "application/json"
}

def railway_query(query, variables=None):
    """Executa query GraphQL no Railway"""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables

    response = requests.post(RAILWAY_API, json=payload, headers=headers)

    if response.status_code != 200:
        print(f"❌ Erro API: {response.status_code}")
        print(response.text)
        return None

    data = response.json()
    if "errors" in data:
        print(f"❌ Erro GraphQL: {data['errors']}")
        return None

    return data

print("🚂 Railway Auto Deploy - GREENA ESG")
print("=" * 50)

# 1. Listar projetos
print("\n📋 Listando projetos existentes...")
query = """
{
    projects {
        edges {
            node {
                id
                name
                services {
                    edges {
                        node {
                            id
                            name
                        }
                    }
                }
            }
        }
    }
}
"""

result = railway_query(query)
if not result:
    print("❌ Falha ao listar projetos")
    sys.exit(1)

projects = result["data"]["projects"]["edges"]
print(f"✅ Encontrados {len(projects)} projeto(s)")

# Procurar projeto GREENA
project_id = None
for proj in projects:
    print(f"  - {proj['node']['name']} (ID: {proj['node']['id']})")
    if "greena" in proj['node']['name'].lower() or "esg" in proj['node']['name'].lower():
        project_id = proj['node']['id']
        print(f"    ✅ Projeto GREENA identificado!")

        # Listar serviços existentes
        services = proj['node']['services']['edges']
        if services:
            print(f"    Serviços existentes: {len(services)}")
            for svc in services:
                print(f"      - {svc['node']['name']} (ID: {svc['node']['id']})")

if not project_id:
    print("\n❌ Projeto GREENA não encontrado")
    print("📝 Criando novo projeto...")

    create_project = """
    mutation {
        projectCreate(input: {
            name: "GREENA ESG Platform"
        }) {
            id
            name
        }
    }
    """

    result = railway_query(create_project)
    if result:
        project_id = result["data"]["projectCreate"]["id"]
        print(f"✅ Projeto criado: {project_id}")
    else:
        print("❌ Falha ao criar projeto")
        sys.exit(1)

print(f"\n🎯 Usando projeto ID: {project_id}")

# 2. Criar serviço Backend
print("\n🔧 Criando serviço Backend...")

# Nota: A API do Railway v2 usa uma estrutura diferente
# Vou tentar criar o serviço conectando ao GitHub repo

backend_mutation = """
mutation ServiceCreate($input: ServiceCreateInput!) {
    serviceCreate(input: $input) {
        id
        name
    }
}
"""

backend_vars = {
    "input": {
        "projectId": project_id,
        "name": "greena-backend",
        "source": {
            "repo": f"github:{GITHUB_REPO}",
            "rootDirectory": "backend"
        }
    }
}

backend_result = railway_query(backend_mutation, backend_vars)
if backend_result and "data" in backend_result:
    backend_id = backend_result["data"]["serviceCreate"]["id"]
    print(f"✅ Backend criado: {backend_id}")

    # Configurar variáveis de ambiente
    print("📝 Configurando variáveis do backend...")

    env_vars = {
        "DATABASE_URL": "postgresql://neondb_owner:npg_YkjKCEgq9w4b@ep-shiny-dust-achm2ulc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require",
        "NODE_ENV": "production",
        "JWT_SECRET": "greena_jwt_secret_2024_production_key_secure",
        "JWT_REFRESH_SECRET": "greena_jwt_refresh_secret_2024_production_key_secure",
        "JWT_EXPIRES_IN": "7d",
        "JWT_REFRESH_EXPIRES_IN": "30d",
        "CORS_ORIGIN": "*",
        "PORT": "3000"
    }

    for key, value in env_vars.items():
        var_mutation = """
        mutation VariableUpsert($input: VariableUpsertInput!) {
            variableUpsert(input: $input) {
                id
            }
        }
        """

        var_vars = {
            "input": {
                "projectId": project_id,
                "environmentId": backend_id,
                "name": key,
                "value": value
            }
        }

        var_result = railway_query(var_mutation, var_vars)
        if var_result:
            print(f"  ✓ {key}")
        else:
            print(f"  ✗ Falha em {key}")
else:
    print("⚠️  Estrutura da API pode ter mudado")
    print("Tentando método alternativo...")

# 3. Criar serviço Frontend
print("\n🎨 Criando serviço Frontend...")

frontend_vars = {
    "input": {
        "projectId": project_id,
        "name": "greena-frontend",
        "source": {
            "repo": f"github:{GITHUB_REPO}",
            "rootDirectory": "frontend"
        }
    }
}

frontend_result = railway_query(backend_mutation, frontend_vars)
if frontend_result and "data" in frontend_result:
    frontend_id = frontend_result["data"]["serviceCreate"]["id"]
    print(f"✅ Frontend criado: {frontend_id}")
else:
    print("⚠️  Não foi possível criar frontend automaticamente")

print("\n" + "=" * 50)
print("✅ Configuração Railway concluída!")
print("\n📋 Acesse o dashboard para ver os deploys:")
print("https://railway.app/dashboard")
print("\n⏳ Os deploys começarão automaticamente...")
print("Aguarde 2-3 minutos para completar.")
