import { PrismaClient, Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';
import asyncWrapper from '../middlewares/async-wrapper';
import { MIN_VALUE, currencyFormatter, MAX_VALUE } from '../utils/currency';
import { getGoalTotalExpenses } from '../utils/prisma';

const prisma = new PrismaClient();

const getAllGoals = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const {
      minValue,
      maxValue,
      startDate,
      endDate,
      categoryId,
      essentialExpenses,
    } = req.query;

    let goals = await prisma.goal.findMany({
      where: {
        value: {
          gte: Number(minValue) || undefined,
          lte: Number(maxValue) || undefined,
        },
        essentialExpenses:
          essentialExpenses !== undefined
            ? essentialExpenses == 'true'
            : undefined,
        userId: user.role !== Role.ADMIN ? user.id : undefined,
        categoryId: Number(categoryId) || undefined,
      },
      include: { category: true, user: false },
    });

    // Mapping each goal to the total expenses of the month
    const goalsWithExpenses = await Promise.all(
      goals.map(async (goal) => {
        return await getGoalTotalExpenses(
          goal,
          (startDate as string) || undefined,
          (endDate as string) || undefined
        );
      })
    );
    return res.status(StatusCodes.OK).json({ goals: goalsWithExpenses });
  }
);

const getSpecificGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { goalId } = req.params;
    const { startDate, endDate } = req.query;

    const goal = await prisma.goal.findFirst({
      where: { id: Number(goalId) },
      include: { category: true, user: false },
    });

    if (!goal) {
      throw new NotFoundError(`Nenhuma meta foi encontrada com o id ${goalId}`);
    } else if (user.role !== Role.ADMIN && user.id !== goal.userId) {
      throw new ForbiddenError(
        'Você não tem permissão para acessar esse conteúdo'
      );
    }

    // Mapping the goal to the total expenses of the month
    const goalWithExpenses = await getGoalTotalExpenses(
      goal,
      (startDate as string) || undefined,
      (endDate as string) || undefined
    );

    return res.status(StatusCodes.OK).json({ goal: goalWithExpenses });
  }
);

const createGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { value, categoryId, essentialExpenses } = req.body;
    const { startDate, endDate } = req.query;

    if (!value) {
      throw new BadRequestError('Por favor, informe o limite da meta');
    } else if (!categoryId) {
      throw new BadRequestError('Por favor, informe a categoria da meta');
    } else if (value <= MIN_VALUE) {
      throw new BadRequestError(
        `O limite de uma meta precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    } else if (value > MAX_VALUE) {
      throw new BadRequestError(
        `O valor máximo para o limite de uma meta é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    }

    // Checking if the user already has a goal on this category
    const goalAlreadyExists = await prisma.goal.findFirst({
      where: {
        userId: user.id,
        categoryId,
        essentialExpenses: essentialExpenses || false,
      },
    });

    if (goalAlreadyExists) {
      throw new BadRequestError(
        'Você só pode ter uma meta por categoria e tipo'
      );
    }

    // Checking if the category is in the database
    const category = await prisma.category.findFirst({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError(
        `Nenhuma categoria foi encontrada com o id ${categoryId}`
      );
    }
    const goal = await prisma.goal.create({
      data: {
        user: { connect: { id: user.id } },
        category: { connect: { id: categoryId } },
        value,
        essentialExpenses:
          essentialExpenses !== undefined ? essentialExpenses : undefined,
      },
      include: { category: true, user: false },
    });

    // Mapping the goal to the total expenses of the month
    const goalWithExpenses = await getGoalTotalExpenses(
      goal,
      (startDate as string) || undefined,
      (endDate as string) || undefined
    );
    return res.status(StatusCodes.CREATED).json({ goal: goalWithExpenses });
  }
);

const updateGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { goalId } = req.params;
    const { value, categoryId, essentialExpenses } = req.body;
    const { startDate, endDate } = req.query;

    if (!value && !categoryId && essentialExpenses === undefined) {
      throw new BadRequestError(
        'Por favor, informe um novo limite, tipo ou categoria para a meta'
      );
    } else if (value <= MIN_VALUE) {
      throw new BadRequestError(
        `O limite de uma meta precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    } else if (value > MAX_VALUE) {
      throw new BadRequestError(
        `O valor máximo para o limite de uma meta é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    }

    // Checking if the category is in the database
    const category = await prisma.category.findFirst({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError(
        `Nenhuma categoria foi encontrada com o id ${categoryId}`
      );
    }

    // Checking if the goal is in the database
    const goal = await prisma.goal.findFirst({
      where: { id: Number(goalId) },
    });

    if (!goal) {
      throw new NotFoundError(`Nenhuma meta foi encontrada com o id ${goalId}`);
    }

    // Checking if the requesting created the goal
    if (goal.userId !== user.id) {
      throw new ForbiddenError(
        'Você não tem permissão para acessar esse conteúdo'
      );
    }

    // Updating the goal
    const updatedGoal = await prisma.goal.update({
      where: { id: Number(goalId) },
      data: {
        value,
        categoryId,
        essentialExpenses:
          essentialExpenses !== undefined ? essentialExpenses : undefined,
      },
      include: { category: true, user: false },
    });

    // Mapping the goal to the total expenses of the month
    const updatedGoalWithExpenses = await getGoalTotalExpenses(
      updatedGoal,
      (startDate as string) || undefined,
      (endDate as string) || undefined
    );
    return res.status(StatusCodes.OK).json({ goal: updatedGoalWithExpenses });
  }
);

const deleteGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { goalId } = req.params;
    const { startDate, endDate } = req.query;

    const goal = await prisma.goal.findFirst({
      where: { id: Number(goalId) },
      include: { category: true, user: false },
    });

    if (!goal) {
      throw new NotFoundError(`Nenhuma meta foi encontrada com o id ${goalId}`);
    }

    // Checking if the requesting user is an admin or the user who created the goal
    if (user.role !== Role.ADMIN && goal.userId !== user.id) {
      throw new ForbiddenError(
        'Você não tem permissão para acessar esse conteúdo'
      );
    }

    // Mapping the goal to the total expenses of the month
    const goalWithExpenses = await getGoalTotalExpenses(
      goal,
      (startDate as string) || undefined,
      (endDate as string) || undefined
    );

    // Deleting the goal
    await prisma.goal.delete({
      where: { id: Number(goalId) },
    });
    return res.status(StatusCodes.OK).json({ goal: goalWithExpenses });
  }
);

export { getAllGoals, getSpecificGoal, createGoal, updateGoal, deleteGoal };
