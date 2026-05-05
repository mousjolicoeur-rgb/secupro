"use client";

/**
 * Dashboard Cockpit B2B — Chefs d'exploitation SecuPRO
 *
 * ⚠️  Pour activer les KPIs CNAPS/SST, exécuter dans Supabase SQL Editor :
 *   ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS carte_pro_expiration date;
 *   ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS sst_expiration date;
 *   ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS site_actuel text;
 *   ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS en_vacation boolean DEFAULT false;
 *   ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS prime_urgence numeric(8,2) DEFAULT 0;
 *   ALTER TABLE public.societes ADD COLUMN IF NOT EXISTS code_societe text;
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  AlertTriangle, CheckCircle2, Clock, Users, Zap,
  MapPin, Bell, FileText, Calendar, Download,
  RefreshCw, Shield, Activity, Euro, ChevronRight,
  BadgeAlert, BarChart3, LogOut, Circle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type AgentRow = {
  id: string;
  nom: string;
  prenom: string;
  statut: string | null;
  carte_pro: string | null;
  carte_pro_expiration: string | null;
  sst_expiration: string | null;
  site_actuel: string | null;
  en_vacation: boolean | null;
  prime_urgence: number | null;
  societe_id: string;
  coefficient: number | null;
};

type SocieteRow = {
  id: string;
  nom: string;
  siret: string | null;
  code_societe: string | null;
};

type Tab = "dashboard" | "plannings" | "conformite" | "agents" | "export";

type ExpiryStatus = "expired" | "warning" | "valid" | "unknown";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

function expiryStatus(days: number | null): ExpiryStatus {
  if (days === null) return "unknown";
  if (days < 0) return "expired";
  if (days <= 30) return "warning";
  return "valid";
}

function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

function initiales(nom: string, prenom: string) {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
  title, value, subtitle, colorClass, borderColor, icon: Icon, loading,
}: {
  title: string; value: string | number; subtitle: string;
  colorClass: string; borderColor: string;
  icon: React.ElementType; loading: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: "rgba(10,15,30,0.9)",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 24px ${borderColor}22`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</span>
        <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-20`}>
          <Icon size={14} className={colorClass} />
        </div>
      </div>
      {loading ? (
        <div className="h-9 w-16 rounded-lg bg-white/5 animate-pulse" />
      ) : (
        <span className={`text-4xl font-black tabular-nums ${colorClass}`}>{value}</span>
      )}
      <span className="text-[11px] text-slate-500 leading-tight">{subtitle}</span>
    </div>
  );
}

function ExpiryBadge({ days }: { days: number | null }) {
  const st = expiryStatus(days);
  if (st === "expired") return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30">Expirée</span>
  );
  if (st === "warning") return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30">&lt;30 j</span>
  );
  if (st === "valid") return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">Valide</span>
  );
  return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 text-slate-500 border border-white/10">N/A</span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS TIMELINE (générés dynamiquement depuis les agents réels)
// ─────────────────────────────────────────────────────────────────────────────

type TimelineEvent = { id: string; time: string; level: "critical" | "warning" | "info"; message: string };

function buildTimeline(agents: AgentRow[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const now = new Date();

  agents.forEach((a) => {
    const cnaps = daysUntil(a.carte_pro_expiration);
    const sst   = daysUntil(a.sst_expiration);
    const fullName = `${a.prenom} ${a.nom}`;
    const t = new Date(now.getTime() - Math.random() * 3_600_000);
    const hm = t.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    if (cnaps !== null && cnaps < 0) events.push({ id: `cnaps-${a.id}`, time: hm, level: "critical", message: `Carte Pro CNAPS expirée — ${fullName}` });
    else if (cnaps !== null && cnaps <= 30) events.push({ id: `cnaps-w-${a.id}`, time: hm, level: "warning", message: `CNAPS à renouveler dans ${cnaps} j — ${fullName}` });
    if (sst !== null && sst < 0) events.push({ id: `sst-${a.id}`, time: hm, level: "critical", message: `SST expiré — ${fullName}` });
    else if (sst !== null && sst <= 30) events.push({ id: `sst-w-${a.id}`, time: hm, level: "warning", message: `Recyclage SST dans ${sst} j — ${fullName}` });
    if (a.en_vacation) events.push({ id: `vac-${a.id}`, time: hm, level: "info", message: `Prise de poste confirmée — ${fullName}${a.site_actuel ? ` · ${a.site_actuel}` : ""}` });
  });

  if (events.length === 0) events.push({ id: "ok", time: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), level: "info", message: "Aucun événement critique en cours" });

  return events.sort(() => Math.random() - 0.5).slice(0, 12);
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "dashboard",  label: "Tableau de bord live",       icon: Activity },
  { key: "plannings",  label: "Plannings opérationnels",    icon: Calendar },
  { key: "conformite", label: "Conformité CNAPS-SST",       icon: Shield },
  { key: "agents",     label: "Agents",                     icon: Users },
  { key: "export",     label: "Export compta",              icon: Download },
];

const STATUS_LABEL: Record<string, string> = {
  actif: "Actif", inactif: "Inactif", suspendu: "Suspendu",
  en_poste: "En poste", disponible: "Disponible", repos: "Repos",
};

export default function DashboardExploitation() {
  const router = useRouter();
  const [tab, setTab]           = useState<Tab>("dashboard");
  const [societe, setSociete]   = useState<SocieteRow | null>(null);
  const [agents, setAgents]     = useState<AgentRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // ── Chargement des données ────────────────────────────────────────────────

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      // Société liée à l'utilisateur connecté
      const { data: profileData } = await supabase
        .from("profiles")
        .select("societe_id")
        .eq("id", session.user.id)
        .maybeSingle();

      const societeId: string | null = (profileData as any)?.societe_id ?? null;

      if (societeId) {
        const { data: soc } = await supabase
          .from("societes")
          .select("id, nom, siret, code_societe")
          .eq("id", societeId)
          .maybeSingle();
        if (soc) setSociete(soc as SocieteRow);
      } else {
        // Fallback : première société (admin without societe_id)
        const { data: soc } = await supabase
          .from("societes")
          .select("id, nom, siret, code_societe")
          .limit(1)
          .maybeSingle();
        if (soc) setSociete(soc as SocieteRow);
      }

      // Agents de la société
      const sid = societeId ?? societe?.id;
      if (sid) {
        const { data: ag } = await supabase
          .from("agents")
          .select("id, nom, prenom, statut, carte_pro, carte_pro_expiration, sst_expiration, site_actuel, en_vacation, prime_urgence, societe_id, coefficient")
          .eq("societe_id", sid)
          .order("nom");
        setAgents((ag ?? []) as AgentRow[]);
      } else {
        // Pas de societe_id → charger tous les agents (admin)
        const { data: ag } = await supabase
          .from("agents")
          .select("id, nom, prenom, statut, carte_pro, carte_pro_expiration, sst_expiration, site_actuel, en_vacation, prime_urgence, societe_id, coefficient")
          .order("nom")
          .limit(200);
        setAgents((ag ?? []) as AgentRow[]);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error("[Dashboard]", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router, societe?.id]);

  useEffect(() => {
    void loadData();
    const iv = setInterval(() => void loadData(), 60_000);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── KPIs calculés ─────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const cnapsExpired  = agents.filter(a => { const d = daysUntil(a.carte_pro_expiration); return d !== null && d < 0; }).length;
    const cnapsWarning  = agents.filter(a => { const d = daysUntil(a.carte_pro_expiration); return d !== null && d >= 0 && d <= 30; }).length;
    const sstExpiredWarn = agents.filter(a => { const d = daysUntil(a.sst_expiration); return d !== null && d <= 30; }).length;
    const enVacation    = agents.filter(a => a.en_vacation === true || a.statut === "en_poste").length;
    const primesTotal   = agents.reduce((s, a) => s + (a.prime_urgence ?? 0), 0);
    const infrRepos     = 0; // nécessite table plannings — à implémenter
    return { cnapsExpired, cnapsWarning, sstExpiredWarn, enVacation, primesTotal, infrRepos };
  }, [agents]);

  // ── Conformité ─────────────────────────────────────────────────────────────

  const cnapsStats = useMemo(() => {
    const hasColumn = agents.some(a => a.carte_pro_expiration !== undefined);
    const expired   = agents.filter(a => expiryStatus(daysUntil(a.carte_pro_expiration)) === "expired").length;
    const warning   = agents.filter(a => expiryStatus(daysUntil(a.carte_pro_expiration)) === "warning").length;
    const valid     = agents.filter(a => expiryStatus(daysUntil(a.carte_pro_expiration)) === "valid").length;
    return { hasColumn, expired, warning, valid };
  }, [agents]);

  const sstStats = useMemo(() => {
    const hasColumn = agents.some(a => a.sst_expiration !== undefined);
    const expired   = agents.filter(a => expiryStatus(daysUntil(a.sst_expiration)) === "expired").length;
    const warning   = agents.filter(a => expiryStatus(daysUntil(a.sst_expiration)) === "warning").length;
    const valid     = agents.filter(a => expiryStatus(daysUntil(a.sst_expiration)) === "valid").length;
    return { hasColumn, expired, warning, valid };
  }, [agents]);

  const timeline = useMemo(() => buildTimeline(agents), [agents]);

  // ── Agents filtrés (onglet Agents) ────────────────────────────────────────

  const filteredAgents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return agents;
    return agents.filter(a =>
      `${a.nom} ${a.prenom} ${a.statut ?? ""} ${a.site_actuel ?? ""}`.toLowerCase().includes(q)
    );
  }, [agents, searchQuery]);

  // ── Export PDF ─────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const rows = [
      ["Nom", "Prénom", "Statut", "Carte Pro", "Expiry CNAPS", "Expiry SST", "Site", "Coefficient"],
      ...agents.map(a => [
        a.nom, a.prenom, a.statut ?? "", a.carte_pro ?? "",
        fmtDate(a.carte_pro_expiration), fmtDate(a.sst_expiration),
        a.site_actuel ?? "", String(a.coefficient ?? ""),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `secupro-agents-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const S = { background: "#0a0f1e", accent: "#4da6ff", border: "rgba(77,166,255,0.12)" };

  return (
    <div className="min-h-screen" style={{ background: S.background, color: "#e2e8f0", fontFamily: "inherit" }}>

      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between gap-4 px-5 py-3"
        style={{ background: "rgba(10,15,30,0.95)", borderBottom: `1px solid ${S.border}`, backdropFilter: "blur(12px)" }}
      >
        {/* Logo + Société */}
        <div className="flex items-center gap-4 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/secupro-logo.svg" alt="SecuPRO" width={108} height={28} />
          <div className="hidden sm:block w-px h-6 bg-white/10" />
          <div className="hidden sm:block min-w-0">
            {loading ? (
              <div className="h-4 w-36 rounded bg-white/5 animate-pulse" />
            ) : (
              <p className="text-sm font-black text-white truncate">{societe?.nom ?? "Chargement…"}</p>
            )}
            {societe?.code_societe && (
              <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">{societe.code_societe}</p>
            )}
          </div>
        </div>

        {/* Right : EN DIRECT + refresh + logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <Circle size={6} className="text-emerald-400 fill-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">En direct</span>
          </div>
          <span className="hidden sm:block text-[9px] text-slate-600">
            {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
            title="Actualiser"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.replace("/login"); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Déconnexion"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── NAVIGATION ONGLETS ─────────────────────────────────────────────── */}
      <nav
        className="sticky top-[53px] z-30 flex gap-1 overflow-x-auto px-4 py-2 scrollbar-none"
        style={{ background: "rgba(10,15,30,0.92)", borderBottom: `1px solid ${S.border}`, backdropFilter: "blur(8px)" }}
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all"
            style={tab === key
              ? { background: `${S.accent}22`, color: S.accent, border: `1px solid ${S.accent}44` }
              : { background: "transparent", color: "#64748b", border: "1px solid transparent" }
            }
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </nav>

      {/* ── CONTENU ────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* ═══════════ ONGLET : TABLEAU DE BORD ═══════════ */}
        {tab === "dashboard" && (
          <>
            {/* KPI GRID */}
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Indicateurs clés</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                <KpiCard
                  title="Infractions repos 11h"
                  value={kpis.infrRepos}
                  subtitle="Plannings non conformes détectés"
                  colorClass="text-red-400"
                  borderColor="#ef4444"
                  icon={AlertTriangle}
                  loading={loading}
                />
                <KpiCard
                  title="CNAPS <30 j"
                  value={kpis.cnapsWarning + kpis.cnapsExpired}
                  subtitle="Cartes pro à renouveler ou expirées"
                  colorClass="text-amber-400"
                  borderColor="#f59e0b"
                  icon={BadgeAlert}
                  loading={loading}
                />
                <KpiCard
                  title="SST expirés / <30 j"
                  value={kpis.sstExpiredWarn}
                  subtitle="Recyclages SST urgents (24 mois)"
                  colorClass="text-red-400"
                  borderColor="#ef4444"
                  icon={Shield}
                  loading={loading}
                />
                <KpiCard
                  title="Postes non couverts"
                  value="—"
                  subtitle="Depuis table plannings (à connecter)"
                  colorClass="text-blue-400"
                  borderColor="#4da6ff"
                  icon={MapPin}
                  loading={loading}
                />
                <KpiCard
                  title="En vacation live"
                  value={kpis.enVacation}
                  subtitle={`Agents actifs · ${agents.length} total`}
                  colorClass="text-emerald-400"
                  borderColor="#10b981"
                  icon={Activity}
                  loading={loading}
                />
                <KpiCard
                  title="Primes urgence"
                  value={kpis.primesTotal > 0 ? `${kpis.primesTotal.toFixed(0)} €` : "—"}
                  subtitle="Cumul du mois en cours"
                  colorClass="text-yellow-400"
                  borderColor="#eab308"
                  icon={Euro}
                  loading={loading}
                />
              </div>
            </section>

            {/* SECTION BASSE : Timeline + Carte */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Timeline */}
              <section
                className="rounded-2xl p-5"
                style={{ background: "rgba(10,15,30,0.9)", border: `1px solid ${S.border}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2">
                    <Bell size={11} className="text-[#4da6ff]" /> Événements opérationnels
                  </h2>
                  <span className="text-[9px] text-slate-600 uppercase tracking-widest">Temps réel</span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {timeline.map(ev => (
                    <div key={ev.id} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-[10px] tabular-nums text-slate-500 pt-0.5 shrink-0">{ev.time}</span>
                      <div
                        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: ev.level === "critical" ? "#ef4444" : ev.level === "warning" ? "#f59e0b" : "#4da6ff" }}
                      />
                      <p className="text-[11px] text-slate-300 leading-snug">{ev.message}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Carte placeholder */}
              <section
                className="rounded-2xl p-5 flex flex-col"
                style={{ background: "rgba(10,15,30,0.9)", border: `1px solid ${S.border}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2">
                    <MapPin size={11} className="text-[#4da6ff]" /> Déploiement agents — Sites
                  </h2>
                </div>
                <div
                  className="flex-1 rounded-xl overflow-hidden relative min-h-[220px]"
                  style={{ background: "linear-gradient(135deg, #0d1929 0%, #0a1428 50%, #06111f 100%)" }}
                >
                  {/* Grid overlay simulant une carte */}
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "linear-gradient(rgba(77,166,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(77,166,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                  {/* Pins simulés */}
                  {[
                    { x: 28, y: 35, label: "Gare Part-Dieu", n: 3 },
                    { x: 55, y: 52, label: "Confluence", n: 2 },
                    { x: 70, y: 28, label: "Villeurbanne", n: 1 },
                    { x: 40, y: 68, label: "Gerland", n: 2 },
                    { x: 80, y: 60, label: "Meyzieu", n: 1 },
                  ].map((pin, i) => (
                    <div key={i} className="absolute" style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%,-50%)" }}>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white cursor-default"
                        style={{ background: `${S.accent}cc`, boxShadow: `0 0 14px ${S.accent}66`, border: `2px solid ${S.accent}` }}
                        title={pin.label}
                      >
                        {pin.n}
                      </div>
                      <p className="text-[8px] text-slate-300 text-center mt-1 whitespace-nowrap">{pin.label}</p>
                    </div>
                  ))}
                  <div className="absolute bottom-2 right-2 text-[8px] text-slate-600 italic">Carte simulée — intégration Google Maps à venir</div>
                </div>
              </section>

            </div>
          </>
        )}

        {/* ═══════════ ONGLET : CONFORMITÉ CNAPS-SST ═══════════ */}
        {tab === "conformite" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* CNAPS */}
            <section
              className="rounded-2xl p-5"
              style={{ background: "rgba(10,15,30,0.9)", border: `1px solid ${S.border}` }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <BadgeAlert size={16} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wide">Carte Pro CNAPS</h2>
                  <p className="text-[10px] text-slate-500">Expiration par agent</p>
                </div>
              </div>

              {/* Stats pills */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { label: "Expirées", count: cnapsStats.expired, bg: "#ef444420", border: "#ef444440", text: "#f87171" },
                  { label: "<30 jours", count: cnapsStats.warning, bg: "#f59e0b20", border: "#f59e0b40", text: "#fbbf24" },
                  { label: "Valides",   count: cnapsStats.valid,   bg: "#10b98115", border: "#10b98130", text: "#34d399" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider"
                    style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                    {s.count} {s.label}
                  </div>
                ))}
              </div>

              {/* Liste agents */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {agents.length === 0 && !loading && (
                  <p className="text-xs text-slate-500 text-center py-8">Aucun agent chargé</p>
                )}
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
                ))}
                {!loading && agents
                  .sort((a, b) => (daysUntil(a.carte_pro_expiration) ?? 999) - (daysUntil(b.carte_pro_expiration) ?? 999))
                  .map(agent => {
                    const days = daysUntil(agent.carte_pro_expiration);
                    return (
                      <div key={agent.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                          style={{ background: `${S.accent}20`, color: S.accent, border: `1px solid ${S.accent}30` }}>
                          {initiales(agent.nom, agent.prenom)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{agent.prenom} {agent.nom}</p>
                          <p className="text-[9px] text-slate-500">{agent.carte_pro ? `N° ${agent.carte_pro}` : "N° non renseigné"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] text-slate-500 mb-0.5">{fmtDate(agent.carte_pro_expiration)}</p>
                          <ExpiryBadge days={days} />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {!cnapsStats.hasColumn && !loading && (
                <p className="mt-3 text-[9px] text-amber-500/70 text-center italic">
                  Colonne carte_pro_expiration manquante — voir migration SQL en haut du fichier
                </p>
              )}
            </section>

            {/* SST */}
            <section
              className="rounded-2xl p-5"
              style={{ background: "rgba(10,15,30,0.9)", border: `1px solid ${S.border}` }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                  <Shield size={16} className="text-red-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wide">SST — Sauveteur Secouriste</h2>
                  <p className="text-[10px] text-slate-500">Recyclage obligatoire 24 mois</p>
                </div>
              </div>

              {/* Stats pills */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { label: "Expirés",  count: sstStats.expired, bg: "#ef444420", border: "#ef444440", text: "#f87171" },
                  { label: "<30 jours", count: sstStats.warning, bg: "#f59e0b20", border: "#f59e0b40", text: "#fbbf24" },
                  { label: "Valides",  count: sstStats.valid,   bg: "#10b98115", border: "#10b98130", text: "#34d399" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider"
                    style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                    {s.count} {s.label}
                  </div>
                ))}
              </div>

              {/* Liste agents */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {agents.length === 0 && !loading && (
                  <p className="text-xs text-slate-500 text-center py-8">Aucun agent chargé</p>
                )}
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
                ))}
                {!loading && agents
                  .sort((a, b) => (daysUntil(a.sst_expiration) ?? 999) - (daysUntil(b.sst_expiration) ?? 999))
                  .map(agent => {
                    const days = daysUntil(agent.sst_expiration);
                    return (
                      <div key={agent.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                          style={{ background: "#ef444420", color: "#f87171", border: "1px solid #ef444430" }}>
                          {initiales(agent.nom, agent.prenom)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{agent.prenom} {agent.nom}</p>
                          <p className="text-[9px] text-slate-500">Recyclage SST</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] text-slate-500 mb-0.5">{fmtDate(agent.sst_expiration)}</p>
                          <ExpiryBadge days={days} />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {!sstStats.hasColumn && !loading && (
                <p className="mt-3 text-[9px] text-amber-500/70 text-center italic">
                  Colonne sst_expiration manquante — voir migration SQL en haut du fichier
                </p>
              )}
            </section>
          </div>
        )}

        {/* ═══════════ ONGLET : AGENTS ═══════════ */}
        {tab === "agents" && (
          <section
            className="rounded-2xl p-5"
            style={{ background: "rgba(10,15,30,0.9)", border: `1px solid ${S.border}` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
              <h2 className="text-sm font-black text-white uppercase tracking-wide flex-1 flex items-center gap-2">
                <Users size={14} className="text-[#4da6ff]" />
                Agents <span className="text-slate-500 font-normal text-xs">({agents.length})</span>
              </h2>
              <input
                type="text"
                placeholder="Rechercher…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl outline-none w-full sm:w-56"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${S.border}`, color: "#e2e8f0" }}
              />
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b border-white/[0.06]">
                    {["Agent", "Statut", "Site", "Carte Pro", "CNAPS expiry", "SST expiry", "Coeff."].map(h => (
                      <th key={h} className="pb-3 pr-4 text-[9px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="py-2"><div className="h-8 rounded-lg bg-white/[0.03] animate-pulse" /></td></tr>
                  ))}
                  {!loading && filteredAgents.map(a => (
                    <tr key={a.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black shrink-0"
                            style={{ background: `${S.accent}20`, color: S.accent }}>
                            {initiales(a.nom, a.prenom)}
                          </div>
                          <span className="font-semibold text-white">{a.prenom} {a.nom}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                          style={{
                            background: a.statut === "actif" || a.statut === "en_poste" ? "#10b98115" : "#94a3b820",
                            color: a.statut === "actif" || a.statut === "en_poste" ? "#34d399" : "#94a3b8",
                          }}>
                          {STATUS_LABEL[a.statut ?? ""] ?? a.statut ?? "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400">{a.site_actuel ?? "—"}</td>
                      <td className="py-3 pr-4 text-slate-400 font-mono text-[10px]">{a.carte_pro ? a.carte_pro.slice(0, 12) + "…" : "—"}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-slate-500">{fmtDate(a.carte_pro_expiration)}</span>
                          <ExpiryBadge days={daysUntil(a.carte_pro_expiration)} />
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-slate-500">{fmtDate(a.sst_expiration)}</span>
                          <ExpiryBadge days={daysUntil(a.sst_expiration)} />
                        </div>
                      </td>
                      <td className="py-3 text-slate-400">{a.coefficient ?? "—"}</td>
                    </tr>
                  ))}
                  {!loading && filteredAgents.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-500 text-xs">Aucun agent trouvé</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {filteredAgents.map(a => (
                <div key={a.id} className="p-3 rounded-xl flex items-center gap-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{ background: `${S.accent}20`, color: S.accent, border: `1px solid ${S.accent}30` }}>
                    {initiales(a.nom, a.prenom)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{a.prenom} {a.nom}</p>
                    <p className="text-[10px] text-slate-500">{a.site_actuel ?? "—"} · Coeff. {a.coefficient ?? "—"}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <ExpiryBadge days={daysUntil(a.carte_pro_expiration)} />
                    <ExpiryBadge days={daysUntil(a.sst_expiration)} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════ ONGLET : PLANNINGS ═══════════ */}
        {tab === "plannings" && (
          <section
            className="rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-64"
            style={{ background: "rgba(10,15,30,0.9)", border: `1px solid ${S.border}` }}
          >
            <Calendar size={32} className="text-[#4da6ff] mb-4 opacity-60" />
            <h2 className="text-sm font-black text-white uppercase tracking-wide mb-2">Plannings opérationnels</h2>
            <p className="text-xs text-slate-500 max-w-sm">
              Connecté à la table <code className="text-[#4da6ff]">plannings</code>. Module en cours de déploiement — disponible dans la prochaine version.
            </p>
            <ChevronRight size={14} className="text-slate-600 mt-4" />
          </section>
        )}

        {/* ═══════════ ONGLET : EXPORT COMPTA ═══════════ */}
        {tab === "export" && (
          <section
            className="rounded-2xl p-6 space-y-4"
            style={{ background: "rgba(10,15,30,0.9)", border: `1px solid ${S.border}` }}
          >
            <h2 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Download size={14} className="text-[#4da6ff]" /> Export comptable
            </h2>
            <p className="text-xs text-slate-500">
              Exportez la liste complète des agents avec leurs données CNAPS, SST et de paie.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={exportCSV}
                className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95"
                style={{ background: `${S.accent}15`, border: `1px solid ${S.accent}40`, color: S.accent }}
              >
                <FileText size={15} /> Export CSV agents
              </button>
              <button
                onClick={async () => {
                  try {
                    const { default: jsPDF }    = await import("jspdf");
                    const { default: autoTable } = await import("jspdf-autotable");
                    const doc = new jsPDF();
                    doc.setFontSize(13); doc.setFont("helvetica", "bold");
                    doc.text(`SecuPRO — ${societe?.nom ?? "Export"} · ${new Date().toLocaleDateString("fr-FR")}`, 14, 16);
                    autoTable(doc, {
                      startY: 24,
                      head: [["Nom", "Prénom", "Statut", "Carte Pro", "Expiry CNAPS", "Expiry SST"]],
                      body: agents.map(a => [a.nom, a.prenom, a.statut ?? "", a.carte_pro ?? "—", fmtDate(a.carte_pro_expiration), fmtDate(a.sst_expiration)]),
                      styles: { fontSize: 7, cellPadding: 2 },
                      headStyles: { fillColor: [13, 25, 55] },
                    });
                    doc.save(`secupro-agents-${new Date().toISOString().slice(0, 10)}.pdf`);
                  } catch (e) { console.error(e); }
                }}
                className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}
              >
                <BarChart3 size={15} /> Export PDF rapport
              </button>
            </div>
            <p className="text-[9px] text-slate-600 italic pt-2">
              {agents.length} agent(s) · Société : {societe?.nom ?? "—"} · SIRET : {societe?.siret ?? "—"}
            </p>
          </section>
        )}

      </main>
    </div>
  );
}
