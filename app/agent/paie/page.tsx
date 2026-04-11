'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Fiche = {
  id: string;
  mois: string;
  salaire_brut: number | null;
  salaire_net: number | null;
  heures_effectuees: number | null;
  created_at: string;
};

const HEURES_CONTRAT = 151;

function fmt(n: number | null) {
  if (!n) return '—';
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
}

export default function PaiePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mois: '', salaire_brut: '', salaire_net: '', heures_effectuees: '' });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const id = localStorage.getItem('entreprise_id');
    if (!id) { router.push('/agent'); return; }
    fetchFiches(id);
  }, [router]);

  const fetchFiches = async (entrepriseId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('fiches_paie')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('created_at', { ascending: false });
    setFiches(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.mois || !form.salaire_net) return;
    setSaving(true);
    const entrepriseId = localStorage.getItem('entreprise_id') || '';
    await supabase.from('fiches_paie').insert([{
      mois: form.mois,
      salaire_brut: parseFloat(form.salaire_brut) || null,
      salaire_net: parseFloat(form.salaire_net) || null,
      heures_effectuees: parseFloat(form.heures_effectuees) || null,
      entreprise_id: entrepriseId,
    }]);
    setShowForm(false);
    setForm({ mois: '', salaire_brut: '', salaire_net: '', heures_effectuees: '' });
    await fetchFiches(entrepriseId);
    setSaving(false);
  };

  const latest = fiches[0] ?? null;
  const heuresPct = latest?.heures_effectuees
    ? Math.min(100, Math.round((latest.heures_effectuees / HEURES_CONTRAT) * 100))
    : 0;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse font-bold tracking-widest uppercase text-sm">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1F2F] text-white flex flex-col pb-10">
      {/* Header */}
      <div className="px-6 pt-10 pb-4">
        <button onClick={() => router.push('/agent/hub')} className="text-gray-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-1 hover:text-[#00D1FF] transition-colors">
          ← Hub
        </button>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Salaire & Budget</p>
        <h1 className="text-emerald-400 text-3xl font-black tracking-tighter">PAIE</h1>
      </div>

      {/* Hero card */}
      <div className="mx-4 mb-5 rounded-2xl bg-gradient-to-br from-emerald-600/40 to-emerald-900/40 border border-emerald-500/30 backdrop-blur-md p-5 shadow-[0_0_30px_rgba(52,211,153,0.15)]">
        <p className="text-emerald-300/70 text-[11px] uppercase tracking-widest font-bold mb-1">Salaire net estimé</p>
        <p className="text-4xl font-black text-white">{fmt(latest?.salaire_net ?? null)}</p>
        <p className="text-emerald-300/60 text-xs mt-1">Brut : {fmt(latest?.salaire_brut ?? null)}</p>

        {/* Hours progress bar */}
        <div className="mt-4">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${heuresPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-emerald-300/60 mt-1 font-semibold">
            <span>{latest?.heures_effectuees ?? 0}h effectuées</span>
            <span>{HEURES_CONTRAT}h contractuelles</span>
          </div>
        </div>

        {latest?.mois && (
          <p className="text-emerald-300/50 text-[10px] uppercase tracking-widest mt-3 font-bold">{latest.mois}</p>
        )}
      </div>

      {/* Section Historique */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.25em] font-bold">Historique des fiches</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider active:scale-95 transition-all"
          >
            + Ajouter
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-emerald-400 animate-pulse text-sm font-bold tracking-widest">Chargement...</p>
          </div>
        ) : fiches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <span className="text-5xl">💶</span>
            <p className="text-gray-500 text-sm">Aucune fiche de paie</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fiches.map((f) => (
              <div
                key={f.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-wider">{f.mois}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {f.heures_effectuees ? `${f.heures_effectuees}h effectuées` : 'Heures non renseignées'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-black text-base">{fmt(f.salaire_net)}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5">Brut {fmt(f.salaire_brut)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add fiche modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-[#0F2535] border border-white/10 rounded-3xl p-6 space-y-4">
            <h2 className="text-white font-black text-lg uppercase tracking-wider">Nouvelle Fiche</h2>

            <div className="space-y-3">
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Mois</label>
                <input
                  type="text"
                  placeholder="Ex: Mars 2025"
                  value={form.mois}
                  onChange={(e) => setForm({ ...form, mois: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Brut (€)</label>
                  <input
                    type="number"
                    placeholder="2194"
                    value={form.salaire_brut}
                    onChange={(e) => setForm({ ...form, salaire_brut: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Net (€) *</label>
                  <input
                    type="number"
                    placeholder="1847"
                    value={form.salaire_net}
                    onChange={(e) => setForm({ ...form, salaire_net: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Heures effectuées</label>
                <input
                  type="number"
                  placeholder="151"
                  value={form.heures_effectuees}
                  onChange={(e) => setForm({ ...form, heures_effectuees: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                />
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
                disabled={saving || !form.mois || !form.salaire_net}
                className="flex-1 py-3 rounded-xl bg-emerald-400 text-[#0A1F2F] text-sm font-black uppercase tracking-wider disabled:opacity-50 active:scale-95 transition-all"
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
