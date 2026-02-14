import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import mongoSanitize from 'express-mongo-sanitize'; // <--- COMMENTED OUT TO FIX CRASH
import connectDB from './config/db';

import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';
import taskRoutes from './routes/tasks';

const app = express();

// Connect Database
connectDB();

// --- Security Middleware ---
// Set security HTTP headers
app.use(helmet());

// Limit requests from same API (Brute force protection)
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize()); // <--- COMMENTED OUT TO FIX CRASH WITH EXPRESS 5

// --- Standard Middleware ---
app.use(express.json()); // Body parser

// Allow CORS (Update this with your frontend URL later if needed)
app.use(cors()); 

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));