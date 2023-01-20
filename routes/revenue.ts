import { Router } from 'express';
import {
  createRevenue,
  deleteRevenue,
  getAllRevenues,
  getSpecificRevenue,
  updateRevenue,
} from '../controllers/revenue';

const router = Router();

router.route('/').get(getAllRevenues).post(createRevenue);

router
  .route('/:revenueId')
  .get(getSpecificRevenue)
  .patch(updateRevenue)
  .delete(deleteRevenue);

export default router;
