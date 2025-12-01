import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Download, BarChart2, Filter, Edit2, Trash2, Save, X } from 'lucide-react';
import { getTechizIsler, createTechizIs, updateTechizIs, deleteTechizIs, getUstalar } from '../services/firebaseService';
import { Link } from 'react-router-dom';

const DURUM_OPTIONS = [
  { value: 'BASLANMADI', label: 'BAŞLANMADI', tone: 'bg-red-500/15 text-red-100' },
  { value: 'DEVAM_EDIYOR', label: 'DEVAM EDİYOR', tone: 'bg-yellow-500/15 text-yellow-100' },
  { value: 'FINAL_ASAMASINDA', label: 'FİNAL AŞAMASINDA', tone: 'bg-pink-500/15 text-pink-100' },
  { value: 'TERSANEDEN_BEKLENIYOR', label: 'TERSANEDEN BEKLENİYOR', tone: 'bg-cyan-500/15 text-cyan-100' },
  { value: 'TAMAMLANDI', label: 'TAMAMLANDI', tone: 'bg-emerald-500/15 text-emerald-100' },
  { value: 'NA', label: 'N/A', tone: 'bg-slate-500/15 text-slate-100' },
];

const blank = {
  seri: '',
  proje: '',
  mahal: '',
  tanim: '',
  altBaslik: '',
  uretimDurumu: 'BASLANMADI',
  montajDurumu: 'BASLANMADI',
  kaynakDurumu: 'BASLANMADI',
  isBaslangic: '',
  isBitis: '',
  ustaIsmi: '',
  aciklama: '',
};

