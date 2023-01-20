import { Router } from 'express';
import {
  createGoal,
  deleteGoal,
  getAllGoals,
  getSpecificGoal,
  updateGoal,
} from '../controllers/goal';

const router = Router();

router.route('/').get(getAllGoals).post(createGoal);

router
  .route('/:goalId')
  .get(getSpecificGoal)
  .patch(updateGoal)
  .delete(deleteGoal);

export default router;
