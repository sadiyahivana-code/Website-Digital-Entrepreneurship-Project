import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, CheckCircle, XCircle, X } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileDown } from 'lucide-react';
import api from '../../lib/api';
import { formatRupiah, formatDate } from '../../lib/utils';

const statusOpts = ['', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const statusLabel: Record<string, string> = {
  PENDING: 'Menunggu', PAID: 'Dibayar', PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim', DELIVERED: 'Selesai', CANCELLED: 'Dibatalkan'
};
const statusBadge: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700', PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700', SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-600'
};

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState<any>(null);
  const [tracking, setTracking] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, status],
    queryFn: () => api.get('/admin/orders', { params: { page, status: status || undefined } }).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, trackingNumber }: any) => api.put(`/admin/orders/${id}/status`, { status, trackingNumber }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); setDetail(null); },
  });

  const confirmPayment = useMutation({
    mutationFn: ({ id, action }: any) => api.put(`/admin/orders/${id}/payment`, { action }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); setDetail(null); },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-forest-900">Manajemen Pesanan</h1>
        <p className="font-body text-sm text-cream-700 mt-1">{data?.total || 0} pesanan total</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {statusOpts.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`px-3 py-1.5 text-xs font-body rounded-sm border transition-all ${status === s ? 'bg-forest-800 text-cream-200 border-forest-800' : 'border-cream-300 hover:bg-cream-200'}`}>
            {s ? statusLabel[s] : 'Semua'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-cream-300 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-body text-sm">
            <thead className="bg-cream-200 border-b border-cream-300">
              <tr>
                {['Invoice', 'Customer', 'Total', 'Pembayaran', 'Status', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-cream-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="h-8 bg-cream-200 animate-pulse rounded" /></td></tr>
              )) : data?.orders?.map((order: any) => (
                <tr key={order.id} className="border-b border-cream-200 hover:bg-cream-100 transition-colors">
                  <td className="py-3 px-4 font-medium text-forest-800">{order.invoiceNumber}</td>
                  <td className="py-3 px-4 text-bark-800">{order.user?.name}<div className="text-xs text-cream-500">{order.user?.email}</div></td>
                  <td className="py-3 px-4 font-semibold">{formatRupiah(order.totalAmount)}</td>
                  <td className="py-3 px-4">
                    <div className="text-xs">{order.paymentMethod}</div>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-sm ${order.paymentStatus === 'CONFIRMED' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                      {order.paymentStatus === 'CONFIRMED' ? 'Terkonfirmasi' : order.paymentStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                    </span>
                  </td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${statusBadge[order.status]}`}>{statusLabel[order.status]}</span></td>
                  <td className="py-3 px-4 text-cream-600 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => { setDetail(order); setNewStatus(order.status); setTracking(order.trackingNumber || ''); }} className="p-1.5 hover:bg-cream-200 rounded-sm transition-colors text-forest-700">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
            <span className="font-body text-sm flex items-center px-2">{page}/{data.totalPages}</span>
            <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-cream-300">
              <h2 className="font-display text-base text-forest-800">Detail Pesanan — {detail.invoiceNumber}</h2>
              <button onClick={() => setDetail(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Payment proof */}
              {detail.paymentProof && detail.paymentStatus === 'WAITING' && (
                <div>
                  <p className="font-body text-sm font-semibold text-bark-700 mb-2">Bukti Pembayaran</p>
                  <img src={detail.paymentProof} alt="Bukti bayar" className="w-full max-h-48 object-contain rounded-sm border border-cream-300 mb-3" />
                  <div className="flex gap-2">
                    <button onClick={() => confirmPayment.mutate({ id: detail.id, action: 'confirm' })} className="btn-primary text-xs px-4 py-2 gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Konfirmasi
                    </button>
                    <button onClick={() => confirmPayment.mutate({ id: detail.id, action: 'reject' })} className="border border-red-400 text-red-600 text-xs px-4 py-2 rounded-sm hover:bg-red-50 transition-colors flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Tolak
                    </button>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <p className="font-body text-xs font-semibold text-cream-600 uppercase tracking-wide mb-2">Produk</p>
                <div className="space-y-2">
                  {detail.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm font-body">
                      <span>{item.product?.name} x{item.quantity}</span>
                      <span className="font-semibold">{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-cream-300 mt-2 pt-2 flex justify-between font-body font-bold">
                  <span>Total</span><span className="text-forest-800">{formatRupiah(detail.totalAmount)}</span>
                </div>
              </div>

              {/* Update status */}
              <div>
                <p className="font-body text-xs font-semibold text-cream-600 uppercase tracking-wide mb-2">Update Status</p>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field mb-3">
                  {statusOpts.slice(1).map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
                {newStatus === 'SHIPPED' && (
                  <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Nomor resi pengiriman" className="input-field mb-3" />
                )}
                <button onClick={() => updateStatus.mutate({ id: detail.id, status: newStatus, trackingNumber: tracking })} disabled={updateStatus.isPending} className="btn-primary text-xs px-4 py-2 disabled:opacity-60">
                  {updateStatus.isPending ? 'Menyimpan...' : 'Simpan Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
