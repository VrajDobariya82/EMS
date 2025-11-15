import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../../api';
import { AttendanceIcon, DocumentIcon, ClockIcon } from '../../../components/Icons';
import '../Reports.css';

const AttendanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.getAttendanceReport(filters);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load attendance report');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = data?.records?.filter(record => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      record.employeeName?.toLowerCase().includes(search) ||
      record.employeeEmail?.toLowerCase().includes(search) ||
      record.department?.toLowerCase().includes(search)
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
          <AttendanceIcon size={32} color="#3B82F6" style={{ marginRight: '12px' }} />
          Attendance Report
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
        <div className="reports-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <StatCard title="Total Records" value={data.statistics.total} color="blue" />
          <StatCard title="Present" value={data.statistics.present} color="green" />
          <StatCard title="Absent" value={data.statistics.absent} color="red" />
          <StatCard title="Unmarked" value={data.statistics.unmarked} color="gray" />
          <StatCard title="Present Today" value={data.statistics.presentToday} color="green" />
        </div>
      )}

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
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

      {/* Attendance Table */}
      <div className="table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="reports-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
                <th>Clock In</th>
                <th>Clock Out</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, idx) => (
                  <tr key={idx}>
                    <td>{record.date}</td>
                    <td>
                      <div className="employee-name">{record.employeeName}</div>
                      <div className="employee-email">{record.employeeEmail}</div>
                    </td>
                    <td>{record.department || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${
                        record.status === 'Present' ? 'status-badge-present' :
                        record.status === 'Absent' ? 'status-badge-absent' :
                        'status-badge-unmarked'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{ display: 'flex', alignItems: 'center' }}>
                      {record.clockIn ? (
                        <>
                          <ClockIcon size={16} color="#6B7280" style={{ marginRight: '4px' }} />
                          {record.clockIn}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td style={{ display: 'flex', alignItems: 'center' }}>
                      {record.clockOut ? (
                        <>
                          <ClockIcon size={16} color="#6B7280" style={{ marginRight: '4px' }} />
                          {record.clockOut}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </td>
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

export default AttendanceReport;
