import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes/api';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}) as any);

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}) as any);

// Compression for responses
app.use(compression() as any);

// Logger
app.use(morgan((process.env.NODE_ENV === 'development' ? 'dev' : 'combined') as any) as any);

// Body Parsers
app.use(express.json({ limit: '10mb' }) as any);
app.use(express.urlencoded({ extended: true, limit: '10mb' }) as any);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter as any);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API Server is healthy.', timestamp: new Date() });
});

// API Routes
app.use('/api', apiRouter as any);

// Global Error Handler
app.use(errorHandler as any);

export default app;
