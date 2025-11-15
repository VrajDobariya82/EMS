import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  DashboardIcon,
  EmployeesIcon,
  ProfileIcon,
  AttendanceIcon,
  LeaveIcon,
  MeetingIcon,
  ReportsIcon,
  SalaryIcon,
  SettingsIcon,
  LogoutIcon
} from './Icons';
import './Dashboard.css';

const ReportsLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useContext(AuthContext);
  const isEmployeeRole = role === 'Employee';
  const isReportsRoute = location.pathname.includes('/reports');

  // Determine which dashboard path to use based on role
  const getDashboardPath = () => {
    return isEmployeeRole ? '/employee' : '/admin';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Same structure as Dashboard */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>EMS Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className="nav-item"
            onClick={() => navigate(getDashboardPath())}
          >
            <DashboardIcon size={20} color="#1F2937" />
            <span>Dashboard</span>
          </button>
          {!isEmployeeRole && (
            <button 
              className="nav-item"
              onClick={() => navigate('/admin')}
            >
              <EmployeesIcon size={20} color="#1F2937" />
              <span>Employees</span>
            </button>
          )}
          <button 
            className="nav-item"
            onClick={() => navigate(getDashboardPath())}
          >
            <ProfileIcon size={20} color="#1F2937" />
            <span>My Profile</span>
          </button>
          <button 
            className="nav-item"
            onClick={() => navigate(getDashboardPath())}
          >
            <AttendanceIcon size={20} color="#1F2937" />
            <span>Attendance</span>
          </button>
          <button 
            className="nav-item"
            onClick={() => navigate(getDashboardPath())}
          >
            <LeaveIcon size={20} color="#1F2937" />
            <span>Leave Management</span>
          </button>
          {isEmployeeRole && (
            <button 
              className="nav-item"
              onClick={() => navigate('/employee')}
            >
              <MeetingIcon size={20} color="#1F2937" />
              <span>Meetings</span>
            </button>
          )}
          <button 
            className="nav-item active"
          >
            <ReportsIcon size={20} color="white" />
            <span>{isEmployeeRole ? 'My Reports' : 'Reports'}</span>
          </button>
          {!isEmployeeRole && (
            <button 
              className="nav-item"
              onClick={() => navigate('/admin')}
            >
              <SalaryIcon size={20} color="#1F2937" />
              <span>Salary Management</span>
            </button>
          )}
          {isEmployeeRole && (
            <button 
              className="nav-item"
              onClick={() => navigate('/employee')}
            >
              <SalaryIcon size={20} color="#1F2937" />
              <span>My Salary</span>
            </button>
          )}
          <button 
            className="nav-item"
            onClick={() => navigate(getDashboardPath())}
          >
            <SettingsIcon size={20} color="#1F2937" />
            <span>Settings</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <LogoutIcon size={18} color="white" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content - Show reports content */}
      <div className="main-content">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default ReportsLayout;
