import { PrismaClient, Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';
import asyncWrapper from '../middlewares/async-wrapper';

const prisma = new PrismaClient();

const getAllRevenues = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { minValue, maxValue, minDate, maxDate, description } = req.query;

    const revenues = await prisma.revenue.findMany({
      where: {
        value: {
          gte: Number(minValue) || undefined,
          lte: Number(maxValue) || undefined,
        },
        date: {
          gte: minDate ? new Date(minDate as string) : undefined,
          lte: maxDate ? new Date(maxDate as string) : undefined,
        },
        userId: user.role !== Role.ADMIN ? user.id : undefined,
        description: {
          search: description?.toString(),
        },
      },
    });
    return res.status(StatusCodes.OK).json({ revenues });
  }
);

const getSpecificRevenue = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { revenueId } = req.params;

    const revenue = await prisma.revenue.findFirst({
      where: { id: Number(revenueId) },
      include: { user: false },
    });

    if (!revenue) {
      throw new NotFoundError(
        `Nenhuma receita foi encontrada com o id ${revenueId}`
      );
    } else if (user.role !== Role.ADMIN && user.id !== revenue.userId) {
      throw new ForbiddenError(
        'Você não tem permissão para acessar esse conteúdo'
      );
    }
    return res.status(StatusCodes.OK).json({ revenue });
  }
);

const createRevenue = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { value, description, date } = req.body;

    if (!value) {
      throw new BadRequestError('Por favor, informe o valor da receita');
    } else if (!description) {
      throw new BadRequestError(
        'Por favor, informe uma descrição para a receita'
      );
    }
    const revenue = await prisma.revenue.create({
      data: {
        user: { connect: { id: user.id } },
        value,
        description,
        date: date ? new Date(date) : undefined,
      },
      include: { user: false },
    });
    return res.status(StatusCodes.CREATED).json({ revenue });
  }
);

const updateRevenue = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { revenueId } = req.params;
    const { value, description, date } = req.body;

    if (!value && !description && !date) {
      throw new BadRequestError(
        'Por favor, informe um novo valor, descrição ou data para a receita'
      );
    }
    const revenue = await prisma.revenue.findFirst({
      where: { id: Number(revenueId) },
    });

    if (!revenue) {
      throw new NotFoundError(
        `Nenhuma receita foi encontrada com o id ${revenueId}`
      );
    }
    // Checking if the requesting created the revenue
    if (revenue.userId !== user.id) {
      throw new ForbiddenError(
        'Você não tem permissão para acessar esse conteúdo'
      );
    }
    // Updating the revenue
    const updatedRevenue = await prisma.revenue.update({
      where: { id: Number(revenueId) },
      data: { value, description, date: date ? new Date(date) : undefined },
      include: { user: false },
    });
    return res.status(StatusCodes.OK).json({ revenue: updatedRevenue });
  }
);

const deleteRevenue = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { revenueId } = req.params;

    const revenue = await prisma.revenue.findFirst({
      where: { id: Number(revenueId) },
    });

    if (!revenue) {
      throw new NotFoundError(
        `Nenhuma receita foi encontrada com o id ${revenueId}`
      );
    }
    // Checking if the requesting user is an admin or the user who created the revenue
    if (user.role !== Role.ADMIN && revenue.userId !== user.id) {
      throw new ForbiddenError(
        'Você não tem permissão para acessar esse conteúdo'
      );
    }
    // Deleting the revenue
    const deletedRevenue = await prisma.revenue.delete({
      where: { id: Number(revenueId) },
      include: { user: false },
    });
    return res.status(StatusCodes.OK).json({ revenue: deletedRevenue });
  }
);

export {
  getAllRevenues,
  getSpecificRevenue,
  createRevenue,
  updateRevenue,
  deleteRevenue,
};
