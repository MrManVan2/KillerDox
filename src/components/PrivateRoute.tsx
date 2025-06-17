import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('kd-auth') === 'true';
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

export default PrivateRoute; 