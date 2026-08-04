import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Atualizando dataFields das questões GRI...');

  const griPath = path.join(__dirname, '../gri_questions.json');
  const griData = JSON.parse(fs.readFileSync(griPath, 'utf-8'));

  let updated = 0;

  for (const pillarCode of ['GRI-U', 'GRI-E', 'GRI-S', 'GRI-EC']) {
    const pillarData = griData[pillarCode];
    if (!pillarData) continue;

    for (const q of pillarData.questions) {
      if (!q.dataFields || !q.griCode) continue;

      const result = await prisma.assessmentItem.updateMany({
        where: { griCode: q.griCode },
        data: { dataFields: q.dataFields },
      });

      if (result.count > 0) {
        updated += result.count;
      }
    }
  }

  console.log(`${updated} questões GRI atualizadas com dataFields.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Erro:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
