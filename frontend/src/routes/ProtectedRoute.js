import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ allowRoles }) {
  const { user, role } = React.useContext(AuthContext);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowRoles && !allowRoles.includes(role)) {
    // Redirect to their own panel if they try to access another role's route
    switch (role) {
      case 'Employee':
        return <Navigate to="/employee" replace />;
      case 'Admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/auth" replace />;
    }
  }

  return <Outlet />;
}


