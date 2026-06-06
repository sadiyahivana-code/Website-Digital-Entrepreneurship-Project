import { useState } from 'react';
import { User, Lock, MapPin } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

type Tab = 'profile' | 'password' | 'address';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileSave = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      setUser({ ...user!, ...data.user });
      setSuccess('Profil berhasil diperbarui');
    } catch (err: any) { setError(err.response?.data?.message || 'Gagal menyimpan'); }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (passForm.newPassword !== passForm.confirm) { setError('Password baru tidak cocok'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.put('/auth/password', { oldPassword: passForm.oldPassword, newPassword: passForm.newPassword });
      setSuccess('Password berhasil diubah');
      setPassForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) { setError(err.response?.data?.message || 'Gagal mengubah password'); }
    setLoading(false);
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'profile', label: 'Data Diri', icon: User },
    { key: 'password', label: 'Ganti Password', icon: Lock },
    { key: 'address', label: 'Alamat', icon: MapPin },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-8">Profil Saya</h1>

      {/* Tabs */}
      <div className="flex border-b border-cream-300 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSuccess(''); setError(''); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-body font-medium border-b-2 transition-all -mb-px ${tab === t.key ? 'border-forest-800 text-forest-800' : 'border-transparent text-cream-600 hover:text-forest-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-cream-300 rounded-sm p-6">
        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-sm text-sm font-body text-forest-700">{success}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm font-body text-red-600">{error}</div>}

        {tab === 'profile' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-body font-semibold text-bark-700 mb-1.5">Nama Lengkap</label>
              <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-body font-semibold text-bark-700 mb-1.5">Email</label>
              <input value={user?.email || ''} disabled className="input-field bg-cream-200 cursor-not-allowed opacity-70" />
            </div>
            <div>
              <label className="block text-xs font-body font-semibold text-bark-700 mb-1.5">Nomor HP</label>
              <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="08xxx" />
            </div>
            <button onClick={handleProfileSave} disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        )}

        {tab === 'password' && (
          <div className="space-y-4">
            {[
              { key: 'oldPassword', label: 'Password Lama' },
              { key: 'newPassword', label: 'Password Baru' },
              { key: 'confirm', label: 'Konfirmasi Password Baru' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-body font-semibold text-bark-700 mb-1.5">{f.label}</label>
                <input type="password" value={(passForm as any)[f.key]} onChange={e => setPassForm(p => ({ ...p, [f.key]: e.target.value }))} className="input-field" placeholder="••••••••" />
              </div>
            ))}
            <button onClick={handlePasswordChange} disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? 'Mengubah...' : 'Ubah Password'}
            </button>
          </div>
        )}

        {tab === 'address' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-body font-semibold text-bark-700 mb-1.5">Alamat Utama</label>
              <textarea value={profileForm.address} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))} className="input-field resize-none h-24" placeholder="Alamat lengkap Anda..." />
            </div>
            <button onClick={handleProfileSave} disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? 'Menyimpan...' : 'Simpan Alamat'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
