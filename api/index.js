// Vercel serverless function entry point
// This file allows you to deploy the backend as serverless functions on Vercel
// Alternatively, deploy backend separately on Railway, Render, etc.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from '../backend/src/config/db.js';
import authRoutes from '../backend/src/routes/auth.js';
import employeeRoutes from '../backend/src/routes/employees.js';
import attendanceRoutes from '../backend/src/routes/attendance.js';
import leaveRoutes from '../backend/src/routes/leaves.js';
import meetingRoutes from '../backend/src/routes/meetings.js';
import salaryRoutes from '../backend/src/routes/salary.js';
import payrollRoutes from '../backend/src/routes/payroll.js';
import reportsRoutes from '../backend/src/routes/reports.js';

const app = express();

// Middlewares
app.use(cors({ 
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'], 
  credentials: true 
}));
app.use(express.json());
app.use(morgan('dev'));

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportsRoutes);

// Initialize DB connection (cached for serverless)
let dbConnected = false;

async function ensureDB() {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error('DB connection error:', err);
      throw err;
    }
  }
}

// Vercel serverless function handler
export default async function handler(req, res) {
  // Ensure DB connection
  await ensureDB();
  
  // Handle the request
  return app(req, res);
}

