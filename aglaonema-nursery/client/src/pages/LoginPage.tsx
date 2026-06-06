import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import api from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, remember);
      // Merge guest cart
      if (items.length > 0) {
        try {
          await api.post('/cart/merge', { items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) });
          clearCart();
          useCartStore.getState().syncWithServer();
        } catch {}
      }
      navigate(redirect);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-forest-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gold-400 font-display font-bold text-lg">A</span>
          </div>
          <h1 className="font-display text-3xl text-forest-800 mb-1">Selamat Datang</h1>
          <p className="font-body text-sm text-cream-700">Masuk ke akun Aglaonema Nursery Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-cream-300 rounded-sm p-8 space-y-5">
          <div>
            <label className="block text-xs font-body font-semibold text-bark-700 mb-1.5 tracking-wide">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="email@example.com" required />
          </div>
          <div>
            <label className="block text-xs font-body font-semibold text-bark-700 mb-1.5 tracking-wide">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-10" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-600 hover:text-forest-800">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-forest-800 w-4 h-4" />
            <span className="font-body text-sm text-bark-700">Ingat saya selama 30 hari</span>
          </label>
          {error && <p className="text-red-600 text-xs font-body bg-red-50 border border-red-200 rounded-sm p-2">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
          <p className="text-center font-body text-sm text-cream-700">
            Belum punya akun?{' '}
            <Link to={`/register${params.get('redirect') ? `?redirect=${params.get('redirect')}` : ''}`} className="text-forest-800 font-semibold hover:underline">Daftar sekarang</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
