import React from 'react';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from '../Dashboard';

export default function ManagerPanel() {
  const { logout } = React.useContext(AuthContext);
  return <Dashboard onLogout={logout} />;
}


