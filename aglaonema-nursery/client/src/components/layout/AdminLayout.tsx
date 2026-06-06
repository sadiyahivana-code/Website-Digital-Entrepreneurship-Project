import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart2, Users, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAdminStore } from '../../stores/authStore';

const menuItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Produk', icon: Package },
  { to: '/admin/orders', label: 'Pesanan', icon: ShoppingCart },
  { to: '/admin/reports', label: 'Laporan', icon: BarChart2 },
  { to: '/admin/users', label: 'Kelola User', icon: Users },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminStore();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (to: string, exact?: boolean) => exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="flex h-screen bg-cream-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-forest-900 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-forest-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center">
              <span className="text-bark-950 font-display font-bold text-sm">A</span>
            </div>
            <div>
              <div className="font-display font-bold text-cream-200 text-sm leading-tight">Aglaonema Nursery</div>
              <div className="text-gold-400 text-xs font-body tracking-wider">ADMIN PANEL</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map(item => {
            const active = isActive(item.to, item.exact);
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-sm font-body text-sm transition-all group ${active ? 'bg-forest-700 text-cream-200' : 'text-cream-400 hover:bg-forest-800 hover:text-cream-200'}`}>
                <item.icon className={`w-4 h-4 ${active ? 'text-gold-400' : 'text-cream-500 group-hover:text-cream-300'}`} />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-gold-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-forest-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-forest-700 rounded-full flex items-center justify-center">
              <span className="text-gold-400 font-bold text-sm">{admin?.name?.[0] || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body text-sm font-medium text-cream-200 truncate">{admin?.name}</div>
              <div className="text-xs text-cream-500 font-body">Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm font-body text-cream-400 hover:bg-forest-800 hover:text-red-400 transition-all">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
