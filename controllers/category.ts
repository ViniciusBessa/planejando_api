import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import asyncWrapper from '../middlewares/async-wrapper';

const prisma = new PrismaClient();

const getAllCategories = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await prisma.category.findMany();
    return res.status(StatusCodes.OK).json({ categories });
  }
);

const getSpecificCategory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const category = await prisma.category.findFirst({
      where: { id: Number(categoryId) },
    });

    if (!category) {
      throw new NotFoundError(
        `Nenhuma categoria foi encontrada com o id ${categoryId}`
      );
    }
    return res.status(StatusCodes.OK).json({ category });
  }
);

const createCategory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, description } = req.body;

    if (!title) {
      throw new BadRequestError('Por favor, informe o título da categoria');
    } else if (!description) {
      throw new BadRequestError('Por favor, informe a descrição da categoria');
    }
    const category = await prisma.category.create({
      data: { title, description },
    });
    return res.status(StatusCodes.CREATED).json({ category });
  }
);

const updateCategory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const { title, description } = req.body;

    if (!title && !description) {
      throw new BadRequestError(
        'Por favor, informe um novo título ou descrição para a categoria'
      );
    }
    const updatedCategory = await prisma.category.update({
      where: { id: Number(categoryId) },
      data: { title, description },
    });

    if (!updatedCategory) {
      throw new NotFoundError(
        `Nenhuma categoria foi encontrada com o id ${categoryId}`
      );
    }
    return res.status(StatusCodes.OK).json({ category: updatedCategory });
  }
);

const deleteCategory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const deletedCategory = await prisma.category.delete({
      where: { id: Number(categoryId) },
    });

    if (!deletedCategory) {
      throw new NotFoundError(
        `Nenhuma categoria foi encontrada com o id ${categoryId}`
      );
    }
    return res.status(StatusCodes.OK).json({ category: deletedCategory });
  }
);

export {
  getAllCategories,
  getSpecificCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
