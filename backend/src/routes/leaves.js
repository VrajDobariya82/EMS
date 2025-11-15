import { Router } from 'express';
import Leave from '../models/Leave.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Employee: create leave
router.post('/', requireAuth, async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    res.status(201).json(leave);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: list all
router.get('/', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (_req, res) => {
  const list = await Leave.find().sort({ createdAt: -1 });
  res.json(list);
});

// Employee: list mine
router.get('/mine/:email', requireAuth, async (req, res) => {
  const list = await Leave.find({ employeeEmail: req.params.email }).sort({ createdAt: -1 });
  res.json(list);
});

// Admin: update status
router.put('/:id/status', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (req, res) => {
  const { status, adminJustification } = req.body;
  const updated = await Leave.findByIdAndUpdate(req.params.id, { status, adminJustification, reviewedAt: new Date() }, { new: true });
  res.json(updated);
});

export default router;


