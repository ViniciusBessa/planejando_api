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

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

import notFound from './middlewares/not-found';
import errorHandler from './middlewares/error-handler';

app.use(notFound);
app.use(errorHandler);

export default app;
