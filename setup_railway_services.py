#!/usr/bin/env python3
"""
Script para configurar automaticamente os serviços no Railway
Requer: RAILWAY_TOKEN como variável de ambiente
"""

import os
import sys
import json
import requests

# Configurações
RAILWAY_API = "https://backboard.railway.app/graphql"
GITHUB_REPO = "AndersD76/greena-esg-platform"
PROJECT_NAME = "GREENA ESG Platform"

# Variáveis de ambiente para Backend
BACKEND_VARS = {
    "DATABASE_URL": "postgresql://neondb_owner:npg_YkjKCEgq9w4b@ep-shiny-dust-achm2ulc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require",
    "NODE_ENV": "production",
    "JWT_SECRET": "greena_jwt_secret_2024_production_key_secure",
    "JWT_REFRESH_SECRET": "greena_jwt_refresh_secret_2024_production_key_secure",
    "JWT_EXPIRES_IN": "7d",
    "JWT_REFRESH_EXPIRES_IN": "30d",
    "CORS_ORIGIN": "*",
    "PORT": "3000"
}

def get_railway_token():
    """Obtém o token do Railway"""
    token = os.environ.get('RAILWAY_TOKEN')
    if not token:
        print("❌ RAILWAY_TOKEN não encontrado!")
        print("\n📋 Para obter o token:")
        print("1. Acesse: https://railway.app/account/tokens")
        print("2. Clique em 'Create Token'")
        print("3. Copie o token")
        print("4. Execute: set RAILWAY_TOKEN=seu_token_aqui")
        print("5. Execute este script novamente")
        sys.exit(1)
    return token

def railway_query(token, query, variables=None):
    """Executa uma query GraphQL no Railway"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {"query": query}
    if variables:
        payload["variables"] = variables

    response = requests.post(RAILWAY_API, json=payload, headers=headers)

    if response.status_code != 200:
        print(f"❌ Erro na API: {response.status_code}")
        print(response.text)
        sys.exit(1)

    return response.json()

def get_or_create_project(token):
    """Obtém ou cria o projeto no Railway"""
    # Lista projetos existentes
    query = """
    query {
        projects {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
    """

    result = railway_query(token, query)
    projects = result['data']['projects']['edges']

    # Procura pelo projeto GREENA
    for project in projects:
        if PROJECT_NAME.lower() in project['node']['name'].lower():
            print(f"✅ Projeto encontrado: {project['node']['name']}")
            return project['node']['id']

    print("📦 Criando novo projeto...")
    create_query = """
    mutation($name: String!) {
        projectCreate(input: { name: $name }) {
            id
            name
        }
    }
    """

    result = railway_query(token, create_query, {"name": PROJECT_NAME})
    project_id = result['data']['projectCreate']['id']
    print(f"✅ Projeto criado: {project_id}")
    return project_id

def create_service(token, project_id, service_name, root_dir, env_vars):
    """Cria um serviço no Railway"""
    print(f"\n🔧 Criando serviço: {service_name}")

    # Nota: A API GraphQL do Railway para criar serviços é complexa
    # Este é um exemplo simplificado - você precisará ajustar baseado na API atual

    query = """
    mutation($projectId: String!, $name: String!, $repo: String!, $rootDir: String!) {
        serviceCreate(input: {
            projectId: $projectId
            name: $name
            source: {
                repo: $repo
                rootDirectory: $rootDir
            }
        }) {
            id
            name
        }
    }
    """

    variables = {
        "projectId": project_id,
        "name": service_name,
        "repo": GITHUB_REPO,
        "rootDir": root_dir
    }

    try:
        result = railway_query(token, query, variables)
        service_id = result['data']['serviceCreate']['id']
        print(f"✅ Serviço criado: {service_id}")

        # Configura variáveis de ambiente
        print(f"📝 Configurando variáveis de ambiente...")
        for key, value in env_vars.items():
            set_env_var(token, service_id, key, value)

        return service_id
    except Exception as e:
        print(f"❌ Erro ao criar serviço: {e}")
        print("\n⚠️  A API GraphQL do Railway mudou.")
        print("📋 Você precisará criar os serviços manualmente na interface web.")
        return None

def set_env_var(token, service_id, key, value):
    """Define uma variável de ambiente"""
    query = """
    mutation($serviceId: String!, $key: String!, $value: String!) {
        variableUpsert(input: {
            serviceId: $serviceId
            name: $key
            value: $value
        }) {
            id
        }
    }
    """

    railway_query(token, query, {
        "serviceId": service_id,
        "key": key,
        "value": value
    })
    print(f"  ✓ {key}")

def main():
    print("🚂 Railway Auto Setup - GREENA ESG Platform")
    print("=" * 50)

    # Obtém token
    token = get_railway_token()

    # Obtém ou cria projeto
    project_id = get_or_create_project(token)

    # Cria serviço Backend
    backend_id = create_service(
        token,
        project_id,
        "greena-backend",
        "backend",
        BACKEND_VARS
    )

    if not backend_id:
        print("\n⚠️  Não foi possível criar os serviços automaticamente.")
        print("📋 Siga o guia manual: RAILWAY_SETUP_MANUAL.md")
        return

    # Cria serviço Frontend (sem VITE_API_URL por enquanto)
    frontend_id = create_service(
        token,
        project_id,
        "greena-frontend",
        "frontend",
        {}  # Configuraremos depois com a URL do backend
    )

    print("\n" + "=" * 50)
    print("✅ Setup concluído!")
    print("\n📋 Próximos passos:")
    print("1. Aguarde os deploys terminarem")
    print("2. Copie a URL do backend")
    print("3. Configure VITE_API_URL no frontend")
    print("4. Atualize CORS_ORIGIN no backend")
    print("\n🌐 Acesse: https://railway.app/dashboard")

if __name__ == "__main__":
    main()
