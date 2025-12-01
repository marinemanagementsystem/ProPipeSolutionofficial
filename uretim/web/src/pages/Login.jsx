import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 -top-24 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />
        <div className="absolute right-10 top-10 w-72 h-72 bg-purple-500/25 blur-3xl rounded-full" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10 items-center">
        <div className="flex-1 space-y-5">
          <div className="pill text-sm text-slate-200 bg-white/5 border-white/10 w-fit">
            <span className="badge bg-emerald-400" />
            Tersane - Proje - Departman
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-white">
              Propipe Üretim Takip
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-white">
                gerçek zamanlı kontrol
              </span>
            </h1>
            <p className="text-lg text-slate-300 mt-3 max-w-2xl">
              Boru, Teçhiz ve Çelik ekiplerinin üretim, montaj ve kaynak durumlarını tek bir panelden yönetin.
              Tersane ve proje bazlı detaylara saniyeler içinde ulaşın.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-xl">
            {[
              ['Tersane', 'Sanmar · Sefine'],
              ['Proje', '383 · 367 · 368 · 387 · 404'],
              ['Departman', 'Boru · Teçhiz · Çelik'],
              ['Erişim', 'Admin & Kullanıcı'],
            ].map(([label, value]) => (
              <div key={label} className="panel rounded-xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-white mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Activity className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Güvenli Giriş</p>
                <h2 className="text-xl font-semibold text-white">Kontrol Paneli</h2>
              </div>
            </div>
            {error && (
              <div className="bg-red-500/15 border border-red-500/40 text-red-100 rounded-2xl px-4 py-3 mb-3 text-sm">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label className="text-sm text-slate-300">Kullanıcı adı</label>
                <input
                  className="input mt-2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Şifre</label>
                <input
                  className="input mt-2"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-400 to-white text-slate-950 font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-emerald-300/30 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <span>Panele giriş yap</span>
                )}
              </button>
            </form>
            <div className="grid grid-cols-2 gap-2 mt-5 text-xs text-slate-300">
              <div className="flex items-center gap-2"><span className="badge bg-emerald-400" />Gerçek zamanlı durum takibi</div>
              <div className="flex items-center gap-2"><span className="badge bg-cyan-400" />Renk kodlu üretim & montaj</div>
              <div className="flex items-center gap-2"><span className="badge bg-purple-400" />Admin & kullanıcı rol yönetimi</div>
              <div className="flex items-center gap-2"><span className="badge bg-amber-400" />Mobil & web uyumlu tasarım</div>
            </div>
            <p className="text-center text-slate-500 text-xs mt-4">Propipe Üretim Takip · 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
