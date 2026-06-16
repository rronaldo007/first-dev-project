import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import logger from '#config/logger.js';
import authRoutes from '#routes/auth.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  }),
);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Aquisitions API is running!!' });
});

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  logger.info('hello from aquisitions-api!');
  res.status(200).send('Hello, World!');
});

export default app;
