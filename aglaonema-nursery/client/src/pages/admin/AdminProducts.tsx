import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, EyeOff, Eye, X } from 'lucide-react';
import api from '../../lib/api';
import { formatRupiah } from '../../lib/utils';

interface ProductForm {
  name: string; description: string; price: string; stock: string;
  category: string; images: string; isActive: boolean;
}

const emptyForm: ProductForm = { name: '', description: '', price: '', stock: '', category: '', images: '', isActive: true };

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState<null | 'add' | 'edit'>(null);
  const [editId, setEditId] = useState('');
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, status],
    queryFn: () => api.get('/admin/products', { params: { page, status: status || undefined } }).then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => modal === 'add' ? api.post('/admin/products', payload) : api.put(`/admin/products/${editId}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setModal(null); setForm(emptyForm); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.put(`/admin/products/${id}`, { isActive: !isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const handleEdit = (product: any) => {
    setEditId(product.id);
    setForm({ name: product.name, description: product.description, price: product.price.toString(), stock: product.stock.toString(), category: product.category, images: product.images.join('\n'), isActive: product.isActive });
    setModal('edit');
  };

  const handleSave = () => {
    saveMutation.mutate({ ...form, price: Number(form.price), stock: Number(form.stock), images: form.images.split('\n').filter(Boolean) });
  };

  const stockColor = (stock: number) => stock === 0 ? 'text-red-600 bg-red-50' : stock <= 10 ? 'text-amber-600 bg-amber-50' : 'text-forest-700 bg-green-50';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-900">Manajemen Produk</h1>
          <p className="font-body text-sm text-cream-700 mt-1">{data?.total || 0} produk terdaftar</p>
        </div>
        <button onClick={() => { setModal('add'); setForm(emptyForm); }} className="btn-primary gap-2"><Plus className="w-4 h-4" /> Tambah Produk</button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[['', 'Semua'], ['active', 'Aktif'], ['inactive', 'Nonaktif'], ['low', 'Stok Rendah'], ['out', 'Habis']].map(([val, label]) => (
          <button key={val} onClick={() => { setStatus(val); setPage(1); }} className={`px-3 py-1.5 text-xs font-body rounded-sm border transition-all ${status === val ? 'bg-forest-800 text-cream-200 border-forest-800' : 'border-cream-300 hover:bg-cream-200'}`}>{label}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-cream-300 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-body text-sm">
            <thead className="bg-cream-200 border-b border-cream-300">
              <tr>
                {['Produk', 'Kategori', 'Harga', 'Stok', 'Terjual', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-cream-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="h-8 bg-cream-200 animate-pulse rounded" /></td></tr>
              )) : data?.products?.map((p: any) => (
                <tr key={p.id} className={`border-b border-cream-200 hover:bg-cream-100 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0] || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=80'} className="w-10 h-10 object-cover rounded-sm" alt="" />
                      <span className="font-medium text-bark-900 max-w-[180px] truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-cream-600">{p.category}</td>
                  <td className="py-3 px-4 font-semibold text-forest-800">{formatRupiah(p.price)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${stockColor(p.stock)}`}>{p.stock}</span>
                  </td>
                  <td className="py-3 px-4 text-cream-600">{p.sold}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-cream-200 rounded-sm transition-colors text-forest-700"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggleMutation.mutate({ id: p.id, isActive: p.isActive })} className={`p-1.5 hover:bg-cream-200 rounded-sm transition-colors ${p.isActive ? 'text-amber-600' : 'text-forest-600'}`}>
                        {p.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-cream-300">
              <h2 className="font-display text-lg text-forest-800">{modal === 'add' ? 'Tambah Produk' : 'Edit Produk'}</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'name', label: 'Nama Produk', type: 'text' },
                { key: 'category', label: 'Kategori', type: 'text' },
                { key: 'price', label: 'Harga (Rp)', type: 'number' },
                { key: 'stock', label: 'Stok', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-body font-semibold text-bark-700 mb-1">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="input-field" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-body font-semibold text-bark-700 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field resize-none h-24" />
              </div>
              <div>
                <label className="block text-xs font-body font-semibold text-bark-700 mb-1">URL Gambar (satu per baris)</label>
                <textarea value={form.images} onChange={e => setForm(p => ({ ...p, images: e.target.value }))} className="input-field resize-none h-20" placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="accent-forest-800 w-4 h-4" />
                <span className="font-body text-sm">Produk Aktif</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-cream-300">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Batal</button>
              <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary flex-1 justify-center disabled:opacity-60">
                {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
