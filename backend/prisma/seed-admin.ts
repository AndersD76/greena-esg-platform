import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Superadmin credentials
  const superadminEmail = 'admin@greena.com.br';
  const superadminPassword = 'Greena@Admin2024';
  const superadminName = 'Super Admin Greena';

  // Check if superadmin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: superadminEmail }
  });

  if (existingAdmin) {
    console.log('Superadmin already exists. Updating role...');
    await prisma.user.update({
      where: { email: superadminEmail },
      data: { role: 'superadmin', isActive: true }
    });
    console.log('Superadmin role updated successfully!');
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(superadminPassword, 10);

  // Create superadmin
  const superadmin = await prisma.user.create({
    data: {
      email: superadminEmail,
      passwordHash,
      name: superadminName,
      role: 'superadmin',
      isActive: true,
      companyName: 'Greena ESG',
    }
  });

  console.log('Superadmin created successfully!');
  console.log('-----------------------------------');
  console.log('Email:', superadminEmail);
  console.log('Password:', superadminPassword);
  console.log('-----------------------------------');
  console.log('IMPORTANT: Change the password after first login!');
}

main()
  .catch((e) => {
    console.error('Error creating superadmin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
