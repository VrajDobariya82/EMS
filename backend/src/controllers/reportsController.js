import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Salary from '../models/Salary.js';

// Helper function to parse month/year filters
function parseFilters(req) {
  const { month, year, department, status } = req.query;
  const filters = {};
  
  if (month) {
    const monthNum = parseInt(month);
    if (monthNum >= 1 && monthNum <= 12) {
      filters.month = monthNum;
    }
  }
  
  if (year) {
    const yearNum = parseInt(year);
    if (yearNum >= 2020 && yearNum <= 2100) {
      filters.year = yearNum;
    }
  }
  
  if (department) {
    filters.department = department;
  }
  
  if (status) {
    filters.status = status;
  }
  
  return filters;
}

// Get employee report (Admin)
export async function getEmployeeReport(req, res) {
  try {
    const filters = parseFilters(req);
    const query = {};
    
    if (filters.department) {
      query.department = filters.department;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    const employees = await Employee.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
    
    // Get statistics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const onLeave = employees.filter(e => e.status === 'On Leave').length;
    const terminated = employees.filter(e => e.status === 'Terminated').length;
    
    // Department breakdown
    const departmentStats = {};
    employees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });
    
    res.json({
      employees,
      statistics: {
        total: totalEmployees,
        active: activeEmployees,
        onLeave,
        terminated,
        departmentBreakdown: departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get attendance report (Admin)
export async function getAttendanceReport(req, res) {
  try {
    const filters = parseFilters(req);
    const { month, year } = filters;
    
    const allAttendance = await Attendance.find();
    const employees = await Employee.find();
    
    // Filter by month/year if provided
    let filteredRecords = [];
    
    allAttendance.forEach(att => {
      const employee = employees.find(e => e.email === att.employeeEmail);
      if (!employee) return;
      
      const employeeRecords = att.records
        .filter(record => {
          if (!month && !year) return true;
          
          const recordDate = new Date(record.date);
          const recordMonth = recordDate.getMonth() + 1;
          const recordYear = recordDate.getFullYear();
          
          if (month && recordMonth !== month) return false;
          if (year && recordYear !== year) return false;
          return true;
        })
        .map(record => ({
          ...record.toObject(),
          employeeName: employee.name,
          employeeEmail: att.employeeEmail,
          department: employee.department,
          position: employee.position
        }));
      
      filteredRecords.push(...employeeRecords);
    });
    
    // Calculate statistics
    const totalRecords = filteredRecords.length;
    const presentCount = filteredRecords.filter(r => r.status === 'Present').length;
    const absentCount = filteredRecords.filter(r => r.status === 'Absent').length;
    const unmarkedCount = filteredRecords.filter(r => r.status === 'Unmarked').length;
    
    // Today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = filteredRecords.filter(r => r.date === today);
    const presentToday = todayRecords.filter(r => r.status === 'Present').length;
    
    res.json({
      records: filteredRecords,
      statistics: {
        total: totalRecords,
        present: presentCount,
        absent: absentCount,
        unmarked: unmarkedCount,
        presentToday,
        totalToday: todayRecords.length
      },
      filters: { month, year }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get leave report (Admin)
export async function getLeaveReport(req, res) {
  try {
    const filters = parseFilters(req);
    const { month, year, status } = filters;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    let leaves = await Leave.find(query).sort({ createdAt: -1 });
    
    // Filter by month/year if provided
    if (month || year) {
      leaves = leaves.filter(leave => {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        
        if (month) {
          const startMonth = startDate.getMonth() + 1;
          const endMonth = endDate.getMonth() + 1;
          if (startMonth !== month && endMonth !== month) return false;
        }
        
        if (year) {
          const startYear = startDate.getFullYear();
          const endYear = endDate.getFullYear();
          if (startYear !== year && endYear !== year) return false;
        }
        
        return true;
      });
    }
    
    // Get employee details
    const employees = await Employee.find();
    const enrichedLeaves = leaves.map(leave => {
      const employee = employees.find(e => e.email === leave.employeeEmail);
      return {
        ...leave.toObject(),
        employeeName: employee?.name || leave.employeeName,
        department: employee?.department || 'N/A',
        position: employee?.position || 'N/A'
      };
    });
    
    // Calculate statistics
    const totalLeaves = enrichedLeaves.length;
    const pending = enrichedLeaves.filter(l => l.status === 'Pending').length;
    const approved = enrichedLeaves.filter(l => l.status === 'Approved').length;
    const rejected = enrichedLeaves.filter(l => l.status === 'Rejected').length;
    
    // Leave type breakdown
    const typeBreakdown = {};
    enrichedLeaves.forEach(leave => {
      typeBreakdown[leave.type] = (typeBreakdown[leave.type] || 0) + 1;
    });
    
    res.json({
      leaves: enrichedLeaves,
      statistics: {
        total: totalLeaves,
        pending,
        approved,
        rejected,
        typeBreakdown
      },
      filters: { month, year, status }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get payroll report (Admin)
export async function getPayrollReport(req, res) {
  try {
    const filters = parseFilters(req);
    const { month, year } = filters;
    
    const query = {};
    if (month) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      query.month = monthNames[month - 1];
    }
    if (year) {
      query.year = year;
    }
    
    const payrolls = await Payroll.find(query)
      .populate('employeeId', 'name email department position')
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalPayrolls = payrolls.length;
    const totalAmount = payrolls.reduce((sum, p) => sum + (p.totalPayable || 0), 0);
    const pending = payrolls.filter(p => p.status === 'Pending').length;
    const approved = payrolls.filter(p => p.status === 'Approved').length;
    const paid = payrolls.filter(p => p.status === 'Paid').length;
    
    // Department breakdown
    const departmentBreakdown = {};
    payrolls.forEach(p => {
      const dept = p.employeeId?.department || 'N/A';
      departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + (p.totalPayable || 0);
    });
    
    res.json({
      payrolls,
      statistics: {
        total: totalPayrolls,
        totalAmount,
        pending,
        approved,
        paid,
        departmentBreakdown
      },
      filters: { month, year }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get overview dashboard (Admin)
export async function getOverviewReport(req, res) {
  try {
    // Get all data
    const employees = await Employee.find();
    const allAttendance = await Attendance.find();
    const leaves = await Leave.find();
    const payrolls = await Payroll.find();
    
    // Employee statistics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    
    // Today's attendance
    const today = new Date().toISOString().split('T')[0];
    let presentToday = 0;
    let absentToday = 0;
    allAttendance.forEach(att => {
      const todayRecord = att.records.find(r => r.date === today);
      if (todayRecord) {
        if (todayRecord.status === 'Present') presentToday++;
        else if (todayRecord.status === 'Absent') absentToday++;
      }
    });
    
    // Pending leaves
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    
    // Pending payrolls
    const pendingPayrolls = payrolls.filter(p => p.status === 'Pending').length;
    
    // Recent leaves (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLeaves = leaves.filter(l => {
      const created = new Date(l.createdAt);
      return created >= sevenDaysAgo;
    }).length;
    
    // Monthly attendance trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      let present = 0;
      allAttendance.forEach(att => {
        att.records.forEach(record => {
          const recordDate = new Date(record.date);
          if (recordDate.getMonth() + 1 === month && recordDate.getFullYear() === year) {
            if (record.status === 'Present') present++;
          }
        });
      });
      
      monthlyTrend.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year,
        present
      });
    }
    
    res.json({
      summary: {
        totalEmployees,
        activeEmployees,
        presentToday,
        absentToday,
        pendingLeaves,
        pendingPayrolls,
        recentLeaves
      },
      trends: {
        monthlyAttendance: monthlyTrend
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get employee's own reports
export async function getMyReports(req, res) {
  try {
    const { email } = req.params;
    const filters = parseFilters(req);
    const { month, year } = filters;
    
    // Get employee
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Get attendance
    const attendance = await Attendance.findOne({ employeeEmail: email });
    let attendanceRecords = attendance?.records || [];
    
    // Filter by month/year if provided
    if (month || year) {
      attendanceRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = recordDate.getMonth() + 1;
        const recordYear = recordDate.getFullYear();
        
        if (month && recordMonth !== month) return false;
        if (year && recordYear !== year) return false;
        return true;
      });
    }
    
    // Attendance statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
    const absentDays = attendanceRecords.filter(r => r.status === 'Absent').length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
    
    // Get leaves
    let leaves = await Leave.find({ employeeEmail: email }).sort({ createdAt: -1 });
    
    // Filter by month/year if provided
    if (month || year) {
      leaves = leaves.filter(leave => {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        
        if (month) {
          const startMonth = startDate.getMonth() + 1;
          const endMonth = endDate.getMonth() + 1;
          if (startMonth !== month && endMonth !== month) return false;
        }
        
        if (year) {
          const startYear = startDate.getFullYear();
          const endYear = endDate.getFullYear();
          if (startYear !== year && endYear !== year) return false;
        }
        
        return true;
      });
    }
    
    const totalLeaves = leaves.length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    
    // Get payroll summary
    const payrolls = await Payroll.find({ employeeId: employee._id })
      .sort({ year: -1, month: -1 })
      .limit(12); // Last 12 months
    
    // Filter by month/year if provided
    let filteredPayrolls = payrolls;
    if (month || year) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      filteredPayrolls = payrolls.filter(p => {
        if (month && p.month !== monthNames[month - 1]) return false;
        if (year && p.year !== year) return false;
        return true;
      });
    }
    
    const lastSalary = filteredPayrolls.length > 0 ? filteredPayrolls[0] : null;
    const totalEarnings = filteredPayrolls.reduce((sum, p) => sum + (p.totalPayable || 0), 0);
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAttendance = attendanceRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= thirtyDaysAgo;
    }).length;
    
    const recentLeaves = leaves.filter(l => {
      const created = new Date(l.createdAt);
      return created >= thirtyDaysAgo;
    }).length;
    
    res.json({
      employee: {
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position
      },
      attendance: {
        records: attendanceRecords,
        statistics: {
          totalDays,
          presentDays,
          absentDays,
          attendanceRate: parseFloat(attendanceRate),
          recentAttendance
        }
      },
      leaves: {
        records: leaves,
        statistics: {
          total: totalLeaves,
          approved: approvedLeaves,
          pending: pendingLeaves,
          recentLeaves
        }
      },
      payroll: {
        records: filteredPayrolls,
        summary: {
          lastSalary,
          totalEarnings,
          totalPayrolls: filteredPayrolls.length
        }
      },
      activity: {
        recentAttendance,
        recentLeaves,
        lastUpdated: new Date().toISOString()
      },
      filters: { month, year }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

