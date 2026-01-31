import express from 'express'
import cookieParser from 'cookie-parser'
import { requestLogger } from '@/middlewares/logger.middleware.ts';
import { errorHandler } from './middlewares/error.middleware.ts';

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(requestLogger);


import userRouter from '@/routes/user.route.ts';

app.use('/api/v1/user', userRouter);

// app.use(errorHandler)

export default app
