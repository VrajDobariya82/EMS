import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import meetingRoutes from './routes/meetings.js';
import salaryRoutes from './routes/salary.js';
import payrollRoutes from './routes/payroll.js';
import reportsRoutes from './routes/reports.js';

const app = express();

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
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

// Start
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});


