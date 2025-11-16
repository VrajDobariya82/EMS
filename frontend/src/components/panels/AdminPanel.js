import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from '../Dashboard';
import ReportsLayout from '../ReportsLayout';

export default function AdminPanel() {
  const { logout } = React.useContext(AuthContext);
  const location = useLocation();
  const isReportsRoute = location.pathname.includes('/reports');
  
  if (isReportsRoute) {
    return <ReportsLayout />;
  }
  
  return <Dashboard onLogout={logout} />;
}


