import express from 'express'
import cookieParser from 'cookie-parser'
import { requestLogger } from '@/middlewares/logger.middleware.ts';
import { errorHandler } from './middlewares/error.middleware.ts';

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(requestLogger);


import userRouter from '@/routes/user.route.ts';
import uploadRouter from '@/routes/upload.routes.ts';

app.use('/api/v1/user', userRouter);
app.use('/api/v1/upload', uploadRouter);

// app.use(errorHandler)

export default app
