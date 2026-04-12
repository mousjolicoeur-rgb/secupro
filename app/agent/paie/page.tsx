'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download, Trash2, Upload, X,
  CheckCircle, AlertCircle, Loader2, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Fiche = {
  id: string;
  mois: string | null;
  salaire_net: number | null;
  heures_effectuees: number | null;
  acomptes: number | null;
  retenues: number | null;
  conges_pris: number | null;
  conges_restants: number | null;
  file_path: string | null;
  file_url: string | null;
  ocr_status: string | null;
  entreprise_id: string | null;
  created_at: string;
};

type OcrResult = {
  file_path: string;
  file_url: string;
  extracted: {
    mois?: string | null;
    salaire_brut?: number | null;
    salaire_net?: number | null;
    acompte?: number | null;
    retenues?: number | null;
    heures_travaillees?: number | null;
    conges_pris?: number | null;
    conges_restant?: number | null;
  };
};

function eur(n: number | null | undefined) {
  if (n == null) return '—';
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
}
function num(n: number | null | undefined) {
  if (n == null) return '—';
  return String(n);
}

/** Returns true if OCR ran but most key fields are empty */
function isPartialOcr(ex: OcrResult['extracted']): boolean {
  const filled = [ex.mois, ex.salaire_net, ex.retenues, ex.heures_travaillees]
    .filter((v) => v != null && v !== '').length;
  return filled < 2;
}

const EMTPY_FORM = {
  mois: '', salaire_net: '',
  acompte: '', retenues: '', heures_travaillees: '',
  conges_pris: '', conges_restant: '',
};

