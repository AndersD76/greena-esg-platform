import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n=== USUÁRIOS CADASTRADOS ===\n');

    if (users.length === 0) {
      console.log('Nenhum usuário cadastrado.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Empresa: ${user.companyName || 'N/A'}`);
        console.log(`   Cadastrado em: ${user.createdAt.toLocaleString('pt-BR')}`);
        console.log('');
      });
      console.log(`Total: ${users.length} usuário(s)`);
    }
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
