import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jobsRouter from './routes/jobs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security and Logging Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1/jobs', jobsRouter);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'carvis-partner-api' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`[CARVIS] Partner API B2B Gateway is running on http://localhost:${PORT}`);
});
