import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAdminStore } from '../../stores/authStore';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-forest-900" />
          </div>
          <h1 className="font-display text-3xl text-cream-200 mb-1">Admin Panel</h1>
          <p className="font-body text-sm text-cream-500">Aglaonema Nursery</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-forest-800 border border-forest-700 rounded-sm p-8 space-y-5">
          <div>
            <label className="block text-xs font-body font-semibold text-cream-400 mb-1.5 tracking-widest uppercase">Email Admin</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-forest-900 border border-forest-600 text-cream-200 rounded-sm px-4 py-3 text-sm font-body focus:outline-none focus:border-gold-400 placeholder-forest-500" placeholder="admin@aglaonema.id" required />
          </div>
          <div>
            <label className="block text-xs font-body font-semibold text-cream-400 mb-1.5 tracking-widest uppercase">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-forest-900 border border-forest-600 text-cream-200 rounded-sm px-4 py-3 pr-10 text-sm font-body focus:outline-none focus:border-gold-400 placeholder-forest-500" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-500 hover:text-cream-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs font-body bg-red-900/20 border border-red-800 rounded-sm p-2">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-gold-400 text-forest-900 py-3 font-body font-bold text-sm tracking-wide hover:bg-gold-300 transition-colors rounded-sm disabled:opacity-60">
            {loading ? 'Masuk...' : 'Masuk sebagai Admin'}
          </button>
        </form>

        <p className="text-center font-body text-xs text-forest-500 mt-4">
          Akses admin hanya untuk staf yang berwenang
        </p>
      </div>
    </div>
  );
}
