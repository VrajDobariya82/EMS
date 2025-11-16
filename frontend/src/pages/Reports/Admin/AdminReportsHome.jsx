import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../../../api';
import { ChartIcon, UsersIcon, AttendanceIcon, LeaveIcon, SalaryIcon, UserCheckIcon, ActivityIcon } from '../../../components/Icons';
import '../../../components/Dashboard.css';

const AdminReportsHome = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsApi.getOverviewReport();
      setOverview(data);
    } catch (err) {
      setError(err.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="loading-skeleton" style={{ height: '32px', width: '25%' }}></div>
          <div className="stats-grid">
            {[1, 2, 3, 4].map(i => (
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
      title: 'Total Employees',
      value: overview?.summary?.totalEmployees || 0,
      icon: <UsersIcon size={28} color="white" />,
      color: '#3b82f6'
    },
    {
      title: 'Active Employees',
      value: overview?.summary?.activeEmployees || 0,
      icon: <UserCheckIcon size={28} color="white" />,
      color: '#10b981'
    },
    {
      title: 'Present Today',
      value: overview?.summary?.presentToday || 0,
      icon: <AttendanceIcon size={28} color="white" />,
      color: '#059669'
    },
    {
      title: 'Pending Leaves',
      value: overview?.summary?.pendingLeaves || 0,
      icon: <LeaveIcon size={28} color="white" />,
      color: '#f59e0b'
    },
    {
      title: 'Pending Payrolls',
      value: overview?.summary?.pendingPayrolls || 0,
      icon: <SalaryIcon size={28} color="white" />,
      color: '#8b5cf6'
    },
    {
      title: 'Recent Leaves (7 days)',
      value: overview?.summary?.recentLeaves || 0,
      icon: <ActivityIcon size={28} color="white" />,
      color: '#ef4444'
    }
  ];

  // Calculate max present for trend bar scaling
  const maxPresent = overview?.trends?.monthlyAttendance?.length > 0
    ? Math.max(...overview.trends.monthlyAttendance.map(m => m.present), 1)
    : 1;

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <div>
          <h1>Reports Overview</h1>
          <p>Monitor employee statistics, attendance trends, and system reports</p>
        </div>
        <div className="header-actions">
          <button
            onClick={loadOverview}
            className="view-all-btn"
            style={{ minWidth: '120px' }}
          >
            Refresh
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

      {/* Two Column Layout */}
      <div className="dashboard-grid">
        {/* Monthly Attendance Trend */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 style={{ display: 'flex', alignItems: 'center' }}>
              <ChartIcon size={24} color="#3B82F6" style={{ marginRight: '8px' }} />
              Monthly Attendance Trend
            </h2>
          </div>
          {overview?.trends?.monthlyAttendance && overview.trends.monthlyAttendance.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {overview.trends.monthlyAttendance.map((month, idx) => {
                const percentage = maxPresent > 0 ? (month.present / maxPresent) * 100 : 0;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '100px', fontSize: '14px', color: '#1F2937', fontWeight: 600 }}>
                      {month.month} {month.year}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        height: '24px',
                        background: '#e5e7eb',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(percentage, 100)}%`,
                            background: 'linear-gradient(90deg, #3B82F6, #60A5FA, #93C5FD)',
                            borderRadius: '9999px',
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                    </div>
                    <div style={{ width: '60px', textAlign: 'right', fontSize: '16px', fontWeight: 700, color: '#000000' }}>
                      {month.present}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
              No attendance data available
            </div>
          )}
        </div>

        {/* Report Types */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Report Types</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ReportCard
              title="Employee Report"
              description="View all employee details and statistics"
              link="/admin/reports/employees"
              icon={<UsersIcon size={24} color="#3B82F6" />}
            />
            <ReportCard
              title="Attendance Report"
              description="Track attendance records and patterns"
              link="/admin/reports/attendance"
              icon={<AttendanceIcon size={24} color="#3B82F6" />}
            />
            <ReportCard
              title="Leave Report"
              description="Monitor leave requests and approvals"
              link="/admin/reports/leaves"
              icon={<LeaveIcon size={24} color="#3B82F6" />}
            />
            <ReportCard
              title="Payroll Report"
              description="View payroll processing and payments"
              link="/admin/reports/payroll"
              icon={<SalaryIcon size={24} color="#3B82F6" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({ title, description, link, icon }) => (
  <Link
    to={link}
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      padding: '18px',
      borderRadius: '16px',
      background: 'rgba(248, 250, 252, 0.8)',
      backdropFilter: 'blur(15px)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      textDecoration: 'none',
      color: 'inherit',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
      e.currentTarget.style.transform = 'translateX(6px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(248, 250, 252, 0.8)';
      e.currentTarget.style.transform = 'translateX(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #3B82F6, #60A5FA, #93C5FD)',
      color: 'white',
      borderRadius: '12px',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h3 style={{
        color: '#000000',
        fontWeight: 700,
        margin: '0 0 6px 0',
        fontSize: '15px'
      }}>
        {title}
      </h3>
      <p style={{
        color: '#1F2937',
        margin: 0,
        fontSize: '13px',
        fontWeight: 500
      }}>
        {description}
      </p>
    </div>
  </Link>
);

export default AdminReportsHome;

