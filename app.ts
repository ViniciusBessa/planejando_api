import express from 'express';

const app = express();

// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middlewares
import trimInputs from './middlewares/trim-inputs';
import authentication from './middlewares/authentication';

app.use(trimInputs);
app.use(authentication);

// Routes
import authRouter from './routes/auth';
import userRouter from './routes/user';
import categoryRouter from './routes/category';
import expenseRouter from './routes/expense';
import goalRouter from './routes/goal';
import revenueRouter from './routes/revenue';

import loginRequired from './middlewares/login-required';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/expenses', loginRequired, expenseRouter);
app.use('/api/v1/goals', loginRequired, goalRouter);
app.use('/api/v1/revenues', loginRequired, revenueRouter);

import notFound from './middlewares/not-found';
import errorHandler from './middlewares/error-handler';

app.use(notFound);
app.use(errorHandler);

export default app;
