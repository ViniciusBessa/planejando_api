import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  getAllExpenses,
  getSpecificExpense,
  updateExpense,
} from '../controllers/expense';

const router = Router();

router.route('/').get(getAllExpenses).post(createExpense);

router
  .route('/:expenseId')
  .get(getSpecificExpense)
  .patch(updateExpense)
  .delete(deleteExpense);

export default router;
