import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import TechizDepartman from './TechizDepartman';
import BoruDepartman from './BoruDepartman';

export default function DepartmanPage() {
  const { id } = useParams();
  const [departman, setDepartman] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'departmanlar', id));
        if (snap.exists()) setDepartman({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-400/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!departman) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        Departman bulunamadı
      </div>
    );
  }

  if (departman.type === 'boru') return <BoruDepartman departman={departman} />;
  return <TechizDepartman departman={departman} />;
}
