import { Router } from 'express';
import Payroll from '../models/Payroll.js';
import Salary from '../models/Salary.js';
import Employee from '../models/Employee.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all payroll records (Admin/HR only)
router.get('/', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const { month, year, status, department } = req.query;
    const filter = {};
    
    if (month) filter.month = month;
    if (year) filter.year = parseInt(year);
    if (status) filter.status = status;
    
    let payrolls = await Payroll.find(filter)
      .populate('employeeId', 'name email department position')
      .sort({ year: -1, month: -1, createdAt: -1 });
    
    // Filter by department if provided
    if (department) {
      payrolls = payrolls.filter(p => 
        p.employeeId && p.employeeId.department === department
      );
    }
    
    res.json(payrolls);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get payroll by employee ID
router.get('/employee/:employeeId', requireAuth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    
    const filter = { employeeId };
    if (month) filter.month = month;
    if (year) filter.year = parseInt(year);
    
    // Check if user is viewing their own payroll or is admin
    if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user.role !== 'Manager') {
      const userEmployee = await Employee.findOne({ email: req.user.email });
      if (!userEmployee || userEmployee._id.toString() !== employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const payrolls = await Payroll.find(filter)
      .populate('employeeId', 'name email department position')
      .sort({ year: -1, month: -1 });
    
    res.json(payrolls);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generate payroll for all active employees or specific employees
router.post('/generate', requireAuth, requireRole(['Admin', 'HR']), async (req, res) => {
  try {
    const { month, year, employeeIds, bonus, overtimeHours } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }
    
    // Get employees to process
    let employees;
    if (employeeIds && employeeIds.length > 0) {
      employees = await Employee.find({ 
        _id: { $in: employeeIds },
        status: 'Active'
      });
    } else {
      employees = await Employee.find({ status: 'Active' });
    }
    
    if (employees.length === 0) {
      return res.status(404).json({ error: 'No active employees found' });
    }
    
    const generatedPayrolls = [];
    const errors = [];
    
    for (const employee of employees) {
      try {
        // Get employee's salary structure
        const salary = await Salary.findOne({ employeeId: employee._id });
        
        if (!salary) {
          errors.push({ employeeId: employee._id, name: employee.name, error: 'Salary structure not found' });
          continue;
        }
        
        // Check if payroll already exists for this month/year
        const existing = await Payroll.findOne({
          employeeId: employee._id,
          month,
          year: parseInt(year)
        });
        
        if (existing) {
          errors.push({ employeeId: employee._id, name: employee.name, error: 'Payroll already exists for this month' });
          continue;
        }
        
        // Create payroll record
        const payroll = await Payroll.create({
          employeeId: employee._id,
          month,
          year: parseInt(year),
          baseSalary: salary.baseSalary,
          grossSalary: salary.grossSalary,
          netSalary: salary.netSalary,
          bonus: bonus || 0,
          overtimeHours: overtimeHours || 0,
          status: 'Pending'
        });
        
        const populated = await Payroll.findById(payroll._id)
          .populate('employeeId', 'name email department position');
        
        generatedPayrolls.push(populated);
      } catch (err) {
        errors.push({ employeeId: employee._id, name: employee.name, error: err.message });
      }
    }
    
    res.status(201).json({
      success: true,
      generated: generatedPayrolls.length,
      payrolls: generatedPayrolls,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update payroll status
router.put('/:id/status', requireAuth, requireRole(['Admin', 'HR']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMode, paymentDate, transactionId, remarks } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentMode) updateData.paymentMode = paymentMode;
    if (paymentDate) updateData.paymentDate = new Date(paymentDate);
    if (transactionId) updateData.transactionId = transactionId;
    if (remarks) updateData.remarks = remarks;
    
    // If marking as paid, set payment date if not provided
    if (status === 'Paid' && !updateData.paymentDate) {
      updateData.paymentDate = new Date();
    }
    
    const updated = await Payroll.findByIdAndUpdate(id, updateData, { new: true })
      .populate('employeeId', 'name email department position');
    
    if (!updated) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }
    
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get payroll statistics/reports
router.get('/reports/summary', requireAuth, requireRole(['Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const { month, year, department } = req.query;
    
    const filter = {};
    if (month) filter.month = month;
    if (year) filter.year = parseInt(year);
    
    let payrolls = await Payroll.find(filter)
      .populate('employeeId', 'name email department position');
    
    // Filter by department if provided
    if (department) {
      payrolls = payrolls.filter(p => 
        p.employeeId && p.employeeId.department === department
      );
    }
    
    // Calculate statistics
    const totalPayroll = payrolls.reduce((sum, p) => sum + (p.totalPayable || 0), 0);
    const pendingCount = payrolls.filter(p => p.status === 'Pending').length;
    const approvedCount = payrolls.filter(p => p.status === 'Approved').length;
    const paidCount = payrolls.filter(p => p.status === 'Paid').length;
    
    // Group by department
    const byDepartment = {};
    payrolls.forEach(p => {
      const dept = p.employeeId?.department || 'Unknown';
      if (!byDepartment[dept]) {
        byDepartment[dept] = { count: 0, total: 0 };
      }
      byDepartment[dept].count++;
      byDepartment[dept].total += p.totalPayable || 0;
    });
    
    res.json({
      totalPayroll,
      totalRecords: payrolls.length,
      statusCounts: {
        pending: pendingCount,
        approved: approvedCount,
        paid: paidCount
      },
      byDepartment
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get employee salary growth trend
router.get('/employee/:employeeId/trend', requireAuth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check access
    if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user.role !== 'Manager') {
      const userEmployee = await Employee.findOne({ email: req.user.email });
      if (!userEmployee || userEmployee._id.toString() !== employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const payrolls = await Payroll.find({ employeeId })
      .populate('employeeId', 'name email')
      .sort({ year: 1, month: 1 });
    
    // Format for chart
    const trend = payrolls.map(p => ({
      month: p.month,
      year: p.year,
      netSalary: p.netSalary,
      totalPayable: p.totalPayable,
      status: p.status
    }));
    
    res.json(trend);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

