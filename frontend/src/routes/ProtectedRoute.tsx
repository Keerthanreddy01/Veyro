import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import useAuthStore from '../store/authStore';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

interface RoleRouteProps extends ProtectedRouteProps {
  allowedRoles: readonly UserRole[];
}

/** Blocks unauthenticated users — redirects to /login */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

/** Blocks users whose role is not in allowedRoles */
export const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};
