import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../../api';
import { UsersIcon, DocumentIcon } from '../../../components/Icons';
import '../Reports.css';

const EmployeeReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
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
      const result = await reportsApi.getEmployeeReport(filters);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load employee report');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = data?.employees?.filter(emp => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search) ||
      emp.department?.toLowerCase().includes(search) ||
      emp.position?.toLowerCase().includes(search)
    );
  }) || [];

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
          <UsersIcon size={32} color="#3B82F6" style={{ marginRight: '12px' }} />
          Employee Report
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
          <StatCard title="Total Employees" value={data.statistics.total} color="blue" />
          <StatCard title="Active" value={data.statistics.active} color="green" />
          <StatCard title="On Leave" value={data.statistics.onLeave} color="yellow" />
          <StatCard title="Terminated" value={data.statistics.terminated} color="red" />
        </div>
      )}

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="filter-select"
            >
              <option value="">All Departments</option>
              {data?.statistics?.departmentBreakdown && Object.keys(data.statistics.departmentBreakdown).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
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
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
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

      {/* Employee Table */}
      <div className="table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="reports-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th>Join Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id || emp.id}>
                    <td>
                      <div className="employee-info">
                        {emp.avatar && (
                          <img src={emp.avatar} alt={emp.name} className="employee-avatar" />
                        )}
                        <div>
                          <div className="employee-name">{emp.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.department || 'N/A'}</td>
                    <td>{emp.position || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${
                        emp.status === 'Active' ? 'status-badge-active' :
                        emp.status === 'On Leave' ? 'status-badge-on-leave' :
                        'status-badge-terminated'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>{emp.joinDate || 'N/A'}</td>
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

export default EmployeeReport;

