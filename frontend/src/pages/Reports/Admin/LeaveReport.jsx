import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../../api';
import { LeaveIcon, DocumentIcon, CheckIcon, XIcon, ClockIcon } from '../../../components/Icons';
import '../Reports.css';

const LeaveReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    month: '',
    year: new Date().getFullYear(),
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.getLeaveReport(filters);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load leave report');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaves = data?.leaves?.filter(leave => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      leave.employeeName?.toLowerCase().includes(search) ||
      leave.employeeEmail?.toLowerCase().includes(search) ||
      leave.type?.toLowerCase().includes(search) ||
      leave.reason?.toLowerCase().includes(search)
    );
  }) || [];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="reports-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="loading-skeleton" style={{ height: '32px', width: '25%' }}></div>
          <div className="loading-skeleton" style={{ height: '256px' }}></div>
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
        <h1 className="reports-title">
          <LeaveIcon size={32} color="#3B82F6" style={{ marginRight: '12px' }} />
          Leave Report
        </h1>
        <button
          onClick={() => alert('Export functionality coming soon')}
          className="btn btn-success"
        >
          <DocumentIcon size={20} color="white" style={{ marginRight: '8px' }} />
          Export PDF
        </button>
      </div>

      {/* Statistics Cards */}
      {data?.statistics && (
        <div className="reports-grid">
          <StatCard title="Total Leaves" value={data.statistics.total} color="blue" />
          <StatCard title="Pending" value={data.statistics.pending} color="yellow" />
          <StatCard title="Approved" value={data.statistics.approved} color="green" />
          <StatCard title="Rejected" value={data.statistics.rejected} color="red" />
        </div>
      )}

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input
              type="text"
              placeholder="Search leaves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value ? parseInt(e.target.value) : '' })}
              className="filter-select"
            >
              <option value="">All Months</option>
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
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
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

      {/* Leave Table */}
      <div className="table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="reports-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Date Range</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No leave records found
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="employee-name">{leave.employeeName}</div>
                      <div className="employee-email">{leave.employeeEmail}</div>
                    </td>
                    <td>{leave.type}</td>
                    <td>
                      {leave.startDate} to {leave.endDate}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.reason}</td>
                    <td>
                      <span className={`status-badge ${
                        leave.status === 'Approved' ? 'status-badge-approved' :
                        leave.status === 'Rejected' ? 'status-badge-rejected' :
                        'status-badge-pending'
                      }`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {leave.status === 'Approved' && <CheckIcon size={14} color="#059669" style={{ marginRight: '4px' }} />}
                        {leave.status === 'Rejected' && <XIcon size={14} color="#DC2626" style={{ marginRight: '4px' }} />}
                        {leave.status === 'Pending' && <ClockIcon size={14} color="#D97706" style={{ marginRight: '4px' }} />}
                        {leave.status}
                      </span>
                    </td>
                    <td>{leave.department || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
    </div>
  );
};

export default LeaveReport;
