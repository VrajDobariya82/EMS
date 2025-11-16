import React, { useState, useEffect, useContext } from 'react';
import { reportsApi } from '../../../api';
import { AuthContext } from '../../../context/AuthContext';
import { AttendanceIcon, LeaveIcon, SalaryIcon, ChartIcon, DocumentIcon, ActivityIcon, CheckIcon, ClockIcon } from '../../../components/Icons';
import '../../../components/Dashboard.css';

const MyReports = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    if (user?.email) {
      loadData();
    }
  }, [user, filters]);

  const loadData = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.getMyReports(user.email, filters);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // Generate recent activities from data
  const getRecentActivities = () => {
    const activities = [];
    
    // Add attendance activities
    if (data?.attendance?.records) {
      data.attendance.records.slice(0, 3).forEach(record => {
        if (record.status === 'Present') {
          activities.push({
            id: `att-${record.date}`,
            action: `Attendance marked present`,
            date: record.date,
            time: formatTimeAgo(record.date)
          });
        }
      });
    }
    
    // Add leave activities
    if (data?.leaves?.records) {
      data.leaves.records.slice(0, 3).forEach(leave => {
        activities.push({
          id: `leave-${leave._id}`,
          action: `Leave request ${leave.status.toLowerCase()}`,
          date: leave.startDate,
          time: formatTimeAgo(leave.startDate)
        });
      });
    }
    
    // Sort by date (most recent first)
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="loading-skeleton" style={{ height: '32px', width: '25%' }}></div>
          <div className="stats-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="loading-skeleton" style={{ height: '128px' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Presents This Month',
      value: data?.attendance?.statistics?.presentDays || 0,
      icon: <CheckIcon size={28} color="white" />,
      color: '#10b981'
    },
    {
      title: 'Leaves Taken',
      value: data?.leaves?.statistics?.total || 0,
      icon: <LeaveIcon size={28} color="white" />,
      color: '#f59e0b'
    },
    {
      title: 'Attendance Rate',
      value: `${data?.attendance?.statistics?.attendanceRate || 0}%`,
      icon: <ChartIcon size={28} color="white" />,
      color: '#3b82f6'
    },
    {
      title: 'Last Salary Paid',
      value: data?.payroll?.summary?.lastSalary ? formatCurrency(data.payroll.summary.lastSalary.totalPayable) : 'N/A',
      icon: <SalaryIcon size={28} color="white" />,
      color: '#8b5cf6'
    }
  ];

  const recentActivities = getRecentActivities();

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <div>
          <h1>My Reports</h1>
          <p>View your attendance, leaves, and payroll information</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => alert('Export functionality coming soon')}
            className="view-all-btn"
            style={{ minWidth: '120px' }}
          >
            <DocumentIcon size={18} color="white" style={{ marginRight: '8px' }} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="dashboard-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>Filter Reports</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '14px',
                fontSize: '14px',
                background: 'rgba(249, 250, 251, 0.8)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '14px',
                fontSize: '14px',
                background: 'rgba(249, 250, 251, 0.8)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={loadData}
              className="view-all-btn"
              style={{ width: '100%' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-grid">
        {/* Recent Attendance/Leaves */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Attendance</h2>
            <button className="view-all-btn" onClick={() => {/* Navigate to full attendance */}}>
              View All
            </button>
          </div>
          <div className="employee-list">
            {data?.attendance?.records?.length > 0 ? (
              data.attendance.records.slice(0, 5).map((record, idx) => (
                <div key={idx} className="employee-card">
                  <div className="activity-icon" style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                    {record.status === 'Present' ? (
                      <CheckIcon size={20} color="white" />
                    ) : (
                      <ClockIcon size={20} color="white" />
                    )}
                  </div>
                  <div className="employee-info">
                    <h4>{record.date}</h4>
                    <p>
                      {record.status} {record.clockIn && `• Clock In: ${record.clockIn}`}
                      {record.clockOut && ` • Clock Out: ${record.clockOut}`}
                    </p>
                    <span className={`status-badge ${
                      record.status === 'Present' ? 'active' :
                      record.status === 'Absent' ? 'terminated' :
                      'on-leave'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                No attendance records found
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Activities</h2>
          </div>
          <div className="activity-list">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <ActivityIcon size={20} color="white" />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">{activity.action}</p>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                No recent activities
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReports;
