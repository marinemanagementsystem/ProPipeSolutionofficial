import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTersaneler, getProjeler, getDepartmanlar } from '../services/firebaseService';
import { Anchor, Activity, Settings, LogOut, ChevronRight, ArrowLeft, Building2, Ship, Wrench, Package, ShieldCheck, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const [tersaneler, setTersaneler] = useState([]);
  const [projeler, setProjeler] = useState([]);
  const [departmanlar, setDepartmanlar] = useState([]);
  const [selectedTersane, setSelectedTersane] = useState(null);
  const [selectedProje, setSelectedProje] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTersaneler();
  }, []);

  const loadTersaneler = async () => {
    setLoading(true);
    try {
      const data = await getTersaneler();
      setTersaneler(data);
    } finally {
      setLoading(false);
    }
  };

  const handleTersaneSelect = async (tersane) => {
    setSelectedTersane(tersane);
    setSelectedProje(null);
    setDepartmanlar([]);
    setLoading(true);
    try {
      setProjeler(await getProjeler(tersane.id));
    } finally {
      setLoading(false);
    }
  };

  const handleProjeSelect = async (proje) => {
    setSelectedProje(proje);
    setLoading(true);
    try {
      setDepartmanlar(await getDepartmanlar(proje.id));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedProje) {
      setSelectedProje(null);
      setDepartmanlar([]);
    } else if (selectedTersane) {
      setSelectedTersane(null);
      setProjeler([]);
    }
  };

  const stage = useMemo(() => {
    if (selectedProje) return 'departman';
    if (selectedTersane) return 'proje';
    return 'tersane';
  }, [selectedProje, selectedTersane]);

  const stats = useMemo(() => ([
    { label: 'Tersane', value: tersaneler.length, color: 'from-cyan-500/20 to-cyan-500/5' },
    { label: 'Proje', value: projeler.length, color: 'from-emerald-500/20 to-emerald-500/5' },
    { label: 'Departman', value: departmanlar.length, color: 'from-purple-500/20 to-purple-500/5' },
  ]), [tersaneler.length, projeler.length, departmanlar.length]);

  const renderCards = () => {
    if (stage === 'tersane') {
      if (!tersaneler.length) return <Empty title="Tersane yok" detail="Admin panelinden tersane ekleyin." />;
      return tersaneler.map(t => (
        <button key={t.id} onClick={() => handleTersaneSelect(t)} className="card">
          <div className="icon blue"><Building2 className="w-6 h-6" /></div>
          <div className="flex-1 text-left">
            <p className="label">Tersane</p>
            <h3 className="title">{t.name}</h3>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      ));
    }
    if (stage === 'proje') {
      if (!projeler.length) return <Empty title="Proje yok" detail="Bu tersanede henüz proje yok." />;
      return projeler.map(p => (
        <button key={p.id} onClick={() => handleProjeSelect(p)} className="card">
          <div className="icon green"><Ship className="w-6 h-6" /></div>
          <div className="flex-1 text-left">
            <p className="label">{selectedTersane?.name}</p>
            <h3 className="title">Proje {p.name}</h3>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      ));
    }
    if (!departmanlar.length) return <Empty title="Departman yok" detail="Bu projede henüz departman yok." />;
    return departmanlar.map(d => (
      <Link to={`/departman/${d.id}`} key={d.id} className="card">
        <div className={`icon ${d.type === 'boru' ? 'amber' : 'purple'}`}>
          {d.type === 'boru' ? <Package className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
        </div>
        <div className="flex-1 text-left">
          <p className="label">{selectedTersane?.name} · Proje {selectedProje?.name}</p>
          <h3 className="title">{d.name}</h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </Link>
    ));
  };

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-0 w-96 h-96 bg-cyan-500/15 blur-3xl rounded-full" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/15 blur-3xl rounded-full" />
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="hidden lg:flex w-72 panel flex-col border-r border-white/5">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-400 rounded-xl flex items-center justify-center">
                <Anchor className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">Propipe</h1>
                <p className="text-xs text-slate-400">Üretim Takip</p>
              </div>
            </div>
            <nav className="space-y-2">
              <Link to="/" className="nav active">
                <Activity className="w-5 h-5" /> Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" className="nav">
                  <Settings className="w-5 h-5" /> Yönetim Paneli
                </Link>
              )}
            </nav>
            <div className="mt-8 space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Anlık Durum</p>
              {stats.map((s, i) => (
                <div key={s.label} className={`rounded-xl border border-white/10 bg-gradient-to-r ${s.color} px-4 py-3 flex items-center justify-between`}>
                  <span className="text-slate-300 text-sm">{s.label}</span>
                  <span className="text-white font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto p-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-slate-950 font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{isAdmin ? 'Admin' : 'Kullanıcı'}</p>
              </div>
              <button onClick={logout} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 relative p-6 lg:p-10">
          <div className="panel rounded-3xl border border-white/10 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                {(selectedTersane || selectedProje) && (
                  <button onClick={handleBack} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5 text-slate-200" />
                  </button>
                )}
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Genel Bakış</p>
                  <h2 className="text-3xl font-bold text-white">
                    {stage === 'tersane' && 'Tersaneler'}
                    {stage === 'proje' && `${selectedTersane?.name} · Projeler`}
                    {stage === 'departman' && `Proje ${selectedProje?.name} · Departmanlar`}
                  </h2>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-300 flex-wrap">
                    <span className={`pill ${stage === 'tersane' ? 'bg-white/10 text-cyan-200' : 'bg-white/5 text-slate-200'}`} onClick={() => { setSelectedTersane(null); setSelectedProje(null); setProjeler([]); setDepartmanlar([]); }}>Tersaneler</span>
                    {selectedTersane && (
                      <>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <span className={`pill ${stage === 'proje' ? 'bg-white/10 text-emerald-200' : 'bg-white/5 text-slate-200'}`} onClick={() => { setSelectedProje(null); setDepartmanlar([]); }}>{selectedTersane.name}</span>
                      </>
                    )}
                    {selectedProje && (
                      <>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <span className="pill bg-white/10 text-purple-200">Proje {selectedProje.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
                {stats.map(s => (
                  <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{s.label}</p>
                    <p className="text-2xl font-semibold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {['Tersane', 'Proje', 'Departman'].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${i < ['tersane','proje','departman'].indexOf(stage) + 1 ? 'border-emerald-400/70 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{`Aşama ${i + 1}`}</p>
                    <p className="text-sm font-semibold text-white">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-cyan-400/60 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {renderCards()}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Empty({ title, detail }) {
  return (
    <div className="col-span-full text-center py-16 panel rounded-2xl border border-dashed border-white/10">
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
        <Sparkles className="w-6 h-6 text-slate-300" />
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-slate-400 mt-1">{detail}</p>
    </div>
  );
}