export default function PaiePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [entrepriseId, setEntrepriseId] = useState<string | null>(null);
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Upload / OCR modal
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrState, setOcrState] = useState<'idle' | 'uploading' | 'ocr' | 'done' | 'partial' | 'error'>('idle');
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrError, setOcrError] = useState('');
  const [form, setForm] = useState(EMTPY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // History toggle
  const [showHistory, setShowHistory] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Fiche | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch fiches ────────────────────────────────────────────────────────────
  const fetchFiches = useCallback(async (id: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('fiches_paie')
        .select('*')
        .eq('entreprise_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFiches((data as Fiche[]) || []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Impossible de charger les fiches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = localStorage.getItem('entreprise_id');
    if (!id) { router.push('/agent'); return; }
    setEntrepriseId(id);
    fetchFiches(id);
  }, [router, fetchFiches]);

  // ── Reset & cleanup modal state ─────────────────────────────────────────────
  const resetModal = () => {
    setShowUpload(false);
    setSelectedFile(null);
    setOcrState('idle');
    setOcrResult(null);
    setOcrError('');
    setSaveError(null);
    setForm(EMTPY_FORM);
    // Clear file input so same file can be re-selected
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── File selected ───────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setOcrState('idle');
    setOcrResult(null);
    setOcrError('');
    setSaveError(null);
    setForm(EMTPY_FORM);
  };

  // ── Launch OCR ──────────────────────────────────────────────────────────────
  const launchOcr = async () => {
    if (!selectedFile) return;
    setOcrState('uploading');
    setOcrError('');
    setSaveError(null);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('userId', entrepriseId ?? 'unknown');

      setOcrState('ocr');
      const res = await fetch('/api/paie/ocr', { method: 'POST', body: fd });

      if (!res.ok) {
        let msg = 'Erreur serveur';
        try { const j = await res.json(); msg = j.error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }

      const result: OcrResult = await res.json();
      setOcrResult(result);

      const ex = result.extracted ?? {};
      setForm({
        mois: ex.mois ?? '',
        salaire_net: ex.salaire_net != null ? String(ex.salaire_net) : '',
        acompte: ex.acompte != null ? String(ex.acompte) : '',
        retenues: ex.retenues != null ? String(ex.retenues) : '',
        heures_travaillees: ex.heures_travaillees != null ? String(ex.heures_travaillees) : '',
        conges_pris: ex.conges_pris != null ? String(ex.conges_pris) : '',
        conges_restant: ex.conges_restant != null ? String(ex.conges_restant) : '',
      });

      // Detect partial extraction (illisible / mauvais scan)
      setOcrState(isPartialOcr(ex) ? 'partial' : 'done');
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : 'Erreur inconnue');
      setOcrState('error');
    }
  };

  // ── Save fiche ──────────────────────────────────────────────────────────────
  const saveFiche = async () => {
    if (!entrepriseId || !form.mois) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const clean = (v: string) => v.trim().replace(',', '.');
      const toFloat = (v: string) => v.trim() ? parseFloat(clean(v)) : null;
      const toInt   = (v: string) => v.trim() ? parseInt(clean(v), 10) : null;

      const payload: Record<string, unknown> = {
        user_id:           user.id,
        entreprise_id:     entrepriseId,
        mois:              form.mois.trim(),
        salaire_net:       toFloat(form.salaire_net),
        heures_effectuees: toFloat(form.heures_travaillees),
        acomptes:          toFloat(form.acompte),
        retenues:          toFloat(form.retenues),
        conges_pris:       toInt(form.conges_pris),
        conges_restants:   toInt(form.conges_restant),
        file_path:         ocrResult?.file_path ?? null,
        file_url:          ocrResult?.file_url ?? null,
        ocr_status:        ocrResult ? (ocrState === 'partial' ? 'partial' : 'done') : 'manual',
      };

      console.log('[saveFiche] payload →', payload);
      const { error } = await supabase.from('fiches_paie').insert([payload]);
      if (error) throw error;

      resetModal();
      await fetchFiches(entrepriseId);
    } catch (err) {
      console.error('[saveFiche] erreur →', err);
      setSaveError(err instanceof Error ? err.message : 'Impossible d\'enregistrer');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete fiche ────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget || !entrepriseId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('fiches_paie').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setDeleteTarget(null);
      await fetchFiches(entrepriseId);
    } catch {
      // Non-blocking: just close modal, list will refresh
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const latest = fiches[0] ?? null;
  const HEURES_CONTRAT = 151;
  const heuresPct = latest?.heures_effectuees
    ? Math.min(100, Math.round((latest.heures_effectuees / HEURES_CONTRAT) * 100))
    : 0;

  // ── Show fields panel for: done, partial, or error (manual entry fallback) ──
  const showFields = ocrState === 'done' || ocrState === 'partial' || ocrState === 'error';

  return (
    <div className="min-h-screen bg-[#050A12] text-white flex flex-col pb-10">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <button
          onClick={() => router.push('/agent/hub')}
          className="text-slate-500 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-1 hover:text-emerald-400 transition-colors"
        >
          ← Hub
        </button>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Salaire & Budget</p>
        <h1 className="text-emerald-400 text-3xl font-black tracking-tighter">PAIE</h1>
      </div>

      {/* Hero card */}
      <div className="mx-4 mb-5 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-emerald-900/30 border border-emerald-500/25 p-5 shadow-[0_0_30px_rgba(52,211,153,0.12)]">
        <p className="text-emerald-300/60 text-[10px] uppercase tracking-widest font-bold mb-1">Dernier salaire net</p>
        <p className="text-4xl font-black text-white">{eur(latest?.salaire_net)}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-emerald-300/50 font-semibold">
          {latest?.acomptes ? <span>Acompte : {eur(latest.acomptes)}</span> : null}
          {latest?.retenues ? <span>Retenues : {eur(latest.retenues)}</span> : null}
        </div>
        <div className="mt-4">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${heuresPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-emerald-300/50 mt-1 font-semibold">
            <span>{latest?.heures_effectuees ?? 0}h effectuées</span>
            <span>{HEURES_CONTRAT}h contractuelles</span>
          </div>
        </div>
        {latest?.conges_restants != null && (
          <p className="mt-3 text-[10px] text-emerald-300/50 font-bold uppercase tracking-widest">
            Congés restants : <span className="text-emerald-300">{latest.conges_restants} j</span>
            {latest.conges_pris != null
              ? <span className="ml-2 text-slate-500">· Pris : {latest.conges_pris} j</span>
              : null}
          </p>
        )}
      </div>

      {/* ── Deux boutons d'action principaux ─────────────────────────────────── */}
      <div className="px-4 mb-6 space-y-3">
        {/* BOUTON 1 — AJOUTER */}
        <button
          onClick={() => { resetModal(); setShowUpload(true); }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-[#00d1ff]/30 bg-[#00d1ff]/[0.07] text-[#00d1ff] font-black text-sm uppercase tracking-[0.18em] transition-all active:scale-[0.98] hover:bg-[#00d1ff]/[0.12] hover:border-[#00d1ff]/60"
          style={{ boxShadow: '0 0 18px rgba(0,209,255,0.12)' }}
        >
          <Upload size={16} strokeWidth={2.5} />
          AJOUTER
        </button>

        {/* BOUTON 2 — CONSULTER L'HISTORIQUE */}
        <button
          onClick={() => setShowHistory((v) => !v)}
          className={[
            'w-full flex items-center justify-center gap-3 py-5 rounded-2xl border font-black text-sm uppercase tracking-[0.12em] transition-all active:scale-[0.98]',
            showHistory
              ? 'border-[#00d1ff]/50 bg-[#00d1ff]/[0.10] text-[#00d1ff]'
              : 'border-[#00d1ff]/20 bg-[#00d1ff]/[0.04] text-[#00d1ff]/70 hover:border-[#00d1ff]/40 hover:text-[#00d1ff] hover:bg-[#00d1ff]/[0.07]',
          ].join(' ')}
          style={showHistory ? { boxShadow: '0 0 28px rgba(0,209,255,0.18)' } : {}}
        >
          CONSULTER L&apos;HISTORIQUE DES FICHES ANALYSÉES PAR L&apos;IA
        </button>
      </div>

      {/* Section historique (masquée jusqu'au clic) */}
      {showHistory && <div className="px-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-bold mb-4">Historique des fiches</p>

        {/* Loading spinner */}
        {loading && (
          <div className="flex items-center justify-center h-32 gap-3">
            <Loader2 className="text-emerald-400 animate-spin" size={20} />
            <p className="text-emerald-400 text-sm font-bold tracking-widest">Chargement...</p>
          </div>
        )}

        {/* Fetch error */}
        {!loading && fetchError && (
          <div className="flex flex-col items-center gap-4 h-40 justify-center">
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={16} />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={() => entrepriseId && fetchFiches(entrepriseId)}
              className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              <RefreshCw size={12} /> Réessayer
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && fiches.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <span className="text-5xl opacity-30">💶</span>
            <p className="text-slate-500 text-sm">Aucune fiche de paie</p>
            <button
              onClick={() => { resetModal(); setShowUpload(true); }}
              className="text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/30 px-4 py-2 rounded-xl active:scale-95 transition-all"
            >
              + Uploader une fiche
            </button>
          </div>
        )}

        {/* Fiches list */}
        {!loading && !fetchError && fiches.length > 0 && (
          <>
            {/* Table header (desktop) */}
            <div className="hidden sm:grid grid-cols-[1.8fr_1.2fr_1fr_1fr_0.8fr_1fr_auto] gap-2 px-3 mb-2">
              {['MOIS', 'NET', 'ACOMPTE', 'RETENUES', 'HEURES', 'CONGÉS', ''].map((h) => (
                <span key={h} className="text-[9px] font-black uppercase tracking-widest text-slate-600">{h}</span>
              ))}
            </div>

            <div className="space-y-2">
              {fiches.map((f) => (
                <div
                  key={f.id}
                  className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3 hover:border-emerald-500/20 transition-colors"
                >
                  {/* Mobile */}
                  <div className="sm:hidden flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white font-black text-sm uppercase tracking-wider">{f.mois ?? '—'}</p>
                      <p className="text-emerald-400 font-black text-base mt-0.5">{eur(f.salaire_net)}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        {f.acomptes ? <span className="text-slate-400 text-[10px]">Acompte {eur(f.acomptes)}</span> : null}
                        {f.retenues ? <span className="text-slate-400 text-[10px]">Retenues {eur(f.retenues)}</span> : null}
                        {f.heures_effectuees ? <span className="text-slate-400 text-[10px]">{f.heures_effectuees}h</span> : null}
                        {f.conges_restants != null
                          ? <span className="text-slate-400 text-[10px]">Congés {f.conges_pris ?? 0}j / {f.conges_restants}j rest.</span>
                          : null}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {f.file_url && (
                        <a href={f.file_url} target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="Télécharger le PDF original">
                          <Download size={14} />
                        </a>
                      )}
                      <button onClick={() => setDeleteTarget(f)}
                        className="p-2 rounded-xl border border-red-500/20 text-red-400/70 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden sm:grid grid-cols-[1.8fr_1.2fr_1fr_1fr_0.8fr_1fr_auto] gap-2 items-center">
                    <div>
                      <p className="text-white font-black text-sm uppercase tracking-wide">{f.mois ?? '—'}</p>
                      {f.ocr_status === 'done' && (
                        <span className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-widest">IA OCR</span>
                      )}
                      {f.ocr_status === 'partial' && (
                        <span className="text-[9px] text-amber-500/70 font-bold uppercase tracking-widest">OCR partiel</span>
                      )}
                    </div>
                    <p className="text-emerald-400 font-black text-sm">{eur(f.salaire_net)}</p>
                    <p className="text-slate-300 text-sm">{eur(f.acomptes)}</p>
                    <p className="text-slate-300 text-sm">{eur(f.retenues)}</p>
                    <p className="text-slate-300 text-sm">{num(f.heures_effectuees)}h</p>
                    <p className="text-slate-300 text-xs">
                      {f.conges_pris != null || f.conges_restants != null
                        ? `${f.conges_pris ?? 0}j · ${f.conges_restants ?? '—'}j rest.`
                        : '—'}
                    </p>
                    <div className="flex gap-1.5 justify-end">
                      {f.file_url && (
                        <a href={f.file_url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="Télécharger le PDF original">
                          <Download size={13} />
                        </a>
                      )}
                      <button onClick={() => setDeleteTarget(f)}
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-400/60 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>}

      {/* ── AI tip badge ─────────────────────────────────────────────────────── */}
      <div className="flex justify-center px-4 pt-4 pb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00d1ff]/20 bg-[#00d1ff]/[0.04]"
          style={{ boxShadow: '0 0 14px rgba(0,209,255,0.08)' }}>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#00d1ff]">Optimisation IA</span>
          <span className="w-px h-3 bg-white/10 shrink-0" />
          <span className="text-[10px] text-slate-400">Privilégiez des fichiers de moins de 2 Mo pour une consultation instantanée.</span>
        </div>
      </div>

      {/* ── Upload / OCR Modal ───────────────────────────────────────────────── */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#0A1520] border border-white/10 rounded-3xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-black text-lg uppercase tracking-wider">Nouvelle Fiche de Paie</h2>
              <button onClick={resetModal} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* File drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-emerald-500/30 rounded-2xl p-5 text-center hover:border-emerald-500/60 transition-colors"
            >
              <Upload className="mx-auto mb-2 text-emerald-400/60" size={26} />
              {selectedFile ? (
                <p className="text-white text-sm font-bold truncate px-2">{selectedFile.name}</p>
              ) : (
                <>
                  <p className="text-slate-400 text-sm">Cliquer pour choisir un fichier</p>
                  <p className="text-slate-600 text-xs mt-1">PDF, JPG ou PNG · Max 10 Mo</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* OCR launch button */}
            {selectedFile && ocrState === 'idle' && (
              <div className="space-y-2">
                <button
                  onClick={launchOcr}
                  className="w-full py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all hover:bg-emerald-500/25"
                >
                  Analyser avec l&apos;IA (OCR)
                </button>
                <button
                  onClick={() => setOcrState('done')}
                  className="w-full text-slate-500 text-xs font-bold uppercase tracking-widest py-2 hover:text-slate-300 transition-colors"
                >
                  Saisir manuellement
                </button>
              </div>
            )}

            {/* Spinner during OCR */}
            {(ocrState === 'uploading' || ocrState === 'ocr') && (
              <div className="flex items-center justify-center gap-3 py-4">
                <Loader2 className="text-emerald-400 animate-spin" size={20} />
                <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest">
                  {ocrState === 'uploading' ? 'Envoi du fichier...' : 'Analyse IA en cours...'}
                </p>
              </div>
            )}

            {/* ── Partial OCR warning ── */}
            {ocrState === 'partial' && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
                <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-300 text-xs font-bold leading-relaxed">
                  Analyse partielle — Veuillez vérifier les champs manuellement
                </p>
              </div>
            )}

            {/* ── Success banner ── */}
            {ocrState === 'done' && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <CheckCircle size={14} />
                Données extraites — Vérifiez et corrigez si besoin
              </div>
            )}

            {/* ── OCR error banner (still allow manual entry) ── */}
            {ocrState === 'error' && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-xs font-bold">Analyse impossible — {ocrError}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Le fichier a été sauvegardé. Saisissez les champs manuellement.
                  </p>
                </div>
              </div>
            )}

            {/* Editable fields (done, partial, or error) */}
            {showFields && (
              <>
                <div className="space-y-3">
                  {/* MOIS — pleine largeur */}
                  <div>
                    <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">
                      Mois *
                    </label>
                    <input
                      type="text"
                      placeholder="Avril 2026"
                      value={form.mois}
                      onChange={(e) => setForm({ ...form, mois: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  {/* Ligne 1 — Salaire net | Heures travaillées */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">
                        Salaire net (€)
                      </label>
                      <input
                        type="number"
                        placeholder="1847"
                        value={form.salaire_net}
                        onChange={(e) => setForm({ ...form, salaire_net: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">
                        Heures travaillées
                      </label>
                      <input
                        type="number"
                        placeholder="151"
                        value={form.heures_travaillees}
                        onChange={(e) => setForm({ ...form, heures_travaillees: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Ligne 2 — Acompte | Retenues */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">
                        Acompte (€)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.acompte}
                        onChange={(e) => setForm({ ...form, acompte: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">
                        Retenues (€)
                      </label>
                      <input
                        type="number"
                        placeholder="347"
                        value={form.retenues}
                        onChange={(e) => setForm({ ...form, retenues: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Ligne 3 — Congés pris | Congés restants */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">
                        Congés pris (j)
                      </label>
                      <input
                        type="number"
                        placeholder="2"
                        value={form.conges_pris}
                        onChange={(e) => setForm({ ...form, conges_pris: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">
                        Congés restants (j)
                      </label>
                      <input
                        type="number"
                        placeholder="18"
                        value={form.conges_restant}
                        onChange={(e) => setForm({ ...form, conges_restant: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Save error */}
                {saveError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <p className="text-red-400 text-xs">{saveError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={resetModal}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-bold uppercase tracking-wider active:scale-95 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveFiche}
                    disabled={saving || !form.mois}
                    className="flex-1 py-3 rounded-xl bg-emerald-400 text-[#050A12] text-sm font-black uppercase tracking-wider disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {saving ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Enregistrement...</span> : 'Enregistrer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xs bg-[#0A1520] border border-red-500/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 className="text-red-400" size={18} />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-wide">Supprimer la fiche ?</p>
                <p className="text-slate-500 text-xs mt-0.5">{deleteTarget.mois ?? 'Fiche sans date'}</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-bold uppercase active:scale-95 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500/80 text-white text-sm font-black uppercase tracking-wide disabled:opacity-50 active:scale-95 transition-all"
              >
                {deleting
                  ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" />...</span>
                  : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
