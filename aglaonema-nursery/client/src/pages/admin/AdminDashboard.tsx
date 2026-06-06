import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, ShoppingCart, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import { formatRupiah, formatDate } from '../../lib/utils';

const statusBadge: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};
const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu', PAID: 'Dibayar', PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim', DELIVERED: 'Selesai', CANCELLED: 'Batal'
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/reports/dashboard').then(r => r.data),
    refetchInterval: 30000,
  });

  const ordersByStatus = (data?.ordersByStatus || []).reduce((acc: any, s: any) => {
    acc[s.status] = s._count;
    return acc;
  }, {});

  const cards = [
    { label: 'Pendapatan Bulan Ini', value: data ? formatRupiah(data.monthRevenue) : '—', icon: TrendingUp, color: 'text-forest-700', bg: 'bg-forest-50' },
    { label: 'Total Pesanan Aktif', value: (ordersByStatus.PENDING || 0) + (ordersByStatus.PROCESSING || 0) + (ordersByStatus.SHIPPED || 0), icon: ShoppingCart, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Produk Aktif', value: data?.activeProducts || 0, icon: Package, color: 'text-purple-700', bg: 'bg-purple-50' },
    { label: 'Pelanggan Baru', value: data?.newCustomers || 0, icon: Users, color: 'text-amber-700', bg: 'bg-amber-50' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-forest-900">Dashboard</h1>
        <p className="font-body text-sm text-cream-700 mt-1">Ringkasan performa toko hari ini</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white border border-cream-300 rounded-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-sm flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className="font-display text-xl font-bold text-forest-900">{isLoading ? '—' : card.value}</div>
            <div className="font-body text-xs text-cream-600 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-cream-300 rounded-sm p-6 mb-8">
        <h2 className="font-display text-base text-forest-900 mb-5">Pendapatan 30 Hari Terakhir</h2>
        {isLoading ? (
          <div className="h-48 bg-cream-200 animate-pulse rounded-sm" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'Inter' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'Inter' }} tickFormatter={v => `${(v / 1000000).toFixed(1)}jt`} />
              <Tooltip formatter={(v: any) => [formatRupiah(v), 'Pendapatan']} labelFormatter={l => `Tanggal: ${l}`} />
              <Line type="monotone" dataKey="revenue" stroke="#1B4332" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#C9B26B' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-cream-300 rounded-sm p-6">
        <h2 className="font-display text-base text-forest-900 mb-4">Pesanan Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="border-b border-cream-300">
                {['Invoice', 'Customer', 'Total', 'Status', 'Tanggal'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-cream-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders || []).map((order: any) => (
                <tr key={order.id} className="border-b border-cream-200 hover:bg-cream-100 transition-colors">
                  <td className="py-3 px-3 font-medium text-forest-800">{order.invoiceNumber}</td>
                  <td className="py-3 px-3 text-bark-800">{order.user?.name}</td>
                  <td className="py-3 px-3 font-semibold">{formatRupiah(order.totalAmount)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${statusBadge[order.status] || 'bg-gray-100 text-gray-600'}`}>{statusLabels[order.status] || order.status}</span>
                  </td>
                  <td className="py-3 px-3 text-cream-600 text-xs">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
