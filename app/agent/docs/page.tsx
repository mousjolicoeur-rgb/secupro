'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye, Download, Trash2, X, ZoomIn, ZoomOut,
  Loader2, Upload, AlertCircle, WifiOff, CheckCircle, AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────
type Doc = {
  id: string;
  nom: string;
  type: string;
  url: string;
  expiration: string | null;
  created_at: string;
  agent_id: string;
};

type OcrStatus = 'idle' | 'compressing' | 'scanning' | 'done' | 'failed';

// ─── Zone config ──────────────────────────────────────────────────────────────
const ZONES = [
  { key: 'cni',       label: "CNI / TITRE DE SÉJOUR",   icon: '🪪', accent: '#3B82F6', ringCls: 'border-blue-500/30',    badgeCls: 'text-blue-300 bg-blue-500/10 border-blue-500/25' },
  { key: 'carte_pro', label: 'CARTE PRO CNAPS',          icon: '🔰', accent: '#3B82F6', ringCls: 'border-blue-500/30', badgeCls: 'text-blue-300 bg-blue-500/10 border-blue-500/25' },
  { key: 'sst',       label: 'SST / HABILITATION',       icon: '🎓', accent: '#3B82F6', ringCls: 'border-blue-500/30', badgeCls: 'text-blue-300 bg-blue-500/10 border-blue-500/25' },
  { key: 'autre',     label: 'AUTRES DOCUMENTS',          icon: '📎', accent: '#3B82F6', ringCls: 'border-blue-500/30',  badgeCls: 'text-blue-300 bg-blue-500/10 border-blue-500/25' },
] as const;

