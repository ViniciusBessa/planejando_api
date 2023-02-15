import { Goal, PrismaClient } from '@prisma/client';
import { GoalWithExpenses } from '../models/goal-with-expenses';

const prisma = new PrismaClient();

const getGoalTotalExpenses = async (
  goal: Goal,
  startDate?: string,
  endDate?: string
): Promise<GoalWithExpenses> => {
  if (startDate && endDate) {
    const startSearchDate = new Date(startDate).toISOString().split('T')[0];
    const endSearchDate = new Date(endDate).toISOString().split('T')[0];

    const sumExpenses = (await prisma.$queryRaw`
      SELECT SUM(value) as total
      FROM expenses
      WHERE "userId" = ${goal.userId}
      AND "isEssential" = ${goal.essentialExpenses}
      AND "categoryId" = ${goal.categoryId}
      AND "date"::date BETWEEN ${startSearchDate}
      AND ${endSearchDate}
      GROUP BY "categoryId"
  `) as { total: number }[];

    return {
      ...goal,
      sumExpenses: sumExpenses.length > 0 ? sumExpenses[0].total : 0,
    };
  }

  const sumExpenses = (await prisma.$queryRaw`
    SELECT SUM(value) as total
    FROM expenses
    WHERE "userId" = ${goal.userId}
    AND "isEssential" = ${goal.essentialExpenses}
    AND "categoryId" = ${goal.categoryId}
    AND "date"::date BETWEEN date_trunc('month', now())::date
    AND now()::date
    GROUP BY "categoryId"
  `) as { total: number }[];

  return {
    ...goal,
    sumExpenses: sumExpenses.length > 0 ? sumExpenses[0].total : 0,
  };
};

export { getGoalTotalExpenses };
