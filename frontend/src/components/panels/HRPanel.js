import React from 'react';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from '../Dashboard';

export default function HRPanel() {
  const { logout } = React.useContext(AuthContext);
  return <Dashboard onLogout={logout} />;
}