type ZoneKey = (typeof ZONES)[number]['key'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CACHE = 'secupro-docs-v1';
const MAX_MB = 10;

function isPdf(url: string) { return /\.pdf($|\?)/i.test(url); }
function isImg(url: string) { return /\.(jpe?g|png|webp|gif)($|\?)/i.test(url); }

function isExpired(d: string | null)      { return !!d && new Date(d).getTime() < Date.now(); }
function isExpiringSoon(d: string | null, isCnaps = false) {
  if (!d) return false;
  const diff = new Date(d).getTime() - Date.now();
  const threshold = isCnaps ? 90 : 30; // 90 jours pour CNAPS, 30 jours pour le reste
  return diff > 0 && diff < 86_400_000 * threshold;
}

/** Try to find a DD/MM/YYYY or YYYY-MM-DD date in OCR text */
function extractExpiry(text: string): string | null {
  // Prioritise dates near expiry keywords
  const clean = text.replace(/\n/g, ' ');
  const keywordMatch = clean.match(
    /(?:valide?\s+jusqu[''']?au|expir[ae]|date\s+de\s+validit[eé]|validit[eé]|fin\s+de\s+validit[eé]|date\s+limite)[^\d]*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i,
  );
  const raw = keywordMatch?.[1] ?? clean.match(/(\d{2}[\/\-.]\d{2}[\/\-.]\d{4})/)?.[1];
  if (!raw) return null;

  const sep = raw.includes('/') ? '/' : raw.includes('-') ? '-' : '.';
  const parts = raw.split(sep);
  if (parts.length !== 3) return null;

  let [a, b, c] = parts;
  // Detect YYYY-MM-DD vs DD/MM/YYYY
  if (a.length === 4) {
    // Already ISO-ish: YYYY-MM-DD
    const d = new Date(`${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  // DD/MM/YYYY → YYYY-MM-DD
  if (c.length === 2) c = (parseInt(c) > 50 ? '19' : '20') + c;
  const d = new Date(`${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Compress image client-side via dynamic import */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  try {
    const mod = await import('browser-image-compression');
    const compress = mod.default;
    return await compress(file, { maxSizeMB: 2, maxWidthOrHeight: 2048, useWebWorker: true });
  } catch { return file; }
}

/** Extract text from PDF using pdfjs-dist (embedded text, no OCR needed) */
async function extractPdfText(file: File): Promise<string> {
  try {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    const ab  = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: ab }).promise;
    let text = '';
    for (let i = 1; i <= Math.min(pdf.numPages, 4); i++) {
      const page    = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => ('str' in it ? (it as { str: string }).str : '')).join(' ') + ' ';
    }
    return text;
  } catch { return ''; }
}

/** Run Tesseract OCR on an image and return extracted text */
async function runOcr(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) return '';
  const url = URL.createObjectURL(file);
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker(['fra', 'eng']);
    const { data: { text } } = await worker.recognize(url);
    await worker.terminate();
    return text;
  } catch { return ''; }
  finally { URL.revokeObjectURL(url); }
}

/** Fetch URL → cache blob → return object URL */
async function cachedBlobUrl(url: string): Promise<{ href: string; fromCache: boolean }> {
  try {
    const cache = await caches.open(CACHE);
    const hit   = await cache.match(url);
    if (hit) return { href: URL.createObjectURL(await hit.blob()), fromCache: true };
    const res = await fetch(url, { cache: 'force-cache' });
    await cache.put(url, res.clone());
    return { href: URL.createObjectURL(await res.blob()), fromCache: false };
  } catch { return { href: url, fromCache: false }; }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DocsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [uid, setUid] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal
  const [showAdd, setShowAdd]         = useState(false);
  const [addZone, setAddZone]         = useState<ZoneKey>('autre');
  const [addNom, setAddNom]           = useState('');
  const [addExpiry, setAddExpiry]     = useState('');
  const [addFile, setAddFile]         = useState<File | null>(null);
  const [ocrStatus, setOcrStatus]     = useState<OcrStatus>('idle');
  const [ocrMsg, setOcrMsg]           = useState('');
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState<string | null>(null);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);

  // Viewer
  const [viewDoc, setViewDoc]   = useState<Doc | null>(null);
  const [viewUrl, setViewUrl]   = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [fromCache, setFromCache]     = useState(false);
  const [zoom, setZoom]               = useState(1);

  // Delete
  const [delTarget, setDelTarget] = useState<Doc | null>(null);
  const [deleting, setDeleting]   = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchDocs = useCallback(async (id: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('agent_id', id)
      .order('created_at', { ascending: false });
    setDocs((data as Doc[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      // On utilise un mock agentId si la session n'est pas active pour la démo
      const agentId = data.user?.id || '11111111-1111-1111-1111-111111111111';
      setUid(agentId);
      fetchDocs(agentId);
    }
    loadUser();
  }, [fetchDocs]);

  // ── open add modal ──────────────────────────────────────────────────────────
  const openAdd = (zone: ZoneKey) => {
    setAddZone(zone);
    setAddNom('');
    setAddExpiry('');
    setAddFile(null);
    setOcrStatus('idle');
    setOcrMsg('');
    setSaveError(null);
    setSizeWarning(null);
    if (fileRef.current) fileRef.current.value = '';
    setShowAdd(true);
  };

  // ── file selected → compress → OCR / PDF extract ───────────────────────────
  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;

    // Auto-fill name from filename (if field is empty)
    const nameFromFile = raw.name
      .replace(/\.[^/.]+$/, '')          // remove extension
      .replace(/[_\-]+/g, ' ')           // underscores/dashes → spaces
      .trim();
    setAddNom(prev => prev || nameFromFile);

    // Size check (10 MB hard limit)
    if (raw.size > MAX_MB * 1024 * 1024) {
      setSizeWarning(`Fichier trop lourd (${(raw.size / 1024 / 1024).toFixed(1)} Mo). La compression va réduire automatiquement la taille.`);
    } else {
      setSizeWarning(null);
    }

    // ── PDF path: extract embedded text ──────────────────────────────────────
    if (raw.type === 'application/pdf') {
      setAddFile(raw);
      setOcrStatus('scanning');
      setOcrMsg('Lecture du texte PDF...');
      const text  = await extractPdfText(raw);
      const found = extractExpiry(text);
      if (found) {
        setAddExpiry(found);
        setOcrStatus('done');
        setOcrMsg("Date d'expiration détectée dans le PDF ✓");
      } else {
        setOcrStatus('failed');
        setOcrMsg('Date non trouvée — saisissez-la manuellement.');
      }
      return;
    }

    // ── Image path: compress then Tesseract OCR ───────────────────────────────
    setOcrStatus('compressing');
    setOcrMsg('Compression en cours...');
    const compressed = await compressImage(raw);
    setAddFile(compressed);

    setOcrStatus('scanning');
    setOcrMsg("Lecture du document par l'IA OCR...");
    const text  = await runOcr(compressed);
    const found = extractExpiry(text);

    if (found) {
      setAddExpiry(found);
      setOcrStatus('done');
      setOcrMsg(`Date d'expiration détectée automatiquement ✓`);
    } else {
      setOcrStatus('failed');
      setOcrMsg("Date non trouvée — saisissez-la manuellement.");
    }
  };

  // ── save doc ────────────────────────────────────────────────────────────────
  const saveDoc = async () => {
    if (!uid || !addNom || !addFile) return;
    setSaving(true);
    setSaveError(null);
    try {
      const fd = new FormData();
      fd.append('file', addFile);
      fd.append('userId', uid);
      const res = await fetch('/api/docs/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Erreur serveur ${res.status}`);
      }
      const { file_url } = await res.json();

      const { error } = await supabase.from('documents').insert([{
        nom: addNom,
        type: addZone,
        expiration: addExpiry || null,
        agent_id: uid,
        url: file_url,
      }]);
      if (error) throw error;

      setShowAdd(false);
      await fetchDocs(uid);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // ── viewer ──────────────────────────────────────────────────────────────────
  const openViewer = async (doc: Doc) => {
    setViewDoc(doc);
    setZoom(1);
    setFromCache(false);
    if (!doc.url) { setViewUrl(null); return; }
    setViewLoading(true);
    const { href, fromCache: fc } = await cachedBlobUrl(doc.url);
    setViewUrl(href);
    setFromCache(fc);
    setViewLoading(false);
  };

  const closeViewer = () => {
    if (viewUrl?.startsWith('blob:')) URL.revokeObjectURL(viewUrl);
    setViewDoc(null);
    setViewUrl(null);
    setZoom(1);
  };

  // ── delete ──────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!delTarget || !uid) return;
    setDeleting(true);
    await supabase.from('documents').delete().eq('id', delTarget.id);
    setDelTarget(null);
    setDeleting(false);
    fetchDocs(uid);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  const byZone = (key: string) => docs.filter(d => d.type === key);
  const cnapsExpiring = docs.some(d => d.type === 'carte_pro' && (isExpiringSoon(d.expiration, true) || isExpired(d.expiration)));
  const anyExpiry = docs.some(d => isExpiringSoon(d.expiration, d.type === 'carte_pro') || isExpired(d.expiration));

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col pb-12">
      {/* Header */}
      <div className="px-5 pt-10 pb-5">
        <button onClick={() => router.push('/agent/hub')}
          className="text-slate-500 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-1 hover:text-[#00d1ff] transition-colors">
          ← Hub
        </button>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Certifications & Cartes</p>
        <h1 className="text-[#00d1ff] text-3xl font-black tracking-tighter"
          style={{ textShadow: '0 0 20px rgba(0,209,255,0.4)' }}>
          DOCUMENTS
        </h1>
      </div>

      {/* Expiry alert */}
      {cnapsExpiring && (
        <div className="mx-4 mb-5 rounded-xl bg-red-500/10 border border-red-500/25 p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-500 w-6 h-6 animate-pulse" />
          <p className="text-red-300 text-sm font-bold">
            ALERTE : Votre Carte Professionnelle CNAPS expire dans moins de 90 jours (ou est déjà expirée). Veuillez initier son renouvellement immédiatement.
          </p>
        </div>
      )}
      {!cnapsExpiring && anyExpiry && (
        <div className="mx-4 mb-5 rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 flex items-center gap-3">
          <span>⚠️</span>
          <p className="text-amber-300 text-xs font-bold">Un ou plusieurs de vos documents arrivent à expiration.</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40 gap-3">
          <Loader2 className="text-[#00d1ff] animate-spin" size={22} />
        </div>
      ) : (
        <>
        {/* ── Grille 4 blocs ─────────────────────────────────────────────────── */}
        <div className="px-4 pb-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ZONES.map((zone) => {
            const zoneDocs = byZone(zone.key);
            return (
              <div
                key={zone.key}
                className="flex flex-col rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(8, 15, 28, 0.85)',
                  border: `1px solid ${zone.accent}30`,
                  boxShadow: `0 0 24px ${zone.accent}12, inset 0 1px 0 rgba(255,255,255,0.04)`,
                }}
              >
                {/* ── En-tête centré ── */}
                <div
                  className="flex flex-col items-center pt-6 pb-4 px-4"
                  style={{ borderBottom: `1px solid ${zone.accent}18` }}
                >
                  <span className="text-3xl mb-2 drop-shadow-lg">{zone.icon}</span>
                  <p
                    className="text-[10px] font-black uppercase tracking-widest text-center leading-tight"
                    style={{ color: zone.accent, textShadow: `0 0 10px ${zone.accent}60` }}
                  >
                    {zone.label}
                  </p>
                  {zoneDocs.length > 0 && (
                    <span
                      className="mt-2 text-[9px] font-bold rounded-full px-2 py-0.5 border"
                      style={{ color: zone.accent, borderColor: `${zone.accent}35`, background: `${zone.accent}10` }}
                    >
                      {zoneDocs.length} doc{zoneDocs.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* ── Liste des documents ── */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: '260px' }}>
                  {zoneDocs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <span className="text-2xl opacity-15">{zone.icon}</span>
                      <p className="text-red-400/80 text-[10px] uppercase tracking-widest font-bold text-center flex items-center gap-1">
                        <AlertCircle size={12} /> Document Manquant
                      </p>
                    </div>
                  ) : (
                    zoneDocs.map((doc) => {
                      const isCnaps = doc.type === 'carte_pro';
                      const expired  = isExpired(doc.expiration);
                      const expiring = isExpiringSoon(doc.expiration, isCnaps);
                      const hasFile  = !!doc.url;
                      return (
                        <div
                          key={doc.id}
                          className="rounded-xl p-2.5 transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          {/* Nom + validité */}
                          <p className="text-white font-black text-xs truncate">{doc.nom}</p>
                          {doc.expiration ? (
                            <p className={`text-[9px] font-semibold mt-0.5 ${expired ? 'text-red-400' : expiring ? 'text-amber-400' : 'text-slate-500'}`}>
                              {expired ? '⛔ Expiré' : expiring ? '⚠️ Expire' : '✓ Valide'} le{' '}
                              {new Date(doc.expiration).toLocaleDateString('fr-FR')}
                            </p>
                          ) : (
                            <p className="text-[9px] text-slate-700 mt-0.5">Sans date de validité</p>
                          )}
                          {/* Actions */}
                          <div className="flex items-center gap-1 mt-2">
                            <button
                              onClick={() => openViewer(doc)}
                              disabled={!hasFile}
                              className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-25"
                              style={hasFile ? { borderColor: `${zone.accent}50`, color: zone.accent, background: `${zone.accent}10` } : { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }}
                            >
                              <Eye size={10} /> Voir
                            </button>
                            {hasFile && (
                              <a
                                href={doc.url} target="_blank" rel="noopener noreferrer" download
                                className="p-1.5 rounded-lg border border-white/10 text-slate-500 hover:text-white transition-all active:scale-95"
                                title="Télécharger"
                              >
                                <Download size={11} />
                              </a>
                            )}
                            <button
                              onClick={() => setDelTarget(doc)}
                              className="p-1.5 rounded-lg border border-red-500/15 text-red-400/40 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-95"
                              title="Supprimer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* ── Bouton + AJOUTER en bas ── */}
                <div className="p-3" style={{ borderTop: `1px solid ${zone.accent}15` }}>
                  <button
                    onClick={() => openAdd(zone.key as ZoneKey)}
                    className="w-full py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 hover:opacity-90"
                    style={{
                      borderColor: `${zone.accent}45`,
                      color: zone.accent,
                      background: `${zone.accent}0d`,
                      boxShadow: `0 0 12px ${zone.accent}18`,
                    }}
                  >
                    + AJOUTER
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── AI tip badge ───────────────────────────────────────────────────── */}
        <div className="flex justify-center px-4 pt-4 pb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00d1ff]/20 bg-[#00d1ff]/[0.04]"
            style={{ boxShadow: '0 0 14px rgba(0,209,255,0.08)' }}>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00d1ff]">Optimisation IA</span>
            <span className="w-px h-3 bg-white/10 shrink-0" />
            <span className="text-[10px] text-slate-400">Privilégiez des fichiers de moins de 2 Mo pour une consultation instantanée.</span>
          </div>
        </div>
        </>
      )}

      {/* ── VISUALISEUR FULL SCREEN ─────────────────────────────────────────── */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-black/90 border-b border-white/10 shrink-0">
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm truncate">{viewDoc.nom}</p>
              {fromCache && (
                <div className="flex items-center gap-1 mt-0.5">
                  <WifiOff size={10} className="text-emerald-400" />
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Hors-ligne disponible</span>
                </div>
              )}
            </div>

            {/* Zoom (images only) */}
            {viewUrl && viewDoc.url && !isPdf(viewDoc.url) && (
              <>
                <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} disabled={zoom <= 0.5}
                  className="p-2 rounded-xl border border-white/15 text-white/60 hover:text-white transition-colors disabled:opacity-30">
                  <ZoomOut size={15} />
                </button>
                <span className="text-white/40 text-xs font-bold w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} disabled={zoom >= 4}
                  className="p-2 rounded-xl border border-white/15 text-white/60 hover:text-white transition-colors disabled:opacity-30">
                  <ZoomIn size={15} />
                </button>
              </>
            )}

            {/* Download */}
            {viewUrl && (
              <a href={viewUrl} download={viewDoc.nom}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00d1ff]/10 border border-[#00d1ff]/30 text-[#00d1ff] text-xs font-black uppercase tracking-wider hover:bg-[#00d1ff]/20 transition-colors active:scale-95">
                <Download size={13} />
                <span className="hidden sm:inline">Télécharger</span>
              </a>
            )}

            <button onClick={closeViewer}
              className="p-2 rounded-xl border border-white/15 text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden relative bg-black">
            {viewLoading && (
              <div className="absolute inset-0 flex items-center justify-center gap-3">
                <Loader2 className="text-[#00d1ff] animate-spin" size={30} />
                <p className="text-[#00d1ff] text-sm font-bold uppercase tracking-widest animate-pulse">Chargement...</p>
              </div>
            )}
            {!viewLoading && !viewDoc.url && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="text-5xl opacity-20">📄</span>
                <p className="text-slate-500 text-sm">Aucun fichier associé</p>
              </div>
            )}
            {!viewLoading && viewUrl && isPdf(viewDoc.url) && (
              <iframe src={viewUrl} className="w-full h-full border-0" title={viewDoc.nom} />
            )}
            {!viewLoading && viewUrl && !isPdf(viewDoc.url) && (
              <div className="w-full h-full overflow-auto flex items-center justify-center">
                <img
                  src={viewUrl} alt={viewDoc.nom}
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease', maxWidth: zoom <= 1 ? '100%' : 'none', maxHeight: zoom <= 1 ? '100%' : 'none', objectFit: 'contain' }}
                  draggable={false}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ADD MODAL ───────────────────────────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-[#080F1C] border border-white/10 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {ZONES.find(z => z.key === addZone)?.label}
                </p>
                <h2 className="text-white font-black text-base uppercase tracking-wide">Nouveau document</h2>
              </div>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
            </div>

            {/* File drop zone */}
            <div onClick={() => fileRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-white/15 rounded-2xl p-5 text-center hover:border-[#00d1ff]/40 transition-colors">
              <Upload className="mx-auto mb-2 text-slate-500" size={24} />
              {addFile ? (
                <p className="text-white text-sm font-bold truncate px-2">{addFile.name}</p>
              ) : (
                <>
                  <p className="text-slate-400 text-sm">Cliquer pour choisir</p>
                  <p className="text-slate-600 text-xs mt-0.5">PDF, JPG ou PNG · Max {MAX_MB} Mo</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={onFileSelect} />

            {/* Size warning */}
            {sizeWarning && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-300 text-xs">{sizeWarning}</p>
              </div>
            )}

            {/* OCR status */}
            {ocrStatus !== 'idle' && (
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${
                ocrStatus === 'compressing' || ocrStatus === 'scanning'
                  ? 'bg-[#00d1ff]/10 border border-[#00d1ff]/20 text-[#00d1ff]'
                  : ocrStatus === 'done'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-slate-500/10 border border-slate-500/20 text-slate-400'
              }`}>
                {(ocrStatus === 'compressing' || ocrStatus === 'scanning')
                  ? <Loader2 size={13} className="animate-spin shrink-0" />
                  : ocrStatus === 'done'
                  ? <CheckCircle size={13} className="shrink-0" />
                  : <AlertCircle size={13} className="shrink-0" />}
                <span>{ocrMsg}</span>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">Nom du document *</label>
                <input type="text" placeholder="Ex: Carte Pro CNAPS — DUPONT Jean"
                  value={addNom} onChange={e => setAddNom(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-[#00d1ff]/50 transition-colors" />
              </div>
              <div>
                <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">
                  Date d&apos;expiration {ocrStatus === 'done' && addExpiry ? '— détectée par OCR ✓' : '(optionnel)'}
                </label>
                <input type="date" value={addExpiry} onChange={e => setAddExpiry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-[#00d1ff]/50 transition-colors" />
              </div>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <AlertCircle size={13} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-xs">{saveError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-bold uppercase tracking-wider active:scale-95 transition-all">
                Annuler
              </button>
              <button onClick={saveDoc} disabled={saving || !addNom || !addFile}
                className="flex-1 py-3 rounded-xl bg-[#00d1ff] text-[#060D18] text-sm font-black uppercase tracking-wider disabled:opacity-40 active:scale-95 transition-all"
                style={{ boxShadow: saving ? 'none' : '0 0 20px rgba(0,209,255,0.3)' }}>
                {saving
                  ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" />Upload...</span>
                  : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ───────────────────────────────────────────────────── */}
      {delTarget && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xs bg-[#080F1C] border border-red-500/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 className="text-red-400" size={18} />
              </div>
              <div>
                <p className="text-white font-black text-sm">Supprimer ?</p>
                <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[180px]">{delTarget.nom}</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelTarget(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-bold uppercase active:scale-95 transition-all">
                Annuler
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500/80 text-white text-sm font-black uppercase disabled:opacity-50 active:scale-95 transition-all">
                {deleting ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" />...</span> : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
