import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getUsers, createUser, updateUser, deleteUser,
  getTersaneler, createTersane, updateTersane, deleteTersane,
  getProjeler, createProje, updateProje, deleteProje,
  getDepartmanlar, createDepartman, deleteDepartman,
  getUstalar, createUsta, updateUsta, deleteUsta,
  cleanupAllData, seedInitialData,
} from '../services/firebaseService';
import { Anchor, Settings, Activity, LogOut, Users, Building2, Folder, Wrench, UserCheck, Plus, Edit2, Trash2, RefreshCw, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const tabs = [
  { id: 'users', label: 'Kullanıcılar', icon: Users },
  { id: 'tersaneler', label: 'Tersaneler', icon: Building2 },
  { id: 'projeler', label: 'Projeler', icon: Folder },
  { id: 'departmanlar', label: 'Departmanlar', icon: Wrench },
  { id: 'ustalar', label: 'Ustalar', icon: UserCheck },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('users');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({});
  const [editData, setEditData] = useState({});

  const [usersData, setUsersData] = useState([]);
  const [tersaneler, setTersaneler] = useState([]);
  const [projeler, setProjeler] = useState([]);
  const [departmanlar, setDepartmanlar] = useState([]);
  const [ustalar, setUstalar] = useState([]);

  useEffect(() => {
    load();
  }, [active]);

  const load = async () => {
    setLoading(true);
    switch (active) {
      case 'users':
        setUsersData(await getUsers());
        break;
      case 'tersaneler':
        setTersaneler(await getTersaneler());
        break;
      case 'projeler':
        setTersaneler(await getTersaneler());
        setProjeler(await getProjeler());
        break;
      case 'departmanlar':
        setTersaneler(await getTersaneler());
        setProjeler(await getProjeler());
        setDepartmanlar(await getDepartmanlar());
        break;
      case 'ustalar':
        setUstalar(await getUstalar());
        break;
      default:
        break;
    }
    setLoading(false);
  };

  const show = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  };

  const add = async () => {
    switch (active) {
      case 'users':
        await createUser(newItem);
        break;
      case 'tersaneler':
        await createTersane(newItem);
        break;
      case 'projeler': {
        const t = tersaneler.find((x) => x.id === newItem.tersaneId);
        await createProje({ ...newItem, tersaneName: t?.name });
        break;
      }
      case 'departmanlar': {
        const p = projeler.find((x) => x.id === newItem.projeId);
        const t = tersaneler.find((x) => x.id === p?.tersaneId);
        await createDepartman({ ...newItem, projeName: p?.name, tersaneId: p?.tersaneId, tersaneName: t?.name });
        break;
      }
      case 'ustalar':
        await createUsta(newItem);
        break;
      default:
        break;
    }
    setShowAdd(false);
    setNewItem({});
    load();
    show('Kayıt eklendi');
  };

  const save = async () => {
    switch (active) {
      case 'users':
        await updateUser(editingId, editData);
        break;
      case 'tersaneler':
        await updateTersane(editingId, editData);
        break;
      case 'projeler':
        await updateProje(editingId, editData);
        break;
      case 'ustalar':
        await updateUsta(editingId, editData);
        break;
      default:
        break;
    }
    setEditingId(null);
    setEditData({});
    load();
    show('Kayıt güncellendi');
  };

  const remove = async (id) => {
    if (!window.confirm('Silmek istiyor musunuz?')) return;
    switch (active) {
      case 'users':
        await deleteUser(id);
        break;
      case 'tersaneler':
        await deleteTersane(id);
        break;
      case 'projeler':
        await deleteProje(id);
        break;
      case 'departmanlar':
        await deleteDepartman(id);
        break;
      case 'ustalar':
        await deleteUsta(id);
        break;
      default:
        break;
    }
    load();
    show('Silindi');
  };

  const tableData = () => {
    switch (active) {
      case 'users': return usersData;
      case 'tersaneler': return tersaneler;
      case 'projeler': return projeler;
      case 'departmanlar': return departmanlar;
      case 'ustalar': return ustalar;
      default: return [];
    }
  };

  const renderAddForm = () => {
    switch (active) {
      case 'users':
        return (
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Kullanıcı adı" value={newItem.username || ''} onChange={(e) => setNewItem({ ...newItem, username: e.target.value })} />
            <input className="input" placeholder="Ad Soyad" value={newItem.name || ''} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <input className="input" placeholder="Şifre" value={newItem.password || ''} onChange={(e) => setNewItem({ ...newItem, password: e.target.value })} />
            <select className="input" value={newItem.role || 'user'} onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}>
              <option value="user">Kullanıcı</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        );
      case 'tersaneler':
        return <input className="input" placeholder="Tersane adı" value={newItem.name || ''} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />;
      case 'projeler':
        return (
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={newItem.tersaneId || ''} onChange={(e) => setNewItem({ ...newItem, tersaneId: e.target.value })}>
              <option value="">Tersane seçin</option>
              {tersaneler.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input className="input" placeholder="Proje no" value={newItem.name || ''} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
          </div>
        );
      case 'departmanlar':
        return (
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={newItem.projeId || ''} onChange={(e) => setNewItem({ ...newItem, projeId: e.target.value })}>
              <option value="">Proje seçin</option>
              {projeler.map((p) => <option key={p.id} value={p.id}>{p.tersaneName} · {p.name}</option>)}
            </select>
            <select className="input" value={newItem.type || ''} onChange={(e) => setNewItem({ ...newItem, type: e.target.value, name: e.target.value === 'boru' ? 'Boru' : 'Teçhiz' })}>
              <option value="">Tip</option>
              <option value="boru">Boru</option>
              <option value="techiz">Teçhiz</option>
            </select>
          </div>
        );
      case 'ustalar':
        return <input className="input" placeholder="Usta adı" value={newItem.name || ''} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen grid-bg relative">
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
              <Link to="/" className="nav"><Activity className="w-5 h-5" />Dashboard</Link>
              <div className="nav active"><Settings className="w-5 h-5" />Yönetim Paneli</div>
            </nav>
            <div className="mt-8 space-y-2">
              {tabs.map((t) => {
                const Icon = t.icon;
                const activeTab = active === t.id;
                return (
                  <button key={t.id} onClick={() => { setActive(t.id); setShowAdd(false); setEditingId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab ? 'bg-white/10 text-white border border-white/10' : 'text-slate-300 hover:bg-white/5'}`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-auto p-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-slate-950 font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">Admin</p>
              </div>
              <button onClick={logout} className="p-2 rounded-lg bg-white/5 text-slate-300"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10">
          <div className="panel rounded-3xl border border-white/10 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Yönetim</p>
                <h2 className="text-3xl font-bold text-white">{tabs.find((t) => t.id === active)?.label}</h2>
                <p className="text-slate-400 text-sm mt-1">CRUD + hızlı veri sıfırlama</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="chip bg-white/5 text-slate-200" onClick={() => { setShowAdd(true); setNewItem(active === 'users' ? { role: 'user' } : {}); }}><Plus className="w-4 h-4" />Yeni Ekle</button>
                <button className="chip bg-red-500/15 text-red-100" onClick={async () => { await cleanupAllData(); await seedInitialData(); load(); show('Veri sıfırlandı'); }}><RefreshCw className="w-4 h-4" />Sıfırla</button>
              </div>
            </div>
          </div>

          {message && <div className="mt-4 panel rounded-xl px-4 py-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-100">{message}</div>}

          {showAdd && (
            <div className="mt-6 panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Yeni {tabs.find((t) => t.id === active)?.label}</h3>
              {renderAddForm()}
              <div className="flex gap-2 mt-4">
                <button className="chip bg-emerald-500/15 text-emerald-100" onClick={add}>Kaydet</button>
                <button className="chip bg-slate-500/15 text-slate-200" onClick={() => setShowAdd(false)}>İptal</button>
              </div>
            </div>
          )}

          <div className="mt-6 panel rounded-2xl border border-white/10 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-cyan-400/60 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    {active === 'users' && (<><th>Kullanıcı</th><th>Ad Soyad</th><th>Rol</th></>)}
                    {active === 'tersaneler' && (<th>Ad</th>)}
                    {active === 'projeler' && (<><th>Tersane</th><th>Proje</th></>)}
                    {active === 'departmanlar' && (<><th>Tersane</th><th>Proje</th><th>Departman</th></>)}
                    {active === 'ustalar' && (<th>Usta</th>)}
                    <th className="text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData().map((row) => {
                    const editingRow = editingId === row.id;
                    return (
                      <tr key={row.id} className="border-t border-white/5">
                        {active === 'users' && (
                          <>
                            <td>{editingRow ? <input className="input" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} /> : row.username}</td>
                            <td>{editingRow ? <input className="input" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /> : row.name}</td>
                            <td>{editingRow ? (
                              <select className="input" value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
                                <option value="user">Kullanıcı</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : <span className="chip bg-white/5 text-slate-200">{row.role}</span>}</td>
                          </>
                        )}
                        {active === 'tersaneler' && (
                          <td>{editingRow ? <input className="input" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /> : row.name}</td>
                        )}
                        {active === 'projeler' && (
                          <>
                            <td>{row.tersaneName}</td>
                            <td>{editingRow ? <input className="input" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /> : row.name}</td>
                          </>
                        )}
                        {active === 'departmanlar' && (
                          <>
                            <td>{row.tersaneName}</td>
                            <td>{row.projeName}</td>
                            <td><span className={`chip ${row.type === 'boru' ? 'bg-amber-500/15 text-amber-100' : 'bg-purple-500/15 text-purple-100'}`}>{row.name}</span></td>
                          </>
                        )}
                        {active === 'ustalar' && (
                          <td>{editingRow ? <input className="input" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /> : row.name}</td>
                        )}
                        <td className="text-right">
                          {editingRow ? (
                            <div className="flex gap-1 justify-end">
                              <button className="chip bg-emerald-500/15 text-emerald-100" onClick={save}><Save className="w-4 h-4" /></button>
                              <button className="chip bg-slate-500/15 text-slate-200" onClick={() => { setEditingId(null); setEditData({}); }}><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div className="flex gap-1 justify-end">
                              {(active === 'users' || active === 'tersaneler' || active === 'ustalar' || active === 'projeler') && (
                                <button className="chip bg-blue-500/15 text-blue-100" onClick={() => { setEditingId(row.id); setEditData(row); }}><Edit2 className="w-4 h-4" /></button>
                              )}
                              <button className="chip bg-red-500/15 text-red-100" onClick={() => remove(row.id)}><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
