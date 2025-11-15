import { Router } from 'express';
import Meeting from '../models/Meeting.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Admin: create
router.post('/', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const created = await Meeting.create({ ...req.body, createdBy: req.user.email });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: update
router.put('/:id', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (req, res) => {
  const updated = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Admin: delete
router.delete('/:id', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (req, res) => {
  await Meeting.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// Admin: list
router.get('/', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (_req, res) => {
  const list = await Meeting.find().sort({ createdAt: -1 });
  res.json(list);
});

// Employee: my meetings
router.get('/mine/:email', requireAuth, async (req, res) => {
  const email = req.params.email;
  const list = await Meeting.find({ $or: [ { allEmployees: true }, { invitees: email } ] }).sort({ date: 1, timeStart: 1 });
  res.json(list);
});

export default router;


