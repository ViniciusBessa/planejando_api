import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Security middlewares
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from 'express-rate-limit';

const FIVE_MINUTES = 5 * 60 * 1000;
const MAX_REQUESTS = 1000;

app.set('trust_proxy', 1);
app.use(helmet());
app.use(
  cors({
    credentials: process.env.NODE_ENV === 'production',
    origin: process.env.CORS_ORIGIN || '*',
  })
);
app.use(
  rateLimiter({
    windowMs: FIVE_MINUTES,
    max: MAX_REQUESTS,
    message: 'Limite de requests alcançado',
  })
);

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
