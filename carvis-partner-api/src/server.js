import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import jobsRouter from './routes/jobs.js';
import paymentsRouter from './routes/payments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security and Logging Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rate Limiter: Max 100 requests per windowMs (15 minutes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// Routes
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/payments', paymentsRouter);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'carvis-partner-api' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`[CARVIS] Partner API B2B Gateway is running on http://localhost:${PORT}`);
});
