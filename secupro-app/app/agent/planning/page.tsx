'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Vacation = {
  id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  poste: string;
  statut: string;
  entreprise_id: string;
};

type Filter = 'all' | 'today' | 'week' | 'month';

const STATUT_STYLE: Record<string, string> = {
  confirmé: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  planifié: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  annulé: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}
function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return d >= startOfWeek && d <= endOfWeek;
}
function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function PlanningPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', heure_debut: '', heure_fin: '', poste: '', statut: 'planifié' });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const id = localStorage.getItem('entreprise_id');
    if (!id) { router.push('/agent'); return; }
    fetchVacations(id);
  }, [router]);

  const fetchVacations = async (entrepriseId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('vacations')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('date', { ascending: true });
    setVacations(data || []);
    setLoading(false);
  };

  const filteredVacations = vacations.filter((v) => {
    if (filter === 'today') return isToday(v.date);
    if (filter === 'week') return isThisWeek(v.date);
    if (filter === 'month') return isThisMonth(v.date);
    return true;
  });

  const handleAdd = async () => {
    if (!form.date || !form.heure_debut || !form.heure_fin || !form.poste) return;
    setSaving(true);
    const entrepriseId = localStorage.getItem('entreprise_id') || '';
    await supabase.from('vacations').insert([{ ...form, entreprise_id: entrepriseId }]);
    setShowForm(false);
    setForm({ date: '', heure_debut: '', heure_fin: '', poste: '', statut: 'planifié' });
    await fetchVacations(entrepriseId);
    setSaving(false);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse font-bold tracking-widest uppercase text-sm">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1F2F] text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-10 pb-4 flex items-start justify-between">
        <div>
          <button onClick={() => router.push('/agent/hub')} className="text-gray-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-1 hover:text-[#00D1FF] transition-colors">
            ← Hub
          </button>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Vos vacations</p>
          <h1 className="text-[#00D1FF] text-3xl font-black tracking-tighter">PLANNING</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-8 bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] text-xs font-black px-4 py-2 rounded-xl uppercase tracking-wider active:scale-95 transition-all"
        >
          + Ajouter
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-6 pb-4 overflow-x-auto">
        {(['all', 'today', 'week', 'month'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
              filter === f
                ? 'bg-[#00D1FF] text-[#0A1F2F] border-[#00D1FF]'
                : 'bg-white/5 text-gray-400 border-white/10 hover:border-[#00D1FF]/40'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'today' ? "Aujourd'hui" : f === 'week' ? 'Cette semaine' : 'Ce mois'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 px-4 pb-10 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest">Chargement...</p>
          </div>
        ) : filteredVacations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3">
            <span className="text-5xl">📅</span>
            <p className="text-gray-500 text-sm">Aucune vacation pour cette période</p>
          </div>
        ) : (
          filteredVacations.map((v) => {
            const statutStyle = STATUT_STYLE[v.statut] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            const dateFormatted = new Date(v.date).toLocaleDateString('fr-FR', {
              weekday: 'short', day: 'numeric', month: 'short',
            });
            return (
              <div
                key={v.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-black text-sm uppercase tracking-wider">{v.poste}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statutStyle}`}>
                    {v.statut}
                  </span>
                </div>
                <p className="text-[#00D1FF] text-xs font-semibold capitalize">{dateFormatted}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {v.heure_debut} → {v.heure_fin}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Add vacation modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-[#0F2535] border border-white/10 rounded-3xl p-6 space-y-4">
            <h2 className="text-white font-black text-lg uppercase tracking-wider">Nouvelle Vacation</h2>

            <div className="space-y-3">
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Poste</label>
                <input
                  type="text"
                  placeholder="Ex: Vigile accueil"
                  value={form.poste}
                  onChange={(e) => setForm({ ...form, poste: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D1FF] transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D1FF] transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Début</label>
                  <input
                    type="time"
                    value={form.heure_debut}
                    onChange={(e) => setForm({ ...form, heure_debut: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D1FF] transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Fin</label>
                  <input
                    type="time"
                    value={form.heure_fin}
                    onChange={(e) => setForm({ ...form, heure_fin: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D1FF] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Statut</label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D1FF] transition-colors"
                >
                  <option value="planifié">Planifié</option>
                  <option value="confirmé">Confirmé</option>
                  <option value="annulé">Annulé</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-wider active:scale-95 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-[#00D1FF] text-[#0A1F2F] text-sm font-black uppercase tracking-wider disabled:opacity-50 active:scale-95 transition-all"
              >
                {saving ? 'Enregistrement...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
