"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CalendarDays, ChevronLeft, ChevronRight,
  Download, Loader2, Save, Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { isAuthenticatedClient } from "@/lib/authClient";

type PlanningRow = Record<string, unknown> & { id?: string };

// ─── Helpers semaine ─────────────────────────────────────────────────────────

function getWeekMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
}

function getISOWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dow = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) =>
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
  );
}

function weekLabel(monday: Date): string {
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).toUpperCase();
  return `S${getISOWeek(monday)} · ${fmt(monday)} — ${fmt(sunday)} ${sunday.getFullYear()}`;
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" });
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function rowSite(r: PlanningRow): string {
  const v = r.site ?? r.lieu ?? r.location ?? r.nom_site;
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

function rowHoraires(r: PlanningRow): string {
  const h = r.horaires ?? r.creneau ?? r.plage_horaire;
  return typeof h === "string" && h.trim() ? h.trim() : "";
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AgentPlanningPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [rows, setRows] = useState<PlanningRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekMonday(new Date()));
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const noteKey = agentId ? `secupro_note_${agentId}_${toISO(weekStart)}` : null;

  useEffect(() => {
    if (!noteKey) return;
    setNote(localStorage.getItem(noteKey) ?? "");
    setNoteSaved(false);
  }, [noteKey]);

  const label = useMemo(() => weekLabel(weekStart), [weekStart]);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const weekGrid = useMemo(() => weekDays.map((day) => {
    const iso = toISO(day);
    const match = rows.find((r) => {
      const raw = r.date ?? r.shift_date ?? r.date_debut;
      return typeof raw === "string" && raw.startsWith(iso);
    });
    return { day, row: match ?? null };
  }), [weekDays, rows]);

  const loadPlanning = useCallback(async (uid: string) => {
    setLoading(true);
    setLoadErr(null);
    const { data, error } = await supabase
      .from("plannings")
      .select("*")
      .eq("user_id", uid)
      .order("date", { ascending: true });
    if (error) { setLoadErr(error.message); setRows([]); }
    else { setRows((data ?? []) as PlanningRow[]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    void (async () => {
      if (!(await isAuthenticatedClient())) { router.replace("/"); return; }
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) { router.replace("/"); return; }
      setAgentId(uid);
      await loadPlanning(uid);
      setReady(true);
      channel = supabase.channel(`plannings-${uid}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "plannings", filter: `user_id=eq.${uid}` },
          () => { void loadPlanning(uid); })
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [router, loadPlanning]);

  async function handleDownload() {
    if (!exportRef.current || downloading) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(exportRef.current, { backgroundColor: "#050A12", pixelRatio: 2 });
      const a = document.createElement("a");
      a.download = "MON_PLANNING_SECU.png";
      a.href = dataUrl;
      a.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  }

  async function handleDelete() {
    if (!agentId || deleting) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("plannings").delete().eq("user_id", agentId);
      if (error) { alert(`Erreur : ${error.message}`); return; }
      setRows([]);
    } finally { setDeleting(false); setDeleteConfirm(false); }
  }

  function saveNote() {
    if (!noteKey || !note.trim()) return;
    localStorage.setItem(noteKey, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A12]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00d1ff]" />
      </div>
    );
  }

  const prevWeek = () => setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7));
  const nextWeek = () => setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7));

  return (
    <div className="min-h-screen bg-[#050A12] text-white">
      {/* Fond ambiance */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#0a1628]/80 to-[#050A12]" />

      <div className="relative flex min-h-screen flex-col px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Barre top ── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo + retour */}
          <div className="flex items-center gap-4">
            <Link href="/agent/hub"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Hub
            </Link>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[#00d1ff]" />
              <span className="text-lg font-black tracking-tight">
                <span className="text-[#00d1ff]">PLANNING</span>
                <span className="ml-2 text-xs font-bold text-slate-500">Vue hebdomadaire</span>
              </span>
            </div>
          </div>

          {/* Sélecteur semaine */}
          <div className="flex items-center gap-1 rounded-2xl border border-[#00d1ff]/25 bg-[#00d1ff]/[0.05] px-2 py-1"
            style={{ boxShadow: "0 0 16px rgba(0,209,255,0.08)" }}>
            <button type="button" onClick={prevWeek} aria-label="Semaine précédente"
              className="rounded-xl p-2 text-[#00d1ff]/60 transition hover:bg-[#00d1ff]/10 hover:text-[#00d1ff]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[15rem] text-center text-[10px] font-black uppercase tracking-widest text-[#00d1ff]"
              style={{ textShadow: "0 0 10px rgba(0,209,255,0.4)" }}>
              {label}
            </span>
            <button type="button" onClick={nextWeek} aria-label="Semaine suivante"
              className="rounded-xl p-2 text-[#00d1ff]/60 transition hover:bg-[#00d1ff]/10 hover:text-[#00d1ff]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Erreur */}
        {loadErr && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
            {loadErr}
          </div>
        )}

        {/* ── Tableau plein écran ── */}
        <div ref={exportRef}
          className="flex-1 overflow-hidden rounded-2xl border border-[#00d1ff]/20 bg-[#07111e]/90 backdrop-blur-md"
          style={{ boxShadow: "0 0 40px rgba(0,209,255,0.07), inset 0 1px 0 rgba(0,209,255,0.06)" }}>

          {/* En-tête tableau */}
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3 sm:px-7">
            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-600">
              Calendrier des vacations
            </span>
            <div className="flex items-center gap-2">
              {/* Télécharger */}
              <button type="button" disabled={downloading} onClick={() => void handleDownload()}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-[#00d1ff]/50 bg-[#00d1ff]/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#00d1ff] transition-all duration-200 hover:scale-105 hover:bg-[#00d1ff]/20 disabled:opacity-60"
                style={{ boxShadow: downloading ? "0 0 20px rgba(0,209,255,0.5)" : "0 0 10px rgba(0,209,255,0.2)" }}>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00d1ff]/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{downloading ? "Export…" : "Télécharger"}</span>
              </button>
              {/* Supprimer */}
              <button type="button" disabled={deleting} onClick={() => setDeleteConfirm(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 transition-all hover:scale-105 hover:bg-red-500/20 disabled:opacity-50"
                style={{ boxShadow: "0 0 10px rgba(255,0,0,0.4)" }}
                title="Supprimer le planning">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Colonnes headers */}
          <div className="grid grid-cols-[2fr_2fr_1.4fr] border-b border-white/[0.07] bg-black/20 px-5 py-2.5 sm:px-7">
            {["Jour", "Site", "Horaires"].map((h) => (
              <span key={h} className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">{h}</span>
            ))}
          </div>

          {/* Lignes */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-[#00d1ff]" />
            </div>
          ) : (
            <div>
              {weekGrid.map(({ day, row }, idx) => {
                const isToday = toISO(day) === toISO(new Date());
                const hasVacation = row !== null;
                const site = hasVacation ? rowSite(row!) : "";
                const horaires = hasVacation ? rowHoraires(row!) : "";
                const isLast = idx === 6;

                return (
                  <div
                    key={toISO(day)}
                    className={[
                      "grid grid-cols-[2fr_2fr_1.4fr] items-center px-5 py-4 transition-colors sm:px-7",
                      !isLast && "border-b border-white/[0.05]",
                      isToday ? "bg-[#00d1ff]/[0.04]" : hasVacation ? "hover:bg-white/[0.02]" : "",
                    ].join(" ")}
                  >
                    {/* Jour */}
                    <div className="flex items-center gap-3">
                      <span
                        className="h-8 w-[3px] shrink-0 rounded-full"
                        style={{
                          background: isToday ? "#00d1ff" : hasVacation ? "rgba(0,209,255,0.3)" : "rgba(255,255,255,0.05)",
                          boxShadow: isToday ? "0 0 8px #00d1ff" : "none",
                        }}
                      />
                      <div>
                        <div className={[
                          "text-sm font-black capitalize",
                          isToday ? "text-[#00d1ff]" : hasVacation ? "text-white" : "text-slate-600",
                        ].join(" ")}>
                          {dayLabel(day)}
                        </div>
                        {isToday && (
                          <div className="text-[9px] font-bold uppercase tracking-widest text-[#00d1ff]/50">
                            Aujourd&apos;hui
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Site */}
                    <div>
                      {site ? (
                        <span className="text-sm font-semibold text-slate-100">{site}</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                          No Service
                        </span>
                      )}
                    </div>

                    {/* Horaires */}
                    <div>
                      {horaires ? (
                        <span
                          className="inline-block rounded-lg border border-[#00d1ff]/20 bg-[#00d1ff]/[0.07] px-3 py-1 text-xs font-black tracking-wide text-[#00d1ff]"
                          style={{ boxShadow: "0 0 8px rgba(0,209,255,0.1)" }}
                        >
                          {horaires}
                        </span>
                      ) : (
                        <span className="text-slate-700 text-sm">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Notes Tactiques ── */}
        <div className="mt-4">
          <div
            className="overflow-hidden rounded-2xl border transition-all duration-300"
            style={{
              borderColor: note.trim() ? "rgba(0,209,255,0.4)" : "rgba(0,209,255,0.12)",
              background: "#040c14",
              boxShadow: note.trim() ? "0 0 24px rgba(0,209,255,0.1)" : "none",
            }}
          >
            {/* Header notes */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3 sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Notes / Rapport de vacation
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-widest text-slate-700">
                  Saisie libre — stockage local · Ctrl+Entrée pour sauvegarder
                </p>
              </div>
              <button
                type="button"
                disabled={!note.trim()}
                onClick={saveNote}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 disabled:cursor-default"
                style={note.trim() ? {
                  borderColor: noteSaved ? "rgba(57,255,20,0.6)" : "rgba(0,209,255,0.5)",
                  background: noteSaved ? "rgba(57,255,20,0.08)" : "rgba(0,209,255,0.08)",
                  color: noteSaved ? "#39ff14" : "#00d1ff",
                  boxShadow: noteSaved ? "0 0 14px rgba(57,255,20,0.25)" : "0 0 12px rgba(0,209,255,0.2)",
                } : {
                  borderColor: "rgba(255,255,255,0.07)",
                  background: "transparent",
                  color: "rgba(100,116,139,0.5)",
                }}
              >
                <Save className="h-3.5 w-3.5" />
                {noteSaved ? "Enregistré ✓" : "Enregistrer"}
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={note}
              onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }}
              onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") saveNote(); }}
              placeholder={"RAPPORT DE VACATION — Semaine " + getISOWeek(weekStart) + "\n\n> Incidents : ...\n> Observations : ...\n> Consignes reçues : ..."}
              rows={5}
              className="w-full resize-none bg-transparent px-5 py-4 text-sm text-slate-200 outline-none placeholder:text-slate-700 sm:px-6"
              style={{
                fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
                letterSpacing: "0.04em",
                lineHeight: "1.75",
              }}
            />
          </div>
        </div>

      </div>

      {/* ── Modal suppression ── */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 backdrop-blur-sm sm:items-center"
          role="dialog" aria-modal="true" aria-labelledby="del-title"
          onClick={(e) => e.target === e.currentTarget && !deleting && setDeleteConfirm(false)}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-red-500/30 bg-[#0f0a0a] shadow-[0_0_40px_rgba(255,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10"
                style={{ boxShadow: "0 0 20px rgba(255,0,0,0.2)" }}>
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <h2 id="del-title" className="text-center text-sm font-black uppercase tracking-widest text-white">
                Confirmer la suppression
              </h2>
              <p className="mt-2 text-center text-xs text-slate-400">
                Toutes vos vacations seront supprimées.<br />
                <span className="font-bold text-red-400">Action irréversible.</span>
              </p>
              <div className="mt-5 flex gap-3">
                <button type="button" disabled={deleting} onClick={() => setDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/5 disabled:opacity-50">
                  Annuler
                </button>
                <button type="button" disabled={deleting} onClick={() => void handleDelete()}
                  className="flex-1 rounded-xl border border-red-500/50 bg-red-500/15 py-3 text-xs font-black uppercase tracking-widest text-red-300 hover:bg-red-500/25 disabled:opacity-50"
                  style={{ boxShadow: "0 0 10px rgba(255,0,0,0.25)" }}>
                  {deleting
                    ? <span className="inline-flex items-center justify-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" />Suppression…</span>
                    : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
