"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  getEntrepriseId,
  LS_ENTREPRISE_NOM,
} from "@/lib/agentSession";
import { isAuthenticatedClient } from "@/lib/authClient";
import AgentTopBar from "@/components/AgentTopBar";
import { getTheme, onThemeChange } from "@/lib/theme";

type Vacation = {
  id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  poste: string;
  statut: string;
};

type Filter = "all" | "today" | "week" | "month";

function isToday(d: string) {
  return new Date(d).toDateString() === new Date().toDateString();
}
function isThisWeek(d: string) {
  const date = new Date(d);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return date >= start && date <= end;
}
function isThisMonth(d: string) {
  const date = new Date(d);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

const STATUT_COLORS: Record<string, string> = {
  confirmé: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  planifié: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  annulé: "text-red-400 bg-red-400/10 border-red-400/30",
};

export default function PlanningPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"nocturne" | "normal">("nocturne");
  const [agentName, setAgentName] = useState("");
  const [nom, setNom] = useState("");
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: "",
    heure_debut: "",
    heure_fin: "",
    poste: "",
    statut: "planifié",
  });

  const fetchVacations = useCallback(async () => {
    const id = getEntrepriseId();
    if (!id) return;
    setLoading(true);
    const { data } = await supabase
      .from("vacations")
      .select("*")
      .eq("entreprise_id", id)
      .order("date", { ascending: true });
    setVacations((data as Vacation[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      if (!(await isAuthenticatedClient())) { router.replace("/"); return; }
      if (!getEntrepriseId()) { router.replace("/agent/code"); return; }
      setAgentName(localStorage.getItem("secupro_agent_display_name") || "Agent");
      setNom(localStorage.getItem(LS_ENTREPRISE_NOM) || "");
      setTheme(getTheme());
      unsub = onThemeChange(() => setTheme(getTheme()));
      setReady(true);
      await fetchVacations();
    })();
    return () => unsub();
  }, [router, fetchVacations]);

  const handleAdd = async () => {
    if (!form.date || !form.heure_debut || !form.heure_fin || !form.poste) return;
    setSaving(true);
    await supabase.from("vacations").insert([{
      ...form,
      entreprise_id: getEntrepriseId(),
    }]);
    setShowForm(false);
    setForm({ date: "", heure_debut: "", heure_fin: "", poste: "", statut: "planifié" });
    await fetchVacations();
    setSaving(false);
  };

  const filtered = vacations.filter((v) => {
    if (filter === "today") return isToday(v.date);
    if (filter === "week") return isThisWeek(v.date);
    if (filter === "month") return isThisMonth(v.date);
    return true;
  });

  const isNormal = theme === "normal";
  const bg = isNormal ? "bg-[#F8FAFC] text-[#1E293B]" : "bg-[#050A12] text-white";
  const card = isNormal
    ? "bg-white border-slate-200 shadow-sm"
    : "bg-white/[0.035] border-cyan-400/15";
  const input = isNormal
    ? "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500"
    : "bg-white/[0.05] border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-400";

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050A12] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest uppercase">Chargement…</p>
      </div>
    );
  }

  return (
    <div className={["min-h-screen font-sans", bg].join(" ")}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 py-6 md:px-8 md:py-10">
        <AgentTopBar title="SECUPRO / PLANNING" subtitle={`ENTREPRISE: ${nom}`} agentName={agentName} theme={theme} />

        {/* Back + Add */}
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/agent/activate")}
            className={["inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest border transition-colors",
              isNormal ? "bg-white border-slate-200 text-slate-700" : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]",
            ].join(" ")}
          >
            <ArrowLeft className="h-4 w-4" /> Hub
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest bg-cyan-500 text-[#050A12] hover:bg-cyan-400 transition-colors"
          >
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {(["all", "today", "week", "month"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={["px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border",
                filter === f
                  ? "bg-cyan-500 text-[#050A12] border-cyan-500"
                  : isNormal
                    ? "bg-white border-slate-200 text-slate-600"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-cyan-400/40",
              ].join(" ")}
            >
              {f === "all" ? "Tous" : f === "today" ? "Aujourd'hui" : f === "week" ? "Cette semaine" : "Ce mois"}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Calendar className="h-12 w-12 text-slate-700" />
              <p className="text-slate-500 text-sm">Aucune vacation pour cette période</p>
            </div>
          ) : (
            filtered.map((v) => {
              const statutStyle = STATUT_COLORS[v.statut] || "text-slate-400 bg-slate-400/10 border-slate-400/30";
              const dateStr = new Date(v.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
              return (
                <div key={v.id} className={["rounded-3xl border backdrop-blur-xl p-5 transition-all", card].join(" ")}>
                  <div className="flex items-start justify-between gap-3">
                    <p className={["font-black text-sm tracking-tight", isNormal ? "text-slate-800" : "text-white"].join(" ")}>{v.poste}</p>
                    <span className={["text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest whitespace-nowrap", statutStyle].join(" ")}>
                      {v.statut}
                    </span>
                  </div>
                  <p className="mt-2 text-cyan-400 text-xs font-semibold capitalize">{dateStr}</p>
                  <p className="mt-1 text-slate-500 text-xs">{v.heure_debut} → {v.heure_fin}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className={["w-full max-w-sm rounded-3xl border p-6 space-y-4", isNormal ? "bg-white border-slate-200" : "bg-[#0A1828] border-white/10"].join(" ")}>
            <h2 className={["font-black text-lg uppercase tracking-wider", isNormal ? "text-slate-800" : "text-white"].join(" ")}>Nouvelle Vacation</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Poste (ex: Vigile accueil)" value={form.poste}
                onChange={(e) => setForm({ ...form, poste: e.target.value })}
                className={["w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")} />
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={["w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")} />
              <div className="flex gap-3">
                <input type="time" value={form.heure_debut}
                  onChange={(e) => setForm({ ...form, heure_debut: e.target.value })}
                  className={["flex-1 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")} />
                <input type="time" value={form.heure_fin}
                  onChange={(e) => setForm({ ...form, heure_fin: e.target.value })}
                  className={["flex-1 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")} />
              </div>
              <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}
                className={["w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")}>
                <option value="planifié">Planifié</option>
                <option value="confirmé">Confirmé</option>
                <option value="annulé">Annulé</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className={["flex-1 py-3 rounded-2xl border text-sm font-bold uppercase tracking-wider transition-all active:scale-95", isNormal ? "border-slate-200 text-slate-600" : "border-white/10 text-slate-400"].join(" ")}>
                Annuler
              </button>
              <button type="button" onClick={handleAdd} disabled={saving || !form.date || !form.poste}
                className="flex-1 py-3 rounded-2xl bg-cyan-500 text-[#050A12] text-sm font-black uppercase tracking-wider disabled:opacity-50 active:scale-95 transition-all">
                {saving ? "…" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
