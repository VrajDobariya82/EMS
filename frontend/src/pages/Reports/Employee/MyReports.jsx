import React, { useState, useEffect, useContext } from 'react';
import { reportsApi } from '../../../api';
import { AuthContext } from '../../../context/AuthContext';
import { AttendanceIcon, LeaveIcon, SalaryIcon, ChartIcon, DocumentIcon } from '../../../components/Icons';
import '../Reports.css';

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

  if (loading) {
    return (
      <div className="reports-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="loading-skeleton" style={{ height: '32px', width: '25%' }}></div>
          <div className="reports-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
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
        <h1 className="reports-title">My Reports</h1>
        <button
          onClick={() => alert('Export functionality coming soon')}
          className="btn btn-success"
        >
          <DocumentIcon size={20} color="white" style={{ marginRight: '8px' }} />
          Export PDF
        </button>
      </div>

      {/* Employee Info */}
      {data?.employee && (
        <div className="reports-card">
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Employee Information</h2>
          <div className="reports-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Name</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{data.employee.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Email</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{data.employee.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Department</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{data.employee.department || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Position</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{data.employee.position || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="reports-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <SummaryCard
          title="Total Presents This Month"
          value={data?.attendance?.statistics?.presentDays || 0}
          icon={<AttendanceIcon size={32} color="white" />}
          color="stat-card-green"
        />
        <SummaryCard
          title="Leaves Taken"
          value={data?.leaves?.statistics?.total || 0}
          icon={<LeaveIcon size={32} color="white" />}
          color="stat-card-yellow"
        />
        <SummaryCard
          title="Last Salary Paid"
          value={data?.payroll?.summary?.lastSalary ? formatCurrency(data.payroll.summary.lastSalary.totalPayable) : 'N/A'}
          icon={<SalaryIcon size={32} color="white" />}
          color="stat-card-blue"
        />
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="filter-group">
            <label className="filter-label">Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
              className="filter-select"
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
              className="filter-select"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={loadData}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Report */}
      {data?.attendance && (
        <div className="reports-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <AttendanceIcon size={24} color="#3B82F6" style={{ marginRight: '8px' }} />
              Attendance Report
            </h2>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Attendance Rate: {data.attendance.statistics.attendanceRate}%
            </div>
          </div>
          
          <div className="reports-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: '16px' }}>
            <StatBox label="Total Days" value={data.attendance.statistics.totalDays} />
            <StatBox label="Present" value={data.attendance.statistics.presentDays} color="green" />
            <StatBox label="Absent" value={data.attendance.statistics.absentDays} color="red" />
            <StatBox label="Recent (30 days)" value={data.attendance.statistics.recentAttendance} />
          </div>

          <div className="table-container">
            <div style={{ overflowX: 'auto' }}>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attendance.records.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>
                        No attendance records found
                      </td>
                    </tr>
                  ) : (
                    data.attendance.records.slice(0, 20).map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.date}</td>
                        <td>
                          <span className={`status-badge ${
                            record.status === 'Present' ? 'status-badge-present' :
                            record.status === 'Absent' ? 'status-badge-absent' :
                            'status-badge-unmarked'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td>{record.clockIn || 'N/A'}</td>
                        <td>{record.clockOut || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leave Report */}
      {data?.leaves && (
        <div className="reports-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <LeaveIcon size={24} color="#3B82F6" style={{ marginRight: '8px' }} />
              Leave Report
            </h2>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Total: {data.leaves.statistics.total} | Approved: {data.leaves.statistics.approved} | Pending: {data.leaves.statistics.pending}
            </div>
          </div>

          <div className="table-container">
            <div style={{ overflowX: 'auto' }}>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date Range</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaves.records.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>
                        No leave records found
                      </td>
                    </tr>
                  ) : (
                    data.leaves.records.map((leave) => (
                      <tr key={leave._id}>
                        <td style={{ fontWeight: 600 }}>{leave.type}</td>
                        <td>
                          {leave.startDate} to {leave.endDate}
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.reason}</td>
                        <td>
                          <span className={`status-badge ${
                            leave.status === 'Approved' ? 'status-badge-approved' :
                            leave.status === 'Rejected' ? 'status-badge-rejected' :
                            'status-badge-pending'
                          }`}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Summary */}
      {data?.payroll && (
        <div className="reports-card">
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <SalaryIcon size={24} color="#3B82F6" style={{ marginRight: '8px' }} />
            Payroll Summary
          </h2>
          
          {data.payroll.summary.lastSalary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="reports-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Last Payment</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb' }}>
                    {formatCurrency(data.payroll.summary.lastSalary.totalPayable)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {data.payroll.summary.lastSalary.month} {data.payroll.summary.lastSalary.year}
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#d1fae5', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Earnings</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>
                    {formatCurrency(data.payroll.summary.totalEarnings)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Based on filtered period
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#f3e8ff', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Payrolls</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#7c3aed' }}>
                    {data.payroll.summary.totalPayrolls}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Records in period
                  </div>
                </div>
              </div>

              {data.payroll.records.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Recent Payrolls</h3>
                  <div className="table-container">
                    <div style={{ overflowX: 'auto' }}>
                      <table className="reports-table">
                        <thead>
                          <tr>
                            <th>Month/Year</th>
                            <th>Net Salary</th>
                            <th>Total Payable</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.payroll.records.slice(0, 5).map((payroll) => (
                            <tr key={payroll._id}>
                              <td>
                                {payroll.month} {payroll.year}
                              </td>
                              <td>{formatCurrency(payroll.netSalary)}</td>
                              <td style={{ fontWeight: 600 }}>{formatCurrency(payroll.totalPayable)}</td>
                              <td>
                                <span className={`status-badge ${
                                  payroll.status === 'Paid' ? 'status-badge-paid' :
                                  payroll.status === 'Approved' ? 'status-badge-approved' :
                                  'status-badge-pending'
                                }`}>
                                  {payroll.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
              No payroll records available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ background: 'rgba(255, 255, 255, 0.2)', borderRadius: '8px', padding: '12px' }}>
        {icon}
      </div>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{title}</div>
  </div>
);

const StatBox = ({ label, value, color = 'blue' }) => {
  const colorStyles = {
    blue: { color: '#2563eb' },
    green: { color: '#059669' },
    red: { color: '#dc2626' }
  };
  
  return (
    <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
      <div style={{ fontSize: '14px', color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, ...colorStyles[color] }}>{value}</div>
    </div>
  );
};

export default MyReports;
