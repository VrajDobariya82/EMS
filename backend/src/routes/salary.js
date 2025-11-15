import { Router } from 'express';
import Salary from '../models/Salary.js';
import Employee from '../models/Employee.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all salary structures (Admin/HR only)
router.get('/', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate('employeeId', 'name email department position')
      .sort({ createdAt: -1 });
    res.json(salaries);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get salary by employee ID
router.get('/employee/:employeeId', requireAuth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const salary = await Salary.findOne({ employeeId })
      .populate('employeeId', 'name email department position');
    
    if (!salary) {
      return res.status(404).json({ error: 'Salary structure not found for this employee' });
    }
    
    // Check if user is viewing their own salary or is admin
    const employee = await Employee.findById(employeeId);
    if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user.role !== 'Manager') {
      // Employee can only view their own salary
      const userEmployee = await Employee.findOne({ email: req.user.email });
      if (!userEmployee || userEmployee._id.toString() !== employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    res.json(salary);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create salary structure (Admin/HR only)
router.post('/', requireAuth, requireRole(['Admin', 'HR']), async (req, res) => {
  try {
    const {
      employeeId,
      baseSalary,
      allowances,
      deductions,
      department,
      designation
    } = req.body;

    // Validate employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if salary already exists for this employee
    const existing = await Salary.findOne({ employeeId });
    if (existing) {
      return res.status(409).json({ error: 'Salary structure already exists for this employee' });
    }

    const salary = await Salary.create({
      employeeId,
      baseSalary,
      allowances: allowances || { hra: 0, travel: 0, medical: 0 },
      deductions: deductions || { pf: 0, tax: 0, insurance: 0 },
      department: department || employee.department,
      designation: designation || employee.position
    });

    const populated = await Salary.findById(salary._id)
      .populate('employeeId', 'name email department position');

    res.status(201).json(populated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update salary structure (Admin/HR only)
router.put('/:id', requireAuth, requireRole(['Admin', 'HR']), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Salary.findByIdAndUpdate(id, req.body, { new: true })
      .populate('employeeId', 'name email department position');
    
    if (!updated) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }
    
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete salary structure (Admin/HR only)
router.delete('/:id', requireAuth, requireRole(['Admin', 'HR']), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Salary.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }
    
    res.json({ success: true, message: 'Salary structure deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

