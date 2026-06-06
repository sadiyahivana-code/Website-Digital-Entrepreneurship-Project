import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../lib/api';
import { formatRupiah, formatDate, formatShortDate } from '../../lib/utils';

const presets = [
  { label: 'Hari Ini', days: 0 },
  { label: '7 Hari', days: 7 },
  { label: '30 Hari', days: 30 },
  { label: 'Bulan Ini', days: -1 },
];

export default function AdminReports() {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(thirtyAgo);
  const [to, setTo] = useState(today);
  const [status, setStatus] = useState('');
  const [payment, setPayment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', from, to, status, payment],
    queryFn: () => api.get('/admin/reports', { params: { from, to, status: status || undefined, payment: payment || undefined } }).then(r => r.data),
  });

  const applyPreset = (days: number) => {
    const now = new Date();
    if (days === -1) {
      setFrom(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
    } else if (days === 0) {
      setFrom(today);
    } else {
      setFrom(new Date(Date.now() - days * 86400000).toISOString().slice(0, 10));
    }
    setTo(today);
  };

  const exportExcel = () => {
    if (!data) return;
    const orders = data.orders.map((o: any) => ({
      'No Invoice': o.invoiceNumber,
      'Tanggal': formatDate(o.createdAt),
      'Customer': o.user?.name,
      'Total': o.totalAmount,
      'Status': o.status,
      'Metode Bayar': o.paymentMethod,
    }));
    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    XLSX.writeFile(wb, `Laporan-Aglaonema-${from}-${to}.xlsx`);
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Laporan Penjualan — Aglaonema Nursery', 14, 20);
    doc.setFontSize(10);
    doc.text(`Periode: ${formatDate(from)} s.d. ${formatDate(to)}`, 14, 28);
    doc.text(`Total Pendapatan: ${formatRupiah(data.summary.totalRevenue)}`, 14, 34);
    doc.text(`Total Pesanan: ${data.summary.totalOrders}`, 14, 40);

    (doc as any).autoTable({
      startY: 48,
      head: [['No Invoice', 'Tanggal', 'Customer', 'Total', 'Status']],
      body: data.orders.map((o: any) => [o.invoiceNumber, formatShortDate(o.createdAt), o.user?.name, formatRupiah(o.totalAmount), o.status]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [27, 67, 50] },
    });
    doc.save(`Laporan-Aglaonema-${from}-${to}.pdf`);
  };

  const summary = data?.summary || {};

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-900">Laporan Penjualan</h1>
          <p className="font-body text-sm text-cream-700 mt-1">Analisis pendapatan dan performa produk</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="btn-secondary text-xs px-3 py-2 gap-1.5"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
          <button onClick={exportPDF} className="btn-secondary text-xs px-3 py-2 gap-1.5"><FileText className="w-3.5 h-3.5" /> PDF</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-cream-300 rounded-sm p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-body font-semibold text-bark-700 mb-1">Dari</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs font-body font-semibold text-bark-700 mb-1">Sampai</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs font-body font-semibold text-bark-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-field text-sm w-36">
              <option value="">Semua</option>
              {['PAID', 'DELIVERED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-1.5">
            {presets.map(p => (
              <button key={p.label} onClick={() => applyPreset(p.days)} className="px-3 py-2 text-xs font-body border border-cream-300 hover:bg-cream-200 rounded-sm transition-colors">{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Pendapatan', value: formatRupiah(summary.totalRevenue || 0) },
          { label: 'Total Pesanan', value: summary.totalOrders || 0 },
          { label: 'Rata-rata Nilai', value: formatRupiah(summary.avgOrderValue || 0) },
          { label: 'Item Terjual', value: summary.totalItemsSold || 0 },
        ].map(card => (
          <div key={card.label} className="bg-white border border-cream-300 rounded-sm p-4">
            <div className="font-body text-xs text-cream-600 mb-1">{card.label}</div>
            <div className="font-display font-bold text-lg text-forest-900">{isLoading ? '—' : card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-cream-300 rounded-sm p-5">
          <h2 className="font-display text-base text-forest-900 mb-4">Pendapatan Harian</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.dailyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D3" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}jt`} />
              <Tooltip formatter={(v: any) => [formatRupiah(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#1B4332" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-cream-300 rounded-sm p-5">
          <h2 className="font-display text-base text-forest-900 mb-4">Kumulatif</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={(data?.dailyRevenue || []).reduce((acc: any[], item: any, i: number) => {
              const prev = i > 0 ? acc[i - 1].cumulative : 0;
              acc.push({ ...item, cumulative: prev + item.revenue });
              return acc;
            }, [])}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D3" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}jt`} />
              <Tooltip formatter={(v: any) => [formatRupiah(v), 'Kumulatif']} />
              <Area type="monotone" dataKey="cumulative" stroke="#C9B26B" fill="#C9B26B20" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-cream-300 rounded-sm p-5">
          <h2 className="font-display text-base text-forest-900 mb-4">Produk Terlaris</h2>
          <div className="space-y-3">
            {(data?.productSales || []).slice(0, 8).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="font-body text-xs text-cream-600 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-body text-xs font-medium text-bark-900 truncate">{p.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex-1 bg-cream-300 rounded-full h-1">
                      <div className="bg-forest-700 h-1 rounded-full" style={{ width: `${(p.sold / (data?.productSales[0]?.sold || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-body text-xs font-semibold text-forest-800">{p.sold} terjual</div>
                  <div className="font-body text-xs text-cream-600">{formatRupiah(p.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders table */}
        <div className="bg-white border border-cream-300 rounded-sm p-5 overflow-auto">
          <h2 className="font-display text-base text-forest-900 mb-4">Detail Pesanan</h2>
          <table className="w-full font-body text-xs">
            <thead>
              <tr className="border-b border-cream-300">
                {['Invoice', 'Customer', 'Total', 'Status'].map(h => (
                  <th key={h} className="text-left py-1.5 px-2 text-cream-600 font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.orders || []).slice(0, 10).map((o: any) => (
                <tr key={o.id} className="border-b border-cream-100 hover:bg-cream-50">
                  <td className="py-1.5 px-2 font-medium text-forest-800">{o.invoiceNumber}</td>
                  <td className="py-1.5 px-2 text-bark-700">{o.user?.name}</td>
                  <td className="py-1.5 px-2 font-semibold">{formatRupiah(o.totalAmount)}</td>
                  <td className="py-1.5 px-2"><span className="px-1.5 py-0.5 bg-cream-200 rounded-sm">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
