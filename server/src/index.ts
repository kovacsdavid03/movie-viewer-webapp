import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './db';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5001;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Sync database
sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => console.error('Database sync failed:', err));

// Mount all API routes
app.use('/api', routes);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${PORT}`);
});
