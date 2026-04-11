'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Document = {
  id: string;
  nom: string;
  type: string;
  url: string;
  expiration: string | null;
  created_at: string;
};

const TYPE_STYLE: Record<string, { label: string; color: string; icon: string }> = {
  carte_pro: { label: 'Carte Pro CNAPS', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30', icon: '🪪' },
  diplome: { label: 'Diplôme / SST', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', icon: '🎓' },
  contrat: { label: 'Contrat', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: '📄' },
  autre: { label: 'Autre', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30', icon: '📎' },
};

function isExpiringSoon(dateStr: string | null) {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 60; // < 60 jours
}

function isExpired(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

export default function DocsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', type: 'carte_pro', expiration: '' });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const id = localStorage.getItem('entreprise_id');
    if (!id) { router.push('/agent'); return; }
    fetchDocs(id);
  }, [router]);

  const fetchDocs = async (entrepriseId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('created_at', { ascending: false });
    setDocs(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.nom) return;
    setSaving(true);
    const entrepriseId = localStorage.getItem('entreprise_id') || '';
    await supabase.from('documents').insert([{
      nom: form.nom,
      type: form.type,
      expiration: form.expiration || null,
      entreprise_id: entrepriseId,
      url: '',
    }]);
    setShowForm(false);
    setForm({ nom: '', type: 'carte_pro', expiration: '' });
    await fetchDocs(entrepriseId);
    setSaving(false);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1F2F] text-white flex flex-col pb-10">
      {/* Header */}
      <div className="px-6 pt-10 pb-4">
        <button onClick={() => router.push('/agent/hub')} className="text-gray-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-1 hover:text-violet-400 transition-colors">
          ← Hub
        </button>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Certifications & Cartes</p>
        <h1 className="text-violet-400 text-3xl font-black tracking-tighter">ESPACE PRO</h1>
      </div>

      {/* Alert expiry banner */}
      {docs.some(d => isExpiringSoon(d.expiration) || isExpired(d.expiration)) && (
        <div className="mx-4 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-amber-300 text-xs font-bold">
            Un ou plusieurs documents arrivent à expiration. Pensez à les renouveler.
          </p>
        </div>
      )}

      {/* List */}
      <div className="px-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.25em] font-bold">Mes documents</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider active:scale-95 transition-all"
          >
            + Ajouter
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3">
            <span className="text-5xl">📂</span>
            <p className="text-gray-500 text-sm text-center">Aucun document ajouté</p>
            <p className="text-gray-600 text-xs text-center">Ajoutez votre Carte Pro CNAPS,<br/>diplômes ou contrats</p>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map((d) => {
              const meta = TYPE_STYLE[d.type] || TYPE_STYLE.autre;
              const expired = isExpired(d.expiration);
              const expiring = isExpiringSoon(d.expiration);
              return (
                <div key={d.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta.icon}</span>
                      <p className="text-white font-black text-sm">{d.nom}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                  {d.expiration && (
                    <p className={`text-xs font-semibold mt-1 ${expired ? 'text-red-400' : expiring ? 'text-amber-400' : 'text-gray-500'}`}>
                      {expired ? '⛔ Expiré le' : expiring ? '⚠️ Expire le' : 'Validité jusqu\'au'}{' '}
                      {new Date(d.expiration).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add doc modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-[#0F2535] border border-white/10 rounded-3xl p-6 space-y-4">
            <h2 className="text-white font-black text-lg uppercase tracking-wider">Nouveau Document</h2>
            <div className="space-y-3">
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Nom du document</label>
                <input
                  type="text"
                  placeholder="Ex: Carte Pro — DUPONT Jean"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-400 transition-colors"
                >
                  <option value="carte_pro">Carte Pro CNAPS</option>
                  <option value="diplome">Diplôme / SST</option>
                  <option value="contrat">Contrat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Date d'expiration (optionnel)</label>
                <input
                  type="date"
                  value={form.expiration}
                  onChange={(e) => setForm({ ...form, expiration: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-400 transition-colors"
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
                disabled={saving || !form.nom}
                className="flex-1 py-3 rounded-xl bg-violet-400 text-[#0A1F2F] text-sm font-black uppercase tracking-wider disabled:opacity-50 active:scale-95 transition-all"
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
