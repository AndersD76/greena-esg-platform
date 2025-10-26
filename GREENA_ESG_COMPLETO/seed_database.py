"""
Script de Seed para Popular Banco de Dados ESG
Este script lê o arquivo JSON com as questões e popula o banco PostgreSQL

INSTRUÇÕES DE USO:
1. Certifique-se de ter o banco PostgreSQL rodando
2. Instale as dependências: pip install psycopg2-binary python-dotenv
3. Configure o arquivo .env com DATABASE_URL
4. Execute: python seed_database.py
"""

import json
import psycopg2
from psycopg2.extras import execute_batch
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do banco
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/greena_esg')

def create_connection():
    """Cria conexão com o banco de dados"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ Conexão com banco estabelecida!")
        return conn
    except Exception as e:
        print(f"❌ Erro ao conectar ao banco: {e}")
        return None

def create_tables(conn):
    """Cria as tabelas necessárias"""
    cursor = conn.cursor()
    
    # Tabela de pilares
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pillars (
            id SERIAL PRIMARY KEY,
            code VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            icon VARCHAR(50),
            color VARCHAR(50)
        );
    """)
    
    # Tabela de temas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS themes (
            id SERIAL PRIMARY KEY,
            pillar_id INTEGER REFERENCES pillars(id) ON DELETE CASCADE,
            name VARCHAR(200) NOT NULL,
            order_index INTEGER
        );
    """)
    
    # Tabela de critérios
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS criteria (
            id SERIAL PRIMARY KEY,
            theme_id INTEGER REFERENCES themes(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            order_index INTEGER
        );
    """)
    
    # Tabela de itens de avaliação
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessment_items (
            id SERIAL PRIMARY KEY,
            criteria_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
            question TEXT NOT NULL,
            order_index INTEGER
        );
    """)
    
    conn.commit()
    cursor.close()
    print("✅ Tabelas criadas/verificadas!")

def seed_pillars(conn):
    """Popula a tabela de pilares"""
    cursor = conn.cursor()
    
    pillars = [
        ('E', 'Ambiental', 'Avalie impactos ambientais, gestão de recursos naturais, emissões de carbono e estratégias de sustentabilidade', 'leaf', '#2D5F4F'),
        ('S', 'Social', 'Analise práticas de diversidade e inclusão, condições de trabalho, relacionamento com comunidade e responsabilidade social', 'users', '#8B4636'),
        ('G', 'Governança', 'Examine estruturas de governança corporativa, transparência, ética empresarial, compliance e gestão de riscos', 'briefcase', '#D4A574')
    ]
    
    cursor.execute("DELETE FROM pillars;")  # Limpar dados existentes
    
    for pillar in pillars:
        cursor.execute("""
            INSERT INTO pillars (code, name, description, icon, color)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (code) DO NOTHING;
        """, pillar)
    
    conn.commit()
    cursor.close()
    print(f"✅ {len(pillars)} pilares inseridos!")

def seed_questions(conn, json_file_path):
    """Popula temas, critérios e questões a partir do JSON"""
    cursor = conn.cursor()
    
    # Carregar JSON
    with open(json_file_path, 'r', encoding='utf-8') as f:
        esg_data = json.load(f)
    
    total_questions = 0
    
    for pillar_code, pillar_data in esg_data.items():
        # Buscar ID do pilar
        cursor.execute("SELECT id FROM pillars WHERE code = %s;", (pillar_code,))
        pillar_id = cursor.fetchone()[0]
        
        # Organizar questões por tema e critério
        themes_dict = {}
        
        for question in pillar_data['questions']:
            theme_name = question['theme']
            criteria_name = question['criteria']
            
            if theme_name not in themes_dict:
                themes_dict[theme_name] = {}
            
            if criteria_name not in themes_dict[theme_name]:
                themes_dict[theme_name][criteria_name] = []
            
            themes_dict[theme_name][criteria_name].append(question['question'])
        
        # Inserir temas, critérios e questões
        theme_order = 1
        for theme_name, criteria_dict in themes_dict.items():
            # Inserir tema
            cursor.execute("""
                INSERT INTO themes (pillar_id, name, order_index)
                VALUES (%s, %s, %s)
                RETURNING id;
            """, (pillar_id, theme_name, theme_order))
            theme_id = cursor.fetchone()[0]
            theme_order += 1
            
            # Inserir critérios e questões
            criteria_order = 1
            for criteria_name, questions_list in criteria_dict.items():
                # Inserir critério
                cursor.execute("""
                    INSERT INTO criteria (theme_id, name, order_index)
                    VALUES (%s, %s, %s)
                    RETURNING id;
                """, (theme_id, criteria_name, criteria_order))
                criteria_id = cursor.fetchone()[0]
                criteria_order += 1
                
                # Inserir questões
                question_order = 1
                for question_text in questions_list:
                    cursor.execute("""
                        INSERT INTO assessment_items (criteria_id, question, order_index)
                        VALUES (%s, %s, %s);
                    """, (criteria_id, question_text, question_order))
                    question_order += 1
                    total_questions += 1
        
        print(f"✅ Pilar {pillar_code}: {len(pillar_data['questions'])} questões inseridas!")
    
    conn.commit()
    cursor.close()
    print(f"\n🎉 TOTAL: {total_questions} questões inseridas com sucesso!")

def verify_data(conn):
    """Verifica os dados inseridos"""
    cursor = conn.cursor()
    
    print("\n" + "="*60)
    print("VERIFICAÇÃO DOS DADOS")
    print("="*60 + "\n")
    
    # Contar pilares
    cursor.execute("SELECT COUNT(*) FROM pillars;")
    pillars_count = cursor.fetchone()[0]
    print(f"✅ Pilares: {pillars_count}")
    
    # Contar temas
    cursor.execute("SELECT COUNT(*) FROM themes;")
    themes_count = cursor.fetchone()[0]
    print(f"✅ Temas: {themes_count}")
    
    # Contar critérios
    cursor.execute("SELECT COUNT(*) FROM criteria;")
    criteria_count = cursor.fetchone()[0]
    print(f"✅ Critérios: {criteria_count}")
    
    # Contar questões
    cursor.execute("SELECT COUNT(*) FROM assessment_items;")
    questions_count = cursor.fetchone()[0]
    print(f"✅ Questões: {questions_count}")
    
    # Breakdown por pilar
    print("\nBreakdown por Pilar:")
    cursor.execute("""
        SELECT p.code, p.name, COUNT(ai.id) as total_questions
        FROM pillars p
        LEFT JOIN themes t ON p.id = t.pillar_id
        LEFT JOIN criteria c ON t.id = c.theme_id
        LEFT JOIN assessment_items ai ON c.id = ai.criteria_id
        GROUP BY p.id, p.code, p.name
        ORDER BY p.code;
    """)
    
    for row in cursor.fetchall():
        print(f"  - {row[0]} ({row[1]}): {row[2]} questões")
    
    cursor.close()
    print("\n" + "="*60)

def main():
    """Função principal"""
    print("\n" + "="*60)
    print("🌱 GREENA - Script de Seed do Banco de Dados ESG")
    print("="*60 + "\n")
    
    # Conectar ao banco
    conn = create_connection()
    if not conn:
        return
    
    try:
        # Criar tabelas
        create_tables(conn)
        
        # Popular pilares
        seed_pillars(conn)
        
        # Popular questões
        json_path = 'esg_questions_complete.json'
        if not os.path.exists(json_path):
            print(f"❌ Arquivo {json_path} não encontrado!")
            print("   Certifique-se de que o arquivo JSON está no mesmo diretório.")
            return
        
        seed_questions(conn, json_path)
        
        # Verificar dados
        verify_data(conn)
        
        print("\n✅ Seed concluído com sucesso!\n")
        
    except Exception as e:
        print(f"\n❌ Erro durante o seed: {e}")
        conn.rollback()
    
    finally:
        conn.close()
        print("Conexão com banco encerrada.\n")

if __name__ == "__main__":
    main()
"""
Script de Seed Alternativo usando Prisma (TypeScript/JavaScript)
--------------------------------------------------------------

