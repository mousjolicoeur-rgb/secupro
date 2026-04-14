"use client";

import { useCallback, useState } from "react";
import { Download, RefreshCw, Lock, Trash2, AlertTriangle, Loader2, Eye, MousePointerClick } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Profile = {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  societe: string | null;
  matricule: string | null;
  carte_pro: string | null;
  created_at: string;
};

type GscData = {
  clicks: number;
  impressions: number;
  sparkClicks: number[];
  sparkImpressions: number[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtNumber(n: number) {
  return n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000
    ? (n / 1_000).toFixed(1) + "k"
    : String(n);
}

function exportCSV(profiles: Profile[]) {
  const headers = ["Prénom", "Nom", "Email", "Téléphone", "Société", "Matricule", "Carte Pro", "Inscrit le"];
  const rows = profiles.map((p) => [
    p.prenom ?? "", p.nom ?? "", p.email ?? "", p.telephone ?? "",
    p.societe ?? "", p.matricule ?? "", p.carte_pro ?? "", fmt(p.created_at),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `secupro_agents_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const w = 80;
  const h = 28;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  // area fill
  const area = `M0,${h} ${pts.map((p) => `L${p}`).join(" ")} L${w},${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`fill-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#fill-${color})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dernier point */}
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  sublabel,
  value,
  spark,
  color,
  icon,
  loading,
}: {
  label: string;
  sublabel: string;
  value: string | number;
  spark?: number[];
  color: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div
      className="flex-1 min-w-[180px] rounded-2xl border bg-white/[0.02] px-5 py-4 flex flex-col gap-2"
      style={{ borderColor: `${color}22` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        </div>
        {spark && spark.length > 1 && <Sparkline data={spark} color={color} />}
      </div>
      {loading ? (
        <div className="h-8 w-16 rounded-lg bg-white/[0.05] animate-pulse" />
      ) : (
        <span className="text-3xl font-black" style={{ color }}>{value}</span>
      )}
      <span className="text-[9px] text-slate-600 uppercase tracking-widest">{sublabel}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProListingPage() {
  const [authed,        setAuthed]        = useState(false);
  const [password,      setPassword]      = useState("");
  const [loginError,    setLoginError]    = useState("");
  const [loginLoading,  setLoginLoading]  = useState(false);
  const [profiles,      setProfiles]      = useState<Profile[] | null>(null);
  const [loadError,     setLoadError]     = useState("");
  const [loading,       setLoading]       = useState(false);
  const [gsc,           setGsc]           = useState<GscData | null>(null);
  const [gscLoading,    setGscLoading]    = useState(false);

  // Delete state
  const [deleteTarget,  setDeleteTarget]  = useState<Profile | null>(null);
  const [deleting,      setDeleting]      = useState(false);
  const [deleteError,   setDeleteError]   = useState("");

  const fetchGsc = useCallback(async () => {
    setGscLoading(true);
    const res = await fetch("/api/gsc", { credentials: "include" });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json && !json.error) setGsc(json);
    }
    setGscLoading(false);
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const res  = await fetch("/api/admin/profiles", { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      if (res.status === 401) { setAuthed(false); return; }
      setLoadError(json.error ?? "Erreur de chargement");
      return;
    }
    setProfiles(json.profiles ?? []);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    setLoginLoading(false);
    if (!res.ok) { setLoginError("Mot de passe incorrect."); return; }
    setPassword("");
    setAuthed(true);
    // Chargement parallèle
    await Promise.all([fetchProfiles(), fetchGsc()]);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthed(false);
    setProfiles(null);
    setGsc(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    const res  = await fetch(`/api/admin/profiles?id=${deleteTarget.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    setDeleting(false);
    if (!res.ok) {
      setDeleteError(json.error ?? "Erreur lors de la suppression");
      return;
    }
    setDeleteTarget(null);
    setProfiles((prev) => prev?.filter((p) => p.id !== deleteTarget.id) ?? null);
  };

  const dash = <span className="text-slate-700">—</span>;

  return (
    <div className="min-h-screen bg-[#050A12] text-white font-sans p-5 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-1">
              SECUPRO — Interface Administration
            </p>
            <h1 className="text-2xl font-black tracking-tight">
              LISTING <span className="text-[#00d1ff]">AGENTS</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
              Dossiers enregistrés · accès restreint
            </p>
          </div>
          {authed && (
            <div className="flex flex-wrap items-center gap-3">
              {profiles && profiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => exportCSV(profiles)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-400 text-xs font-black uppercase tracking-widest hover:bg-emerald-500/[0.14] transition-all active:scale-95"
                >
                  <Download size={13} /> Télécharger CSV
                </button>
              )}
              <button
                type="button"
                onClick={() => { fetchProfiles(); fetchGsc(); }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/[0.04] transition-all"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Actualiser
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400/70 text-xs font-black uppercase tracking-widest hover:bg-red-500/[0.06] transition-all"
              >
                Déconnexion
              </button>
            </div>
          )}
        </header>

        {/* Login */}
        {!authed && (
          <div className="flex justify-center pt-12">
            <form
              onSubmit={handleLogin}
              className="w-full max-w-sm space-y-4 p-8 rounded-3xl border border-white/10 bg-white/[0.03]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl border border-white/10 bg-black/30">
                  <Lock size={16} className="text-[#00d1ff]" />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-wide">Accès Admin</p>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest">Zone sécurisée</p>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00d1ff] transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {loginError && <p className="text-red-400 text-xs font-bold">{loginError}</p>}
              <button
                type="submit"
                disabled={loginLoading || !password}
                className="w-full py-3.5 rounded-xl bg-[#00d1ff] text-[#050A12] font-black text-xs uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all"
              >
                {loginLoading ? "Vérification…" : "ACCÉDER AU LISTING"}
              </button>
            </form>
          </div>
        )}

        {/* Listing */}
        {authed && (
          <>
            {/* ── Stats Row ── */}
            <div className="flex flex-wrap gap-4 mb-8">
              {/* Dossiers enregistrés */}
              <StatCard
                label="Dossiers Enregistrés"
                sublabel="agents inscrits sur SecuPRO"
                value={profiles !== null ? profiles.length : "—"}
                color="#00d1ff"
                icon={<span className="text-base">👤</span>}
                loading={loading && profiles === null}
              />

              {/* Visibilité Web */}
              <StatCard
                label="Visibilité Web"
                sublabel="impressions Google · 28 jours"
                value={gsc ? fmtNumber(gsc.impressions) : "—"}
                spark={gsc?.sparkImpressions}
                color="#a78bfa"
                icon={<Eye size={14} />}
                loading={gscLoading}
              />

              {/* Nouveaux Visiteurs */}
              <StatCard
                label="Nouveaux Visiteurs"
                sublabel="clics organiques · 28 jours"
                value={gsc ? fmtNumber(gsc.clicks) : "—"}
                spark={gsc?.sparkClicks}
                color="#34d399"
                icon={<MousePointerClick size={14} />}
                loading={gscLoading}
              />
            </div>

            {loadError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{loadError}</div>
            )}
            {loading && !profiles && (
              <p className="text-slate-500 text-sm animate-pulse uppercase tracking-widest">Chargement…</p>
            )}
            {profiles && profiles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <p className="text-4xl mb-3 opacity-30">👤</p>
                <p className="text-sm uppercase tracking-widest font-bold">Aucun dossier pour l&apos;instant</p>
              </div>
            )}

            {profiles && profiles.length > 0 && (
              <div className="rounded-3xl border border-white/[0.07] overflow-hidden bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-white/[0.07]">
                        {["Prénom", "Nom", "Email", "Téléphone", "Société", "Matricule", "Carte Pro", "Inscrit le", "Actions"].map((h) => (
                          <th key={h} className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((p) => (
                        <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-bold text-white">{p.prenom    || dash}</td>
                          <td className="p-4 font-bold text-white">{p.nom       || dash}</td>
                          <td className="p-4 text-[#00d1ff]">    {p.email      || dash}</td>
                          <td className="p-4 text-slate-300">    {p.telephone  || dash}</td>
                          <td className="p-4 text-slate-300">    {p.societe    || dash}</td>
                          <td className="p-4 text-slate-400 font-mono text-xs">{p.matricule || dash}</td>
                          <td className="p-4 text-slate-400 font-mono text-xs">{p.carte_pro || dash}</td>
                          <td className="p-4 text-slate-600 text-xs whitespace-nowrap">{fmt(p.created_at)}</td>
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => { setDeleteTarget(p); setDeleteError(""); }}
                              title="Supprimer ce dossier"
                              className="flex items-center justify-center h-8 w-8 rounded-lg border border-red-500/20 text-red-400/60 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 transition-all active:scale-95"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        <footer className="mt-12 text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-800">
            © 2026 SECUPRO COMMAND SYSTEM — ADMIN
          </p>
        </footer>
      </div>

      {/* ── Modal de confirmation suppression ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0A1520] border border-red-500/25 rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="text-red-400" size={18} />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-wide">Supprimer ce dossier ?</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {deleteTarget.prenom || ""} {deleteTarget.nom || ""} · {deleteTarget.email || "sans email"}
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Voulez-vous vraiment supprimer définitivement cet agent ?
              <span className="text-red-400 font-bold"> Cette action est irréversible.</span>
            </p>
            {deleteError && (
              <p className="text-red-400 text-xs font-bold bg-red-500/10 px-3 py-2 rounded-lg">{deleteError}</p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-bold uppercase tracking-wide active:scale-95 transition-all hover:bg-white/[0.03]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-black uppercase tracking-wide disabled:opacity-50 active:scale-95 transition-all"
              >
                {deleting
                  ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Suppression…</span>
                  : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
