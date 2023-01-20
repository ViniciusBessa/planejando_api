import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getSpecificCategory,
  updateCategory,
} from '../controllers/category';
import loginRequired from '../middlewares/login-required';
import restrictAccess from '../middlewares/restrict-access';

const router = Router();

router
  .route('/')
  .get(getAllCategories)
  .post(loginRequired, restrictAccess, createCategory);

router
  .route('/:categoryId')
  .get(getSpecificCategory)
  .patch(loginRequired, restrictAccess, updateCategory)
  .delete(loginRequired, restrictAccess, deleteCategory);

export default router;
