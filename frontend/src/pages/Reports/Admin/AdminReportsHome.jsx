import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../../../api';
import { ChartIcon, UsersIcon, AttendanceIcon, LeaveIcon, SalaryIcon } from '../../../components/Icons';
import '../Reports.css';

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
      <div className="reports-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="loading-skeleton" style={{ height: '32px', width: '25%' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Reports Overview</h1>
        <button
          onClick={loadOverview}
          className="btn btn-primary"
        >
          Refresh
        </button>
      </div>

      {/* Monthly Attendance Trend */}
      {overview?.trends?.monthlyAttendance && (
        <div className="reports-card">
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <ChartIcon size={24} color="#3B82F6" style={{ marginRight: '8px' }} />
            Monthly Attendance Trend
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {overview.trends.monthlyAttendance.map((month, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '96px', fontSize: '14px', color: '#6b7280' }}>{month.month} {month.year}</div>
                <div style={{ flex: 1, margin: '0 16px' }}>
                  <div className="trend-bar">
                    <div
                      className="trend-bar-fill"
                      style={{ width: `${Math.min((month.present / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div style={{ width: '64px', textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>{month.present}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="reports-card">
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Report Types</h2>
        <div className="reports-grid">
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
  );
};

const ReportCard = ({ title, description, link, icon }) => (
  <Link
    to={link}
    className="quick-link-card"
  >
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
      <span className="quick-link-icon">{icon}</span>
      <h3 className="quick-link-title">{title}</h3>
    </div>
    <p className="quick-link-desc">{description}</p>
  </Link>
);

export default AdminReportsHome;

