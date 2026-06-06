import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import api from '../lib/api';

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-body ${ok ? 'text-forest-700' : 'text-cream-600'}`}>
      {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {label}
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const rules = {
    len: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    num: /[0-9]/.test(form.password),
    match: form.password === form.confirm && form.confirm.length > 0,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rules.len || !rules.upper || !rules.num) { setError('Password tidak memenuhi syarat'); return; }
    if (!rules.match) { setError('Password tidak cocok'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      if (items.length > 0) {
        try {
          await api.post('/cart/merge', { items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) });
          clearCart();
          useCartStore.getState().syncWithServer();
        } catch {}
      }
      navigate(redirect);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-forest-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gold-400 font-display font-bold text-lg">A</span>
          </div>
          <h1 className="font-display text-3xl text-forest-800 mb-1">Buat Akun Baru</h1>
          <p className="font-body text-sm text-cream-700">Bergabung dengan komunitas pecinta Aglaonema</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-cream-300 rounded-sm p-8 space-y-4">
          {[
            { key: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama lengkap Anda' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
            { key: 'phone', label: 'Nomor HP', type: 'tel', placeholder: '08xxx (opsional)' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-body font-semibold text-bark-700 mb-1.5 tracking-wide">{field.label}</label>
              <input type={field.type} value={(form as any)[field.key]} onChange={f(field.key)} className="input-field" placeholder={field.placeholder} required={field.key !== 'phone'} />
            </div>
          ))}

          <div>
            <label className="block text-xs font-body font-semibold text-bark-700 mb-1.5 tracking-wide">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={f('password')} className="input-field pr-10" placeholder="Min. 8 karakter" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-600 hover:text-forest-800">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 space-y-1">
                <PasswordRule ok={rules.len} label="Minimal 8 karakter" />
                <PasswordRule ok={rules.upper} label="Mengandung huruf kapital" />
                <PasswordRule ok={rules.num} label="Mengandung angka" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-body font-semibold text-bark-700 mb-1.5 tracking-wide">Konfirmasi Password</label>
            <input type="password" value={form.confirm} onChange={f('confirm')} className="input-field" placeholder="Ulangi password" required />
            {form.confirm && <PasswordRule ok={rules.match} label="Password cocok" />}
          </div>

          {error && <p className="text-red-600 text-xs font-body bg-red-50 border border-red-200 rounded-sm p-2">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
          <p className="text-center font-body text-sm text-cream-700">
            Sudah punya akun?{' '}
            <Link to={`/login${params.get('redirect') ? `?redirect=${params.get('redirect')}` : ''}`} className="text-forest-800 font-semibold hover:underline">Masuk di sini</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
