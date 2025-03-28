import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Categories
  await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Alimentação',
      description: 'Uma categoria para agrupar suas despesas com alimentos',
    },
  });

  await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Compras',
      description: 'Uma categoria para agrupar suas despesas em compras',
    },
  });

  await prisma.category.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'Contas',
      description:
        'Uma categoria para agrupar suas despesas com as contas mensais',
    },
  });

  await prisma.category.upsert({
    where: { id: 4 },
    update: {},
    create: {
      title: 'Educação',
      description:
        'Uma categoria para agrupar suas despesas relacionadas à educação',
    },
  });

  await prisma.category.upsert({
    where: { id: 5 },
    update: {},
    create: {
      title: 'Investimentos',
      description: 'Uma categoria para agrupar suas despesas em investimentos',
    },
  });

  await prisma.category.upsert({
    where: { id: 6 },
    update: {},
    create: {
      title: 'Outros',
      description:
        'Uma categoria para agrupar suas despesas que não se encaixam nas outras categorias',
    },
  });

  await prisma.category.upsert({
    where: { id: 7 },
    update: {},
    create: {
      title: 'Saúde',
      description:
        'Uma categoria para agrupar suas despesas relacionadas à saúde',
    },
  });
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  });
