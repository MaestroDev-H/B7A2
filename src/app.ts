import express, { type Application, type Request, type Response } from 'express';
import { AuthRoutes } from './modules/auth/auth.route.js';
import { IssueRoutes } from './modules/issues/issue.route.js';
import { globalErrorHandler } from './middleware/error.middleware.js';

const app: Application = express();

// Middlewares
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());

// Main Modular Routes
app.use('/api/auth', AuthRoutes);
app.use('/api/issues', IssueRoutes);

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Welcome to DevPulse API!' });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;