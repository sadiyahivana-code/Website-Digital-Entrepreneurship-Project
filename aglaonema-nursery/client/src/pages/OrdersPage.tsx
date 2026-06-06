import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, FileText } from 'lucide-react';
import api from '../lib/api';
import { formatRupiah, formatDate } from '../lib/utils';

const statusLabel: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu', color: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Dibayar', color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Diproses', color: 'bg-purple-100 text-purple-700' },
  SHIPPED: { label: 'Dikirim', color: 'bg-indigo-100 text-indigo-700' },
  DELIVERED: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-600' },
};

export default function OrdersPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', status, page],
    queryFn: () => api.get('/orders', { params: { status: status || undefined, page } }).then(r => r.data),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-title mb-8">Pesanan Saya</h1>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[['', 'Semua'], ...Object.entries(statusLabel).map(([k, v]) => [k, v.label])].map(([val, label]) => (
          <button key={val} onClick={() => { setStatus(val); setPage(1); }} className={`px-3 py-1.5 text-xs font-body font-medium rounded-sm border transition-all ${status === val ? 'bg-forest-800 text-cream-200 border-forest-800' : 'border-cream-300 hover:bg-cream-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-cream-300 animate-pulse rounded-sm" />)}
        </div>
      ) : data?.orders?.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-cream-400 mx-auto mb-3" />
          <p className="font-display text-xl text-forest-800">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.orders?.map((order: any) => {
            const st = statusLabel[order.status];
            return (
              <div key={order.id} className="bg-white border border-cream-300 rounded-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="font-body font-semibold text-sm text-forest-800">{order.invoiceNumber}</span>
                    <span className="mx-2 text-cream-400">·</span>
                    <span className="font-body text-xs text-cream-600">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-sm text-xs font-body font-semibold ${st.color}`}>{st.label}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {order.items.slice(0, 3).map((item: any) => (
                    <span key={item.id} className="text-xs font-body text-bark-800 bg-cream-200 px-2 py-1 rounded-sm">{item.product.name} x{item.quantity}</span>
                  ))}
                  {order.items.length > 3 && <span className="text-xs font-body text-cream-600">+{order.items.length - 3} lainnya</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body font-bold text-forest-800">{formatRupiah(order.totalAmount)}</span>
                  <div className="flex gap-2">
                    <Link to={`/orders/${order.id}`} className="btn-secondary text-xs px-3 py-2">Lihat Detail</Link>
                    <Link to={`/orders/${order.id}#invoice`} className="btn-secondary text-xs px-3 py-2 gap-1">
                      <FileText className="w-3 h-3" /> Invoice
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs px-4 py-2 disabled:opacity-40">← Prev</button>
          <span className="font-body text-sm flex items-center px-3">{page} / {data.totalPages}</span>
          <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs px-4 py-2 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
