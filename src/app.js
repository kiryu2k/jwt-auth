import authRouter from './auth/auth-router.js';
import errorMiddleware from './auth/error-middleware.js';

import express from 'express';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const env = dotenv.config();
dotenvExpand.expand(env);

const app = new express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/auth', authRouter);

app.use(errorMiddleware);

async function startApp(port) {
  try {
    await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    app.listen(port, () => {
      console.log(`server is launched! URL=${process.env.API_URL}`);
    });
  } catch (error) {
    console.log(error);
  }
}

export default startApp;
