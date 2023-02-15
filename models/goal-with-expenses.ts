import { Goal } from '@prisma/client';

export interface GoalWithExpenses extends Goal {
  sumExpenses: number;
}
