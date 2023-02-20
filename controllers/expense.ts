import { PrismaClient, Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';
import asyncWrapper from '../middlewares/async-wrapper';
import { MIN_VALUE, currencyFormatter, MAX_VALUE } from '../utils/currency';

const prisma = new PrismaClient();

const getAllExpenses = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const {
      minValue,
      maxValue,
      isEssential,
      minDate,
      maxDate,
      categoryId,
      description,
    } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        value: {
          gte: Number(minValue) || undefined,
          lte: Number(maxValue) || undefined,
        },
        isEssential:
          isEssential !== undefined ? isEssential == 'true' : undefined,
        date: {
          gte: minDate ? new Date(minDate as string) : undefined,
          lte: maxDate ? new Date(maxDate as string) : undefined,
        },
        userId: user.role !== Role.ADMIN ? user.id : undefined,
        categoryId: Number(categoryId) || undefined,
        description: {
          search: description?.toString(),
        },
      },
      include: { category: true, user: false },
    });
    return res.status(StatusCodes.OK).json({ expenses });
  }
);

const getSpecificExpense = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { expenseId } = req.params;

    const expense = await prisma.expense.findFirst({
      where: { id: Number(expenseId) },
      include: { category: true, user: false },
    });

    if (!expense) {
      throw new NotFoundError(
        `Nenhuma despesa foi encontrada com o id ${expenseId}`
      );
    } else if (user.role !== Role.ADMIN && user.id !== expense.userId) {
      throw new ForbiddenError(
        'Você não tem permissão para acessar esse conteúdo'
      );
    }
    return res.status(StatusCodes.OK).json({ expense });
  }
);

const createExpense = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { value, description, isEssential, categoryId, date } = req.body;

    if (!value || !description) {
      throw new BadRequestError(
        'Por favor, informe o valor e a descrição da despesa'
      );
    } else if (value <= MIN_VALUE) {
      throw new BadRequestError(
        `O valor de uma despesa precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    } else if (value > MAX_VALUE) {
      throw new BadRequestError(
        `O valor máximo para uma despesa é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    } else if (description.length > 200) {
      throw new BadRequestError(
        'A descrição de uma despesa só pode ter até 200 caracteres'
      );
    } else if (!categoryId) {
      throw new BadRequestError('Por favor, informe a categoria da despesa');
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
    const expense = await prisma.expense.create({
      data: {
        user: { connect: { id: user.id } },
        category: { connect: { id: categoryId } },
        value,
        description,
        date: date ? new Date(date) : undefined,
        isEssential: isEssential !== undefined ? isEssential : undefined,
      },
      include: { category: true, user: false },
    });
    return res.status(StatusCodes.CREATED).json({ expense });
  }
);

const updateExpense = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { expenseId } = req.params;
    const { value, categoryId, description, isEssential, date } = req.body;

    if (
      !value &&
      !categoryId &&
      !description &&
      isEssential === undefined &&
      !date
    ) {
      throw new BadRequestError(
        'Por favor, informe um novo valor, tipo, categoria, descrição ou data para a despesa'
      );
    } else if (value <= MIN_VALUE) {
      throw new BadRequestError(
        `O valor de uma despesa precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    } else if (value > MAX_VALUE) {
      throw new BadRequestError(
        `O valor máximo para uma despesa é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    } else if (description && description.length > 200) {
      throw new BadRequestError(
        'A descrição de uma despesa só pode ter até 200 caracteres'
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

    // Checking if the expense is in the database
    const expense = await prisma.expense.findFirst({
      where: { id: Number(expenseId) },
    });

    if (!expense) {
      throw new NotFoundError(
        `Nenhuma despesa foi encontrada com o id ${expenseId}`
      );
    }
    // Checking if the requesting created the expense
    if (expense.userId !== user.id) {
      throw new ForbiddenError(
        'Você não tem permissão para acessar esse conteúdo'
      );
    }
    // Updating the expense
    const updatedExpense = await prisma.expense.update({
      where: { id: Number(expenseId) },
      data: {
        value,
        categoryId,
        description,
        isEssential: isEssential !== undefined ? isEssential : undefined,
        date: date ? new Date(date) : undefined,
      },
      include: { category: true, user: false },
    });
    return res.status(StatusCodes.OK).json({ expense: updatedExpense });
  }
);

const deleteExpense = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { expenseId } = req.params;

    const expense = await prisma.expense.findFirst({
      where: { id: Number(expenseId) },
    });

    if (!expense) {
      throw new NotFoundError(
        `Nenhuma despesa foi encontrada com o id ${expenseId}`
      );
    }

    // Checking if the requesting user is an admin or the user who created the expense
    if (user.role !== Role.ADMIN && expense.userId !== user.id) {
      throw new ForbiddenError(
        'Você não tem permissão para acessar esse conteúdo'
      );
    }

    // Deleting the expense
    const deletedExpense = await prisma.expense.delete({
      where: { id: Number(expenseId) },
      include: { category: true, user: false },
    });
    return res.status(StatusCodes.OK).json({ expense: deletedExpense });
  }
);

export {
  getAllExpenses,
  getSpecificExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};
