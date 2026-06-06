import { Navigate } from 'react-router-dom';
import { useAdminStore } from '../../stores/authStore';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const admin = useAdminStore(s => s.admin);
  if (!admin) return <Navigate to="/admin/login" replace />;
  if (admin.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}
