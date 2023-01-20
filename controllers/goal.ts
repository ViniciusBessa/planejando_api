import { PrismaClient, Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';
import asyncWrapper from '../middlewares/async-wrapper';

const prisma = new PrismaClient();

const getAllGoals = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { minValue, maxValue, minDate, maxDate, categoryId } = req.query;

    const goals = await prisma.goal.findMany({
      where: {
        value: {
          gte: Number(minValue) || undefined,
          lte: Number(maxValue) || undefined,
        },
        createdAt: {
          gte: minDate ? new Date(minDate as string) : undefined,
          lte: maxDate ? new Date(maxDate as string) : undefined,
        },
        userId: user.role !== Role.ADMIN ? user.id : undefined,
        categoryId: Number(categoryId) || undefined,
      },
    });
    return res.status(StatusCodes.OK).json({ goals });
  }
);

const getSpecificGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { goalId } = req.params;

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
    return res.status(StatusCodes.OK).json({ goal });
  }
);

const createGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { value, categoryId } = req.body;

    if (!value) {
      throw new BadRequestError('Por favor, informe o limite da meta');
    }

    // Checking if the category is on the database
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
      },
      include: { category: true, user: false },
    });
    return res.status(StatusCodes.CREATED).json({ goal });
  }
);

const updateGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { goalId } = req.params;
    const { value } = req.body;

    if (!value) {
      throw new BadRequestError('Por favor, informe o novo limite da meta');
    }
    const goal = await prisma.goal.findFirst({
      where: { id: Number(goalId) },
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

    // Updating the goal
    const updatedGoal = await prisma.goal.update({
      where: { id: Number(goalId) },
      data: { value },
      include: { category: true, user: false },
    });
    return res.status(StatusCodes.OK).json({ goal: updatedGoal });
  }
);

const deleteGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { goalId } = req.params;

    const goal = await prisma.goal.findFirst({
      where: { id: Number(goalId) },
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
    // Deleting the goal
    const deletedGoal = await prisma.goal.delete({
      where: { id: Number(goalId) },
      include: { category: true, user: false },
    });
    return res.status(StatusCodes.OK).json({ goal: deletedGoal });
  }
);

export { getAllGoals, getSpecificGoal, createGoal, updateGoal, deleteGoal };