// seed.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados ESG...\n');

  // Limpar dados existentes (opcional)
  await prisma.assessmentItem.deleteMany();
  await prisma.criteria.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.pillar.deleteMany();

  // Criar pilares
  const pillars = await Promise.all([
    prisma.pillar.create({
      data: {
        code: 'E',
        name: 'Ambiental',
        description: 'Avalie impactos ambientais, gestão de recursos naturais, emissões de carbono e estratégias de sustentabilidade',
        icon: 'leaf',
        color: '#2D5F4F'
      }
    }),
    prisma.pillar.create({
      data: {
        code: 'S',
        name: 'Social',
        description: 'Analise práticas de diversidade e inclusão, condições de trabalho, relacionamento com comunidade e responsabilidade social',
        icon: 'users',
        color: '#8B4636'
      }
    }),
    prisma.pillar.create({
      data: {
        code: 'G',
        name: 'Governança',
        description: 'Examine estruturas de governança corporativa, transparência, ética empresarial, compliance e gestão de riscos',
        icon: 'briefcase',
        color: '#D4A574'
      }
    })
  ]);

  console.log(`✅ ${pillars.length} pilares criados!`);

  // Carregar JSON
  const esgData = JSON.parse(fs.readFileSync('esg_questions_complete.json', 'utf-8'));

  let totalQuestions = 0;

  for (const pillarCode of ['E', 'S', 'G']) {
    const pillar = pillars.find(p => p.code === pillarCode);
    const pillarData = esgData[pillarCode];

    // Organizar por tema e critério
    const themesMap = new Map();

    for (const question of pillarData.questions) {
      if (!themesMap.has(question.theme)) {
        themesMap.set(question.theme, new Map());
      }
      const criteriaMap = themesMap.get(question.theme);
      
      if (!criteriaMap.has(question.criteria)) {
        criteriaMap.set(question.criteria, []);
      }
      criteriaMap.get(question.criteria).push(question.question);
    }

    // Inserir temas, critérios e questões
    let themeOrder = 1;
    for (const [themeName, criteriaMap] of themesMap) {
      const theme = await prisma.theme.create({
        data: {
          pillarId: pillar.id,
          name: themeName,
          order: themeOrder++
        }
      });

      let criteriaOrder = 1;
      for (const [criteriaName, questionsList] of criteriaMap) {
        const criteria = await prisma.criteria.create({
          data: {
            themeId: theme.id,
            name: criteriaName,
            order: criteriaOrder++
          }
        });

        let questionOrder = 1;
        for (const questionText of questionsList) {
          await prisma.assessmentItem.create({
            data: {
              criteriaId: criteria.id,
              question: questionText,
              order: questionOrder++
            }
          });
          totalQuestions++;
        }
      }
    }

    console.log(`✅ Pilar ${pillarCode}: ${pillarData.questions.length} questões inseridas!`);
  }

  console.log(`\n🎉 TOTAL: ${totalQuestions} questões inseridas com sucesso!\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
"""
