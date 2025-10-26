import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // 1. Criar Pilares
  console.log('📊 Criando pilares ESG...');
  const pillarE = await prisma.pillar.upsert({
    where: { code: 'E' },
    update: {},
    create: {
      code: 'E',
      name: 'Ambiental',
      description: 'Avalia práticas ambientais, climáticas e de sustentabilidade',
      icon: '🌍',
      color: '#2D5F4F'
    }
  });

  const pillarS = await prisma.pillar.upsert({
    where: { code: 'S' },
    update: {},
    create: {
      code: 'S',
      name: 'Social',
      description: 'Avalia práticas sociais, direitos humanos e responsabilidade social',
      icon: '👥',
      color: '#8B4636'
    }
  });

  const pillarG = await prisma.pillar.upsert({
    where: { code: 'G' },
    update: {},
    create: {
      code: 'G',
      name: 'Governança',
      description: 'Avalia governança corporativa, compliance e transparência',
      icon: '🏢',
      color: '#D4A574'
    }
  });

  console.log('✅ Pilares criados!');

  // 2. Ler arquivo JSON com as questões
  const jsonPath = path.join(__dirname, '../esg_questions_complete.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // 3. Processar cada pilar
  for (const pillarCode of ['E', 'S', 'G']) {
    const pillarData = jsonData[pillarCode];
    const pillarId = pillarCode === 'E' ? pillarE.id : pillarCode === 'S' ? pillarS.id : pillarG.id;

    console.log(`\n📋 Processando pilar ${pillarCode} - ${pillarData.name}...`);

    const themeMap = new Map<string, number>();
    const criteriaMap = new Map<string, number>();

    let questionCount = 0;

    for (const questionData of pillarData.questions) {
      // Criar tema se não existir
      if (!themeMap.has(questionData.theme)) {
        const theme = await prisma.theme.create({
          data: {
            pillarId,
            name: questionData.theme,
            order: themeMap.size + 1
          }
        });
        themeMap.set(questionData.theme, theme.id);
      }

      const themeId = themeMap.get(questionData.theme)!;

      // Criar critério se não existir
      const criteriaKey = `${questionData.theme}|${questionData.criteria}`;
      if (!criteriaMap.has(criteriaKey)) {
        const criteria = await prisma.criteria.create({
          data: {
            themeId,
            name: questionData.criteria,
            order: criteriaMap.size + 1
          }
        });
        criteriaMap.set(criteriaKey, criteria.id);
      }

      const criteriaId = criteriaMap.get(criteriaKey)!;

      // Criar item de avaliação (questão)
      await prisma.assessmentItem.create({
        data: {
          criteriaId,
          question: questionData.question,
          order: questionCount + 1
        }
      });

      questionCount++;
    }

    console.log(`✅ Pilar ${pillarCode}: ${questionCount} questões, ${themeMap.size} temas, ${criteriaMap.size} critérios`);
  }

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('📊 Resumo:');

  const totalPillars = await prisma.pillar.count();
  const totalThemes = await prisma.theme.count();
  const totalCriteria = await prisma.criteria.count();
  const totalQuestions = await prisma.assessmentItem.count();

  console.log(`   - Pilares: ${totalPillars}`);
  console.log(`   - Temas: ${totalThemes}`);
  console.log(`   - Critérios: ${totalCriteria}`);
  console.log(`   - Questões: ${totalQuestions}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro ao executar seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
