import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../../api';
import { UsersIcon, DocumentIcon } from '../../../components/Icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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

  const generatePDF = () => {
    console.log('generatePDF called', { data, filteredEmployees: filteredEmployees.length });
    try {
      if (!data || !filteredEmployees.length) {
        alert('No data available to export');
        return;
      }

      console.log('Starting PDF generation...');
      const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Blue color
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Report', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Statistics Section
    if (data.statistics) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const stats = [
        `Total Employees: ${data.statistics.total}`,
        `Active: ${data.statistics.active}`,
        `On Leave: ${data.statistics.onLeave}`,
        `Terminated: ${data.statistics.terminated}`
      ];
      
      stats.forEach(stat => {
        doc.text(stat, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Filters applied
    if (filters.department || filters.status || searchTerm) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Filters Applied:', 14, yPosition);
      yPosition += 6;
      if (filters.department) {
        doc.text(`Department: ${filters.department}`, 20, yPosition);
        yPosition += 6;
      }
      if (filters.status) {
        doc.text(`Status: ${filters.status}`, 20, yPosition);
        yPosition += 6;
      }
      if (searchTerm) {
        doc.text(`Search: ${searchTerm}`, 20, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }

    // Employee Table
    const tableData = filteredEmployees.map(emp => [
      emp.name || 'N/A',
      emp.email || 'N/A',
      emp.department || 'N/A',
      emp.position || 'N/A',
      emp.status || 'N/A',
      emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : 'N/A'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Name', 'Email', 'Department', 'Position', 'Status', 'Join Date']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { top: yPosition, left: 14, right: 14 },
      styles: {
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

      // Save the PDF
      const fileName = `Employee_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again or check the console for details.');
    }
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
          <UsersIcon size={32} color="#3B82F6" style={{ marginRight: '12px' }} />
          Employee Report
        </h1>
        <button
          onClick={generatePDF}
          className="btn btn-success"
          disabled={loading || !data || !filteredEmployees.length}
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

