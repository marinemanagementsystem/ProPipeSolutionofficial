import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Download, BarChart2, Filter, Edit2, Trash2, Save, X } from 'lucide-react';
import { getBoruIsler, createBoruIs, updateBoruIs, deleteBoruIs, getUstalar } from '../services/firebaseService';

const blank = {
  tag: '',
  system: '',
  pipe: '',
  spoolNo: '',
  rev: '',
  toplamSpool: 1,
  imalat: 0,
  montaj: 0,
  montajYapanUsta: '',
  montajTarihi: '',
  gun: '',
  aciklama: '',
};

export default function BoruDepartman({ departman }) {
  const [isler, setIsler] = useState([]);
  const [ustalar, setUstalar] = useState([]);
  const [filter, setFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [departman.id]);

  const load = async () => {
    setLoading(true);
    setIsler(await getBoruIsler(departman.id));
    setUstalar(await getUstalar());
    setLoading(false);
  };

  const submit = async () => {
    await createBoruIs({ ...form, departmanId: departman.id });
    setShowAdd(false);
    setForm(blank);
    load();
  };

  const saveEdit = async () => {
    await updateBoruIs(editing, form);
    setEditing(null);
    setForm(blank);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Silmek istiyor musunuz?')) return;
    await deleteBoruIs(id);
    load();
  };

  const stats = useMemo(() => {
    const toplamSpool = isler.reduce((sum, i) => sum + (i.toplamSpool || 0), 0);
    const ustaStats = {};
    isler.forEach((i) => {
      if (i.montajYapanUsta && i.montaj === 1) {
        ustaStats[i.montajYapanUsta] = (ustaStats[i.montajYapanUsta] || 0) + 1;
      }
    });
    return { toplamSpool, imalat: isler.filter((i) => i.imalat === 1).length, montaj: isler.filter((i) => i.montaj === 1).length, ustaStats };
  }, [isler]);

  const filtered = filter ? isler.filter((i) => i.system === filter) : isler;
  const uniqueSystem = [...new Set(isler.map((i) => i.system).filter(Boolean))];

  const exportCsv = () => {
    const headers = ['TAG','System','Pipe','Spool No','Rev','Toplam','İmalat','Montaj','Montaj Tarihi','Montaj Usta','Gün','Açıklama'];
    const rows = isler.map((i) => [i.tag,i.system,i.pipe,i.spoolNo,i.rev,i.toplamSpool,i.imalat,i.montaj,i.montajTarihi,i.montajYapanUsta,i.gun,i.aciklama]);
    const csv = [headers, ...rows].map((r) => r.join(';')).join('\\n');
    const blob = new Blob(['\\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boru_${departman.projeName}.csv`;
    a.click();
  };

  const tone = (item) => {
    if (item.imalat === 0 && item.montaj === 0) return 'bg-red-500/15 border-red-500/40';
    if (item.imalat === 1 && item.montaj === 0) return 'bg-amber-500/15 border-amber-500/40';
    if (item.montaj === 1) return 'bg-emerald-500/15 border-emerald-500/40';
    return 'bg-white/5 border-white/10';
  };

  const renderRow = (item) => {
    const editingRow = editing === item.id;
    const data = editingRow ? form : item;
    return (
      <tr key={item.id} className="border-t border-white/5">
        {['tag','system','pipe','spoolNo','rev'].map((f) => (
          <td key={f}>
            {editingRow ? <input className="input" value={data[f] || ''} onChange={(e) => setForm({ ...data, [f]: e.target.value })} /> : data[f]}
          </td>
        ))}
        <td>{editingRow ? <input className="input" type="number" value={data.toplamSpool || 0} onChange={(e) => setForm({ ...data, toplamSpool: parseInt(e.target.value, 10) || 0 })} /> : data.toplamSpool}</td>
        {['imalat','montaj'].map((f) => (
          <td key={f} className="text-center">
            {editingRow ? (
              <select className="input" value={data[f]} onChange={(e) => setForm({ ...data, [f]: parseInt(e.target.value, 10) })}>
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            ) : (
              <button className={`chip ${f === 'imalat' ? 'bg-amber-500/15 text-amber-100' : 'bg-emerald-500/15 text-emerald-100'}`} onClick={() => handleQuick(item, f)}>
                {data[f]}
              </button>
            )}
          </td>
        ))}
        <td>{editingRow ? <input className="input" type="date" value={data.montajTarihi || ''} onChange={(e) => setForm({ ...data, montajTarihi: e.target.value })} /> : data.montajTarihi}</td>
        <td>
          {editingRow ? (
            <select className="input" value={data.montajYapanUsta || ''} onChange={(e) => setForm({ ...data, montajYapanUsta: e.target.value })}>
              <option value="">Seçiniz</option>
              {ustalar.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          ) : data.montajYapanUsta}
        </td>
        <td>{editingRow ? <input className="input" value={data.gun || ''} onChange={(e) => setForm({ ...data, gun: e.target.value })} /> : data.gun}</td>
        <td>{editingRow ? <input className="input" value={data.aciklama || ''} onChange={(e) => setForm({ ...data, aciklama: e.target.value })} /> : data.aciklama}</td>
        <td className="text-right">
          {editingRow ? (
            <div className="flex gap-1 justify-end">
              <button className="chip bg-emerald-500/15 text-emerald-100" onClick={saveEdit}><Save className="w-4 h-4" /></button>
              <button className="chip bg-slate-500/15 text-slate-100" onClick={() => { setEditing(null); setForm(blank); }}><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex gap-1 justify-end">
              <button className="chip bg-blue-500/15 text-blue-100" onClick={() => { setEditing(item.id); setForm(item); }}><Edit2 className="w-4 h-4" /></button>
              <button className="chip bg-red-500/15 text-red-100" onClick={() => remove(item.id)}><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  const handleQuick = async (item, field) => {
    await updateBoruIs(item.id, { [field]: item[field] === 1 ? 0 : 1 });
    load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-400/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg relative p-6 lg:p-10">
      <div className="panel rounded-3xl border border-white/10 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Link to="/" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 text-slate-200" />
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Boru · Spool</p>
              <h2 className="text-3xl font-bold text-white">{departman.tersaneName} · Proje {departman.projeName}</h2>
              <p className="text-slate-400 text-sm mt-1">{departman.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="chip bg-white/5 text-slate-200" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" />Yeni Spool</button>
            <button className="chip bg-emerald-500/15 text-emerald-100" onClick={exportCsv}><Download className="w-4 h-4" />CSV</button>
            <button className="chip bg-purple-500/15 text-purple-100" onClick={() => alert(`Toplam spool: ${stats.toplamSpool}`)}><BarChart2 className="w-4 h-4" />Özet</button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="pill bg-white/5 text-slate-200">
            <Filter className="w-4 h-4" />
            <select className="bg-transparent border-none text-white" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Tüm Sistemler</option>
              {uniqueSystem.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <span className="text-sm text-slate-300">Toplam: {filtered.length} kayıt</span>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="badge" style={{ background: 'rgba(248,113,113,0.7)' }} /> İmalat/Montaj yok
            <span className="badge" style={{ background: 'rgba(250,204,21,0.8)' }} /> İmalat tamam
            <span className="badge" style={{ background: 'rgba(74,222,128,0.8)' }} /> Montaj tamam
          </div>
        </div>

        <div className="mt-6 overflow-x-auto panel rounded-2xl border border-white/10">
          <table className="table">
            <thead>
              <tr>
                {['TAG','System','Pipe','Spool','Rev','Toplam','İmalat','Montaj','Montaj Tarihi','Montaj Usta','Gün','Açıklama','İşlem'].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className={tone(row)}>
                  {renderRow(row)}
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="text-center py-10 text-slate-400">Henüz spool kaydı yok.</div>}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel w-full max-w-3xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Yeni Spool</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg bg-white/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['tag','system','pipe','spoolNo','rev','toplamSpool','gun'].map((f) => (
                <div key={f}>
                  <label className="text-sm text-slate-300">{f}</label>
                  <input className="input mt-2" type={f === 'toplamSpool' ? 'number' : 'text'} value={form[f] || ''} onChange={(e) => setForm({ ...form, [f]: f === 'toplamSpool' ? parseInt(e.target.value, 10) || 0 : e.target.value })} />
                </div>
              ))}
              {['imalat','montaj'].map((f) => (
                <div key={f}>
                  <label className="text-sm text-slate-300 capitalize">{f}</label>
                  <select className="input mt-2" value={form[f]} onChange={(e) => setForm({ ...form, [f]: parseInt(e.target.value, 10) })}>
                    <option value={0}>0 - Yapılmadı</option>
                    <option value={1}>1 - Yapıldı</option>
                  </select>
                </div>
              ))}
              <div>
                <label className="text-sm text-slate-300">Montaj Tarihi</label>
                <input className="input mt-2" type="date" value={form.montajTarihi || ''} onChange={(e) => setForm({ ...form, montajTarihi: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-slate-300">Montaj Usta</label>
                <select className="input mt-2" value={form.montajYapanUsta} onChange={(e) => setForm({ ...form, montajYapanUsta: e.target.value })}>
                  <option value="">Seçiniz</option>
                  {ustalar.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-300">Açıklama</label>
                <input className="input mt-2" value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="chip bg-slate-500/15 text-slate-200" onClick={() => setShowAdd(false)}>İptal</button>
              <button className="chip bg-emerald-500/15 text-emerald-100" onClick={submit}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
