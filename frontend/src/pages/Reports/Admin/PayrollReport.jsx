import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../../api';
import { SalaryIcon, DocumentIcon } from '../../../components/Icons';
import '../Reports.css';

const PayrollReport = () => {
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
      const result = await reportsApi.getPayrollReport(filters);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load payroll report');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayrolls = data?.payrolls?.filter(payroll => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const employee = payroll.employeeId;
    return (
      employee?.name?.toLowerCase().includes(search) ||
      employee?.email?.toLowerCase().includes(search) ||
      employee?.department?.toLowerCase().includes(search)
    );
  }) || [];

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
          <SalaryIcon size={32} color="#3B82F6" style={{ marginRight: '12px' }} />
          Payroll Report
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
          <StatCard title="Total Payrolls" value={data.statistics.total} color="blue" />
          <StatCard title="Total Amount" value={formatCurrency(data.statistics.totalAmount)} color="green" />
          <StatCard title="Pending" value={data.statistics.pending} color="yellow" />
          <StatCard title="Paid" value={data.statistics.paid} color="green" />
        </div>
      )}

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input
              type="text"
              placeholder="Search by employee..."
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

      {/* Payroll Table */}
      <div className="table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="reports-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month/Year</th>
                <th>Base Salary</th>
                <th>Net Salary</th>
                <th>Bonus</th>
                <th>Total Payable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No payroll records found
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((payroll) => {
                  const employee = payroll.employeeId;
                  return (
                    <tr key={payroll._id}>
                      <td>
                        <div className="employee-name">{employee?.name || 'N/A'}</div>
                        <div className="employee-email">{employee?.email || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{employee?.department || 'N/A'}</div>
                      </td>
                      <td>
                        {payroll.month} {payroll.year}
                      </td>
                      <td>{formatCurrency(payroll.baseSalary)}</td>
                      <td>{formatCurrency(payroll.netSalary)}</td>
                      <td>{formatCurrency(payroll.bonus)}</td>
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
                  );
                })
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

export default PayrollReport;
