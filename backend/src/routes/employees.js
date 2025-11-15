import { Router } from 'express';
import Employee from '../models/Employee.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// List
router.get('/', requireAuth, async (_req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  res.json(employees);
});

// Create (admin)
router.post('/', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const created = await Employee.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update (admin or self by email match?)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete (admin)
router.delete('/:id', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;


