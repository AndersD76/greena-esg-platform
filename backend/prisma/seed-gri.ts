import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const GRI_PILLARS = [
  {
    code: 'GRI-U',
    name: 'Universais',
    description: 'Conteúdos gerais, governança organizacional e tópicos materiais (GRI 2 e GRI 3)',
    icon: '📋',
    color: '#5B6ABF',
    macroCategory: 'universal',
    sortOrder: 1,
  },
  {
    code: 'GRI-E',
    name: 'Ambiental',
    description: 'Biodiversidade, mudanças climáticas, energia, água, resíduos e fornecedores (GRI 101-308)',
    icon: '🌿',
    color: '#2E7D4F',
    macroCategory: 'ambiental',
    sortOrder: 2,
  },
  {
    code: 'GRI-S',
    name: 'Social',
    description: 'Emprego, saúde e segurança, capacitação, diversidade, comunidades e privacidade (GRI 401-418)',
    icon: '🤝',
    color: '#C0392B',
    macroCategory: 'social',
    sortOrder: 3,
  },
  {
    code: 'GRI-EC',
    name: 'Econômico',
    description: 'Desempenho econômico, presença no mercado, compras e anticorrupção (GRI 201-205)',
    icon: '💰',
    color: '#D4A017',
    macroCategory: 'economico',
    sortOrder: 4,
  },
];

