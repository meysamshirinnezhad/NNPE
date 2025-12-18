import { Navigate, Outlet } from 'react-router-dom';

export function RequireAuth() {
  const token = localStorage.getItem('access_token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RequireAdmin() {
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');
  const user = token && userStr ? JSON.parse(userStr) : null;
  return user?.is_admin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}