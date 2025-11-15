import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getEmployeeReport,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getOverviewReport,
  getMyReports
} from '../controllers/reportsController.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Admin routes - require Admin role
router.get('/employees', requireRole(['Admin']), getEmployeeReport);
router.get('/attendance', requireRole(['Admin']), getAttendanceReport);
router.get('/leaves', requireRole(['Admin']), getLeaveReport);
router.get('/payroll', requireRole(['Admin']), getPayrollReport);
router.get('/overview', requireRole(['Admin']), getOverviewReport);

// Employee route - get own reports
router.get('/my/:email', async (req, res, next) => {
  // Allow if Admin or if requesting own email
  if (req.user.role === 'Admin' || req.user.email === req.params.email) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}, getMyReports);

export default router;

