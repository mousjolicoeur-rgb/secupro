"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getEntrepriseId } from "@/lib/agentSession";
import { isAuthenticatedClient } from "@/lib/authClient";

type PlanningRow = Record<string, unknown> & { id?: string };

function cellStr(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "string") return v.trim() || "—";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "—";
}

function rowDate(r: PlanningRow): string {
  const raw =
    r.date ??
    r.jour ??
    r.shift_date ??
    r.date_debut ??
    r.start_at ??
    r.created_at;
  if (typeof raw === "string") {
    const d = new Date(raw);
    return Number.isNaN(d.getTime())
      ? raw
      : d.toLocaleDateString("fr-FR", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  }
  return "—";
}

function rowSite(r: PlanningRow): string {
  return cellStr(r.site ?? r.lieu ?? r.location ?? r.nom_site);
}

function rowHoraires(r: PlanningRow): string {
  const h = r.horaires ?? r.creneau ?? r.plage_horaire;
  if (typeof h === "string" && h.trim()) return h.trim();
  const deb = r.heure_debut ?? r.start_time;
  const fin = r.heure_fin ?? r.end_time;
  if (typeof deb === "string" || typeof fin === "string") {
    return `${cellStr(deb)} – ${cellStr(fin)}`
      .replace(/–\s*—$/, "")
      .replace(/^—\s*–/, "—");
  }
  return "—";
}

export default function AgentPlanningPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<PlanningRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pointerId, setPointerId] = useState<string | null>(null);
  const [monthCursor, setMonthCursor] = useState(() => new Date());

  const monthLabel = useMemo(
    () =>
      monthCursor.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      }),
    [monthCursor]
  );

  const y = monthCursor.getFullYear();
  const m = monthCursor.getMonth();

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const raw = (r.date ??
        r.jour ??
        r.shift_date ??
        r.date_debut ??
        r.start_at ??
        r.created_at) as string | undefined;
      if (!raw || typeof raw !== "string") return true;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return true;
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }, [rows, y, m]);

  const loadPlanning = useCallback(async (entrepriseId: string) => {
    setLoading(true);
    setLoadErr(null);
    const { data, error } = await supabase
      .from("planning")
      .select("*")
      .eq("entreprise_id", entrepriseId)
      .order("created_at", { ascending: false });

    if (error) {
      setLoadErr(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as PlanningRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    void (async () => {
      if (!(await isAuthenticatedClient())) {
        router.replace("/agent/login");
        return;
      }
      const eid = getEntrepriseId();
      if (!eid) {
        router.replace("/agent/espace-pro");
        return;
      }
      await loadPlanning(eid);
      setReady(true);

      // — Realtime : recharge automatique à chaque mutation sur planning —
      channel = supabase
        .channel(`planning-entreprise-${eid}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "planning",
            filter: `entreprise_id=eq.${eid}`,
          },
          () => {
            void loadPlanning(eid);
          }
        )
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR" && err) {
            console.error("[Planning] Realtime:", err);
          }
        });
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [router, loadPlanning]);

  async function onPointer(row: PlanningRow) {
    const id = typeof row.id === "string" ? row.id : null;
    if (!id) return;
    setPointerId(id);
    try {
      let { error } = await supabase
        .from("planning")
        .update({
          statut: "POINTE",
          pointe_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) {
        ({ error } = await supabase
          .from("planning")
          .update({ statut: "POINTE" })
          .eq("id", id));
      }
      if (error) {
        alert(`Impossible d'enregistrer le pointage : ${error.message}`);
        return;
      }
      const eid = getEntrepriseId();
      if (eid) void loadPlanning(eid);
    } finally {
      setPointerId(null);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A12] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#00d1ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-sky-950/20 to-transparent" />
      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/agent/hub"
              className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Hub
            </Link>
            <div className="flex items-center gap-2 text-[#00d1ff]">
              <CalendarDays className="h-6 w-6" />
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Planning</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Vacations et créneaux — Date, site et horaires.
            </p>
          </div>

          {/* Navigateur mois */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2 py-1">
            <button
              type="button"
              aria-label="Mois précédent"
              className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              onClick={() => setMonthCursor(new Date(y, m - 1, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-[10rem] px-2 text-center text-xs font-bold uppercase tracking-widest text-[#00d1ff]">
              {monthLabel}
            </span>
            <button
              type="button"
              aria-label="Mois suivant"
              className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              onClick={() => setMonthCursor(new Date(y, m + 1, 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loadErr ? (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
            Lecture planning : {loadErr}. Vérifiez la table{" "}
            <code className="text-amber-200">planning</code> et les droits RLS.
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-[#00d1ff]/20 bg-white/[0.03] backdrop-blur-md">
          <div className="border-b border-white/10 px-4 py-3 sm:px-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Calendrier des vacations
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/30 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="px-4 py-3 sm:px-6">Date</th>
                  <th className="px-4 py-3 sm:px-6">Site</th>
                  <th className="px-4 py-3 sm:px-6">Horaires</th>
                  <th className="px-4 py-3 text-right sm:px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#00d1ff]" />
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      Aucune vacation pour ce mois.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const id = typeof row.id === "string" ? row.id : "";
                    const statut = cellStr(row.statut);
                    const done = /pointe|valid|confirm/i.test(statut);
                    return (
                      <tr
                        key={id || JSON.stringify(row)}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-4 font-medium text-slate-100 sm:px-6">
                          {rowDate(row)}
                        </td>
                        <td className="px-4 py-4 text-slate-300 sm:px-6">{rowSite(row)}</td>
                        <td className="px-4 py-4 text-slate-300 sm:px-6">{rowHoraires(row)}</td>
                        <td className="px-4 py-4 text-right sm:px-6">
                          {id ? (
                            <button
                              type="button"
                              disabled={done || pointerId === id}
                              onClick={() => void onPointer(row)}
                              className="rounded-lg border border-[#00d1ff]/50 bg-[#00d1ff]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#00d1ff] transition hover:bg-[#00d1ff]/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {pointerId === id ? "…" : done ? "Pointé" : "Pointer"}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