export default function TechizDepartman({ departman }) {
  const [isler, setIsler] = useState([]);
  const [ustalar, setUstalar] = useState([]);
  const [filter, setFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...blank, seri: departman.tersaneName, proje: departman.projeName });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [departman.id]);

  const load = async () => {
    setLoading(true);
    setForm((f) => ({ ...f, seri: departman.tersaneName, proje: departman.projeName }));
    setIsler(await getTechizIsler(departman.id));
    setUstalar(await getUstalar());
    setLoading(false);
  };

  const submit = async () => {
    await createTechizIs({ ...form, departmanId: departman.id });
    setShowAdd(false);
    setForm({ ...blank, seri: departman.tersaneName, proje: departman.projeName });
    load();
  };

  const saveEdit = async () => {
    await updateTechizIs(editing, form);
    setEditing(null);
    setForm({ ...blank, seri: departman.tersaneName, proje: departman.projeName });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Silmek istiyor musunuz?')) return;
    await deleteTechizIs(id);
    load();
  };

  const stats = useMemo(() => {
    const total = isler.length;
    const counters = DURUM_OPTIONS.reduce((acc, d) => ({ ...acc, [d.value]: 0 }), {});
    isler.forEach((i) => { counters[i.uretimDurumu] = (counters[i.uretimDurumu] || 0) + 1; });
    return { total, counters };
  }, [isler]);

  const filtered = filter ? isler.filter((i) => i.mahal === filter) : isler;
  const uniqueMahal = [...new Set(isler.map((i) => i.mahal).filter(Boolean))];

  const exportCsv = () => {
    const headers = ['Seri','Proje','Mahal','Tanım','Alt Başlık','Üretim','Montaj','Kaynak','Başlangıç','Bitiş','Usta','Açıklama'];
    const rows = isler.map((i) => [
      i.seri, i.proje, i.mahal, i.tanim, i.altBaslik,
      i.uretimDurumu, i.montajDurumu, i.kaynakDurumu,
      i.isBaslangic, i.isBitis, i.ustaIsmi, i.aciklama,
    ]);
    const csv = [headers, ...rows].map(r => r.join(';')).join('\\n');
    const blob = new Blob(['\\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techiz_${departman.projeName}.csv`;
    a.click();
  };

  const renderRow = (item) => {
    const editingRow = editing === item.id;
    const data = editingRow ? form : item;
    return (
      <tr key={item.id}>
        {['seri','proje','mahal','tanim','altBaslik'].map((f) => (
          <td key={f} className="border-t border-white/5">
            {editingRow ? (
              <input className="input" value={data[f] || ''} onChange={(e) => setForm({ ...data, [f]: e.target.value })} />
            ) : data[f]}
          </td>
        ))}
        {['uretimDurumu','montajDurumu','kaynakDurumu'].map((f) => (
          <td key={f} className="border-t border-white/5">
            {editingRow ? (
              <select className="input" value={data[f]} onChange={(e) => setForm({ ...data, [f]: e.target.value })}>
                {DURUM_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            ) : (
              <span className={`chip ${DURUM_OPTIONS.find((d) => d.value === data[f])?.tone || ''}`}>{DURUM_OPTIONS.find((d) => d.value === data[f])?.label}</span>
            )}
          </td>
        ))}
        {['isBaslangic','isBitis','ustaIsmi','aciklama'].map((f) => (
          <td key={f} className="border-t border-white/5">
            {editingRow ? (
              f === 'ustaIsmi' ? (
                <select className="input" value={data[f] || ''} onChange={(e) => setForm({ ...data, ustaIsmi: e.target.value })}>
                  <option value="">Seçiniz</option>
                  {ustalar.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              ) : (
                <input className="input" type={f.includes('is') ? 'date' : 'text'} value={data[f] || ''} onChange={(e) => setForm({ ...data, [f]: e.target.value })} />
              )
            ) : data[f]}
          </td>
        ))}
        <td className="border-t border-white/5 text-right">
          {editingRow ? (
            <div className="flex gap-1 justify-end">
              <button className="chip bg-emerald-500/15 text-emerald-200" onClick={saveEdit}><Save className="w-4 h-4" /></button>
              <button className="chip bg-slate-500/15 text-slate-200" onClick={() => { setEditing(null); setForm({ ...blank, seri: departman.tersaneName, proje: departman.projeName }); }}><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex gap-1 justify-end">
              <button className="chip bg-blue-500/15 text-blue-200" onClick={() => { setEditing(item.id); setForm(item); }}><Edit2 className="w-4 h-4" /></button>
              <button className="chip bg-red-500/15 text-red-200" onClick={() => remove(item.id)}><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        </td>
      </tr>
    );
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
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Teçhiz</p>
              <h2 className="text-3xl font-bold text-white">{departman.tersaneName} · Proje {departman.projeName}</h2>
              <p className="text-slate-400 text-sm mt-1">{departman.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="chip bg-white/5 text-slate-200" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" />Yeni İş</button>
            <button className="chip bg-emerald-500/15 text-emerald-100" onClick={exportCsv}><Download className="w-4 h-4" />CSV</button>
            <button className="chip bg-purple-500/15 text-purple-100" onClick={() => alert(`Toplam iş: ${stats.total}`)}><BarChart2 className="w-4 h-4" />Özet</button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="pill bg-white/5 text-slate-200">
            <Filter className="w-4 h-4" />
            <select className="bg-transparent border-none text-white" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Tüm Mahaller</option>
              {uniqueMahal.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <span className="text-sm text-slate-300">Toplam: {filtered.length} kayıt</span>
        </div>

        <div className="mt-6 overflow-x-auto panel rounded-2xl border border-white/10">
          <table className="table">
            <thead>
              <tr>
                {['Seri','Proje','Mahal','Tanım','Alt Başlık','Üretim','Montaj','Kaynak','Başlangıç','Bitiş','Usta','Açıklama','İşlem'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(renderRow)}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="text-center py-10 text-slate-400">Henüz kayıt yok.</div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel w-full max-w-3xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Yeni İş</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg bg-white/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['seri','proje','mahal','tanim','altBaslik','isBaslangic','isBitis'].map((f) => (
                <div key={f}>
                  <label className="text-sm text-slate-300 capitalize">{f}</label>
                  <input className="input mt-2" type={f.includes('is') ? 'date' : 'text'} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
                </div>
              ))}
              {['uretimDurumu','montajDurumu','kaynakDurumu'].map((f) => (
                <div key={f}>
                  <label className="text-sm text-slate-300 capitalize">{f}</label>
                  <select className="input mt-2" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}>
                    {DURUM_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="text-sm text-slate-300">Usta</label>
                <select className="input mt-2" value={form.ustaIsmi} onChange={(e) => setForm({ ...form, ustaIsmi: e.target.value })}>
                  <option value="">Seçiniz</option>
                  {ustalar.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-300">Açıklama</label>
                <textarea className="input mt-2" value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} />
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
