import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/** Blocks unauthenticated users — redirects to /login */
export const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

/** Blocks users whose role is not in allowedRoles */
export const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};
