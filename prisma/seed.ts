import { PrismaClient } from '@prisma/client';
import { generatePassword } from '../utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Users
  const syntyche = await prisma.user.upsert({
    where: { email: 'syntyche@gmail.com' },
    update: {},
    create: {
      name: 'Syntyche Joann',
      email: 'syntyche@gmail.com',
      password: await generatePassword('sjoann'),
      role: 'ADMIN',
    },
  });

  const taqqiq = await prisma.user.upsert({
    where: { email: 'taqqiq@gmail.com' },
    update: {},
    create: {
      name: 'Taqqiq Berlin',
      email: 'taqqiq@gmail.com',
      password: await generatePassword('tberlin'),
      role: 'USER',
    },
  });

  const rosalinda = await prisma.user.upsert({
    where: { email: 'rosalinda@gmail.com' },
    update: {},
    create: {
      name: 'Rosalinda Astrid',
      email: 'rosalinda@gmail.com',
      password: await generatePassword('rastrid'),
      role: 'USER',
    },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john@gmail.com' },
    update: {},
    create: {
      name: 'John Astrid',
      email: 'john@gmail.com',
      password: await generatePassword('jastrid'),
      role: 'USER',
    },
  });

  // Categories
  const food = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Alimentação',
      description: 'Uma categoria para agrupar suas despesas com alimentos',
    },
  });

  const education = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Educação',
      description:
        'Uma categoria para agrupar suas despesas relacionadas à educação',
    },
  });

  const health = await prisma.category.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'Saúde',
      description:
        'Uma categoria para agrupar suas despesas relacionadas à saúde',
    },
  });

  const energy = await prisma.category.upsert({
    where: { id: 4 },
    update: {},
    create: {
      title: 'Energia elétrica',
      description:
        'Uma categoria para agrupar suas despesas com energia elétrica',
    },
  });

  const investment = await prisma.category.upsert({
    where: { id: 5 },
    update: {},
    create: {
      title: 'Investimentos',
      description: 'Uma categoria para agrupar suas despesas em investimentos',
    },
  });

  // Revenues
  await prisma.revenue.upsert({
    where: { id: 1 },
    update: {},
    create: {
      user: { connect: { id: syntyche.id } },
      value: 200.99,
    },
  });

  await prisma.revenue.upsert({
    where: { id: 2 },
    update: {},
    create: {
      user: { connect: { id: syntyche.id } },
      value: 400.99,
    },
  });

  await prisma.revenue.upsert({
    where: { id: 3 },
    update: {},
    create: {
      user: { connect: { id: taqqiq.id } },
      value: 2000,
    },
  });

  await prisma.revenue.upsert({
    where: { id: 4 },
    update: {},
    create: {
      user: { connect: { id: taqqiq.id } },
      value: 1000,
    },
  });

  await prisma.revenue.upsert({
    where: { id: 5 },
    update: {},
    create: {
      user: { connect: { id: taqqiq.id } },
      value: 20,
    },
  });

  await prisma.revenue.upsert({
    where: { id: 6 },
    update: {},
    create: {
      user: { connect: { id: rosalinda.id } },
      value: 60,
    },
  });

  await prisma.revenue.upsert({
    where: { id: 7 },
    update: {},
    create: {
      user: { connect: { id: rosalinda.id } },
      value: 6000,
    },
  });

  // Goals
  await prisma.goal.upsert({
    where: { id: 1 },
    update: {},
    create: {
      user: { connect: { id: syntyche.id } },
      category: { connect: { id: food.id } },
      value: 200.99,
    },
  });

  await prisma.goal.upsert({
    where: { id: 2 },
    update: {},
    create: {
      user: { connect: { id: syntyche.id } },
      category: { connect: { id: education.id } },
      value: 400.99,
    },
  });

  await prisma.goal.upsert({
    where: { id: 3 },
    update: {},
    create: {
      user: { connect: { id: taqqiq.id } },
      category: { connect: { id: food.id } },
      value: 2000,
    },
  });

  await prisma.goal.upsert({
    where: { id: 4 },
    update: {},
    create: {
      user: { connect: { id: taqqiq.id } },
      category: { connect: { id: food.id } },
      value: 1000,
    },
  });

  await prisma.goal.upsert({
    where: { id: 5 },
    update: {},
    create: {
      user: { connect: { id: taqqiq.id } },
      category: { connect: { id: investment.id } },
      value: 20,
    },
  });

  await prisma.goal.upsert({
    where: { id: 6 },
    update: {},
    create: {
      user: { connect: { id: rosalinda.id } },
      category: { connect: { id: food.id } },
      value: 60,
    },
  });

  await prisma.goal.upsert({
    where: { id: 7 },
    update: {},
    create: {
      user: { connect: { id: rosalinda.id } },
      category: { connect: { id: investment.id } },
      value: 6000,
    },
  });

  // Expenses
  await prisma.expense.upsert({
    where: { id: 1 },
    update: {},
    create: {
      user: { connect: { id: syntyche.id } },
      category: { connect: { id: food.id } },
      value: 200.99,
      description: 'Spent on food',
      isEssential: true,
    },
  });

  await prisma.expense.upsert({
    where: { id: 2 },
    update: {},
    create: {
      user: { connect: { id: syntyche.id } },
      category: { connect: { id: education.id } },
      value: 400.99,
      description: 'Spent on books',
    },
  });

  await prisma.expense.upsert({
    where: { id: 3 },
    update: {},
    create: {
      user: { connect: { id: taqqiq.id } },
      category: { connect: { id: food.id } },
      value: 2000,
      description: 'Spent on food',
      isEssential: true,
    },
  });

  await prisma.expense.upsert({
    where: { id: 4 },
    update: {},
    create: {
      user: { connect: { id: taqqiq.id } },
      category: { connect: { id: food.id } },
      value: 1000,
      description: 'Spent on more food',
      isEssential: true,
    },
  });

  await prisma.expense.upsert({
    where: { id: 5 },
    update: {},
    create: {
      user: { connect: { id: taqqiq.id } },
      category: { connect: { id: investment.id } },
      value: 20,
      description: 'Spent on stocks',
    },
  });

  await prisma.expense.upsert({
    where: { id: 6 },
    update: {},
    create: {
      user: { connect: { id: rosalinda.id } },
      category: { connect: { id: food.id } },
      value: 60,
      description: 'Spent on food',
      isEssential: true,
    },
  });

  await prisma.expense.upsert({
    where: { id: 7 },
    update: {},
    create: {
      user: { connect: { id: rosalinda.id } },
      category: { connect: { id: investment.id } },
      value: 6000,
      description: 'Spent on stocks',
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
