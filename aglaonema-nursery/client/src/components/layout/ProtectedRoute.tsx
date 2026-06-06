import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAdminStore } from '../../stores/authStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }
  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const admin = useAdminStore(s => s.admin);
  if (!admin) return <Navigate to="/admin/login" replace />;
  if (admin.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}
