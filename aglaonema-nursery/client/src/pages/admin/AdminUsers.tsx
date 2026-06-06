import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserX, UserCheck } from 'lucide-react';
import api from '../../lib/api';
import { formatRupiah, formatDate } from '../../lib/utils';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => api.get('/admin/users', { params: { page } }).then(r => r.data),
  });

  const toggleSuspend = useMutation({
    mutationFn: (id: string) => api.put(`/admin/users/${id}/suspend`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-forest-900">Kelola User</h1>
        <p className="font-body text-sm text-cream-700 mt-1">{data?.total || 0} pelanggan terdaftar</p>
      </div>

      <div className="bg-white border border-cream-300 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-body text-sm">
            <thead className="bg-cream-200 border-b border-cream-300">
              <tr>
                {['Nama', 'Email', 'No. HP', 'Total Belanja', 'Bergabung', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-cream-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="h-8 bg-cream-200 animate-pulse rounded" /></td></tr>
              )) : data?.users?.map((user: any) => {
                const totalBelanja = user.orders?.reduce((sum: number, o: any) => sum + o.totalAmount, 0) || 0;
                return (
                  <tr key={user.id} className={`border-b border-cream-200 hover:bg-cream-100 transition-colors ${user.isSuspended ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center text-forest-800 font-bold text-sm">{user.name[0]}</div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-cream-600">{user.email}</td>
                    <td className="py-3 px-4 text-cream-600">{user.phone || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-forest-800">{formatRupiah(totalBelanja)}</td>
                    <td className="py-3 px-4 text-xs text-cream-600">{formatDate(user.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${user.isSuspended ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {user.isSuspended ? 'Dinonaktifkan' : 'Aktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleSuspend.mutate(user.id)} className={`p-1.5 rounded-sm hover:bg-cream-200 transition-colors ${user.isSuspended ? 'text-forest-700' : 'text-red-500'}`}>
                        {user.isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
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
    </div>
  );
}