async function main() {
  console.log('🌱 Iniciando seed GRI...');

  // 1. Criar pilares GRI
  console.log('📊 Criando pilares GRI...');
  const pillarMap = new Map<string, number>();

  for (const p of GRI_PILLARS) {
    const pillar = await prisma.pillar.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        description: p.description,
        icon: p.icon,
        color: p.color,
        framework: 'GRI',
        sortOrder: p.sortOrder,
        macroCategory: p.macroCategory,
      },
      create: {
        code: p.code,
        name: p.name,
        description: p.description,
        icon: p.icon,
        color: p.color,
        framework: 'GRI',
        sortOrder: p.sortOrder,
        macroCategory: p.macroCategory,
      },
    });
    pillarMap.set(p.code, pillar.id);
  }
  console.log('✅ Pilares GRI criados!');

  // 2. Ler questões GRI
  const griPath = path.join(__dirname, '../gri_questions.json');
  if (!fs.existsSync(griPath)) {
    console.error('❌ Arquivo gri_questions.json não encontrado. Execute primeiro a geração das questões.');
    return;
  }
  const griData = JSON.parse(fs.readFileSync(griPath, 'utf-8'));

  // 3. Processar cada pilar GRI
  const griItemMap = new Map<string, number>(); // griCode -> assessmentItemId

  for (const pillarCode of ['GRI-U', 'GRI-E', 'GRI-S', 'GRI-EC']) {
    const pillarData = griData[pillarCode];
    if (!pillarData) {
      console.warn(`⚠️ Pilar ${pillarCode} não encontrado no JSON.`);
      continue;
    }

    const pillarId = pillarMap.get(pillarCode)!;
    console.log(`\n📋 Processando pilar ${pillarCode} - ${pillarData.name}...`);

    const themeMap = new Map<string, number>();
    const criteriaMap = new Map<string, number>();
    let questionCount = 0;

    for (const q of pillarData.questions) {
      if (!themeMap.has(q.theme)) {
        const theme = await prisma.theme.create({
          data: {
            pillarId,
            name: q.theme,
            order: themeMap.size + 1,
          },
        });
        themeMap.set(q.theme, theme.id);
      }

      const themeId = themeMap.get(q.theme)!;

      const criteriaKey = `${q.theme}|${q.criteria}`;
      if (!criteriaMap.has(criteriaKey)) {
        const criteria = await prisma.criteria.create({
          data: {
            themeId,
            name: q.criteria,
            order: criteriaMap.size + 1,
          },
        });
        criteriaMap.set(criteriaKey, criteria.id);
      }

      const criteriaId = criteriaMap.get(criteriaKey)!;

      const item = await prisma.assessmentItem.create({
        data: {
          criteriaId,
          question: q.question,
          order: questionCount + 1,
          griCode: q.griCode,
          frameworkTag: 'GRI',
          dataFields: q.dataFields || undefined,
        },
      });

      griItemMap.set(q.griCode, item.id);
      questionCount++;
    }

    console.log(`✅ Pilar ${pillarCode}: ${questionCount} questões, ${themeMap.size} temas, ${criteriaMap.size} critérios`);
  }

  // 4. Criar mapeamentos ESG <-> GRI
  const mappingPath = path.join(__dirname, '../gri_esg_mapping.json');
  if (!fs.existsSync(mappingPath)) {
    console.warn('⚠️ gri_esg_mapping.json não encontrado. Pulando mapeamento.');
  } else {
    console.log('\n🔗 Criando mapeamentos ESG <-> GRI...');
    const mappings: Array<{ esgId: string; griCodes: string[]; compatibilityLevel: string }> =
      JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

    // Buscar todos os assessment items ESG com seus IDs
    const esgItems = await prisma.assessmentItem.findMany({
      where: { frameworkTag: 'ESG' },
      include: {
        criteria: {
          include: {
            theme: {
              include: { pillar: true },
            },
          },
        },
      },
    });

    // Criar mapa esgId (ex: "E.1") -> assessmentItemId
    const esgIdMap = new Map<string, number>();
    const esgItemsByPillar: Record<string, typeof esgItems> = {};

    for (const item of esgItems) {
      const pillarCode = item.criteria.theme.pillar.code;
      if (!esgItemsByPillar[pillarCode]) esgItemsByPillar[pillarCode] = [];
      esgItemsByPillar[pillarCode].push(item);
    }

    for (const [code, items] of Object.entries(esgItemsByPillar)) {
      items.sort((a, b) => a.order - b.order);
      items.forEach((item, idx) => {
        esgIdMap.set(`${code}.${idx + 1}`, item.id);
      });
    }

    let mappingCount = 0;
    let skippedCount = 0;
    const esgIdsWithGri = new Set<number>();

    for (const m of mappings) {
      const esgItemId = esgIdMap.get(m.esgId);
      if (!esgItemId) {
        skippedCount++;
        continue;
      }

      for (const griCode of m.griCodes) {
        const griItemId = griItemMap.get(griCode);
        if (!griItemId) continue;

        try {
          await prisma.frameworkMapping.create({
            data: {
              esgAssessmentItemId: esgItemId,
              griAssessmentItemId: griItemId,
              compatibilityLevel: m.compatibilityLevel,
            },
          });
          esgIdsWithGri.add(esgItemId);
          mappingCount++;
        } catch {
          // duplicate, skip
        }
      }
    }

    // Atualizar frameworkTag das questões ESG compatíveis
    if (esgIdsWithGri.size > 0) {
      await prisma.assessmentItem.updateMany({
        where: { id: { in: Array.from(esgIdsWithGri) } },
        data: { frameworkTag: 'ESG_GRI' },
      });
      console.log(`✅ ${esgIdsWithGri.size} questões ESG marcadas como ESG_GRI`);
    }

    console.log(`✅ ${mappingCount} mapeamentos criados (${skippedCount} pulados)`);
  }

  // 5. Resumo
  console.log('\n🎉 Seed GRI concluído!');
  const totalPillars = await prisma.pillar.count({ where: { framework: 'GRI' } });
  const totalThemes = await prisma.theme.count({
    where: { pillar: { framework: 'GRI' } },
  });
  const totalGriQuestions = await prisma.assessmentItem.count({
    where: { frameworkTag: 'GRI' },
  });
  const totalEsgGri = await prisma.assessmentItem.count({
    where: { frameworkTag: 'ESG_GRI' },
  });
  const totalMappings = await prisma.frameworkMapping.count();

  console.log(`   - Pilares GRI: ${totalPillars}`);
  console.log(`   - Temas GRI: ${totalThemes}`);
  console.log(`   - Questões GRI: ${totalGriQuestions}`);
  console.log(`   - Questões ESG com correspondência GRI: ${totalEsgGri}`);
  console.log(`   - Mapeamentos: ${totalMappings}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro ao executar seed GRI:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
