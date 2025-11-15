import { Router } from 'express';
import Attendance from '../models/Attendance.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all attendance records (Admin/HR only)
router.get('/', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const allRecords = await Attendance.find();
    // Transform to a format similar to frontend state: { email: { date: record } }
    const formatted = {};
    allRecords.forEach(rec => {
      const recordsObj = {};
      rec.records.forEach(day => {
        recordsObj[day.date] = {
          status: day.status,
          clockIn: day.clockIn,
          clockOut: day.clockOut
        };
      });
      formatted[rec.employeeEmail] = recordsObj;
    });
    res.json(formatted);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get records for an employee
router.get('/:email', requireAuth, async (req, res) => {
  const rec = await Attendance.findOne({ employeeEmail: req.params.email });
  res.json(rec || { employeeEmail: req.params.email, records: [] });
});

// Upsert a day's record
router.post('/:email', requireAuth, async (req, res) => {
  const { date, status, clockIn, clockOut } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });
  let doc = await Attendance.findOne({ employeeEmail: req.params.email });
  if (!doc) doc = new Attendance({ employeeEmail: req.params.email, records: [] });
  const idx = doc.records.findIndex(r => r.date === date);
  const payload = { date, status: status || 'Unmarked', clockIn: clockIn || null, clockOut: clockOut || null };
  if (idx >= 0) doc.records[idx] = payload; else doc.records.push(payload);
  await doc.save();
  res.json(doc);
});

export default router;


