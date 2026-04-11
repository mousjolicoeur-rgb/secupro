"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Banknote } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getEntrepriseId, LS_ENTREPRISE_NOM } from "@/lib/agentSession";
import { isAuthenticatedClient } from "@/lib/authClient";
import AgentTopBar from "@/components/AgentTopBar";
import { getTheme, onThemeChange } from "@/lib/theme";

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
  if (n == null) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";
}

export default function PaiePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"nocturne" | "normal">("nocturne");
  const [agentName, setAgentName] = useState("");
  const [nom, setNom] = useState("");
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ mois: "", salaire_brut: "", salaire_net: "", heures_effectuees: "" });

  const fetchFiches = useCallback(async () => {
    const id = getEntrepriseId();
    if (!id) return;
    setLoading(true);
    const { data } = await supabase
      .from("fiches_paie")
      .select("*")
      .eq("entreprise_id", id)
      .order("created_at", { ascending: false });
    setFiches((data as Fiche[]) || []);
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
      await fetchFiches();
    })();
    return () => unsub();
  }, [router, fetchFiches]);

  const handleAdd = async () => {
    if (!form.mois || !form.salaire_net) return;
    setSaving(true);
    await supabase.from("fiches_paie").insert([{
      mois: form.mois,
      salaire_brut: parseFloat(form.salaire_brut) || null,
      salaire_net: parseFloat(form.salaire_net) || null,
      heures_effectuees: parseFloat(form.heures_effectuees) || null,
      entreprise_id: getEntrepriseId(),
    }]);
    setShowForm(false);
    setForm({ mois: "", salaire_brut: "", salaire_net: "", heures_effectuees: "" });
    await fetchFiches();
    setSaving(false);
  };

  const latest = fiches[0] ?? null;
  const heuresPct = latest?.heures_effectuees
    ? Math.min(100, Math.round((latest.heures_effectuees / HEURES_CONTRAT) * 100))
    : 0;

  const isNormal = theme === "normal";
  const bg = isNormal ? "bg-[#F8FAFC] text-[#1E293B]" : "bg-[#050A12] text-white";
  const card = isNormal ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.035] border-cyan-400/15";
  const input = isNormal
    ? "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500"
    : "bg-white/[0.05] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-400";

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050A12] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest uppercase">Chargement…</p>
      </div>
    );
  }

  return (
    <div className={["min-h-screen font-sans pb-10", bg].join(" ")}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 py-6 md:px-8 md:py-10">
        <AgentTopBar title="SECUPRO / PAIE" subtitle={`ENTREPRISE: ${nom}`} agentName={agentName} theme={theme} />

        {/* Back */}
        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={() => router.push("/agent/activate")}
            className={["inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest border transition-colors",
              isNormal ? "bg-white border-slate-200 text-slate-700" : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]",
            ].join(" ")}>
            <ArrowLeft className="h-4 w-4" /> Hub
          </button>
          <button type="button" onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest bg-emerald-500 text-[#050A12] hover:bg-emerald-400 transition-colors">
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>

        {/* Hero card */}
        <div className={["mt-6 rounded-3xl border p-6", isNormal ? "bg-emerald-50 border-emerald-200" : "bg-emerald-500/[0.07] border-emerald-400/20 shadow-[0_0_40px_rgba(52,211,153,0.08)]"].join(" ")}>
          <p className="text-emerald-600 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Salaire net estimé</p>
          <p className={["text-4xl font-black", isNormal ? "text-slate-800" : "text-white"].join(" ")}>{fmt(latest?.salaire_net ?? null)}</p>
          <p className="text-slate-500 text-xs mt-1">Brut : {fmt(latest?.salaire_brut ?? null)}</p>

          <div className="mt-4">
            <div className={["w-full h-2 rounded-full overflow-hidden", isNormal ? "bg-emerald-100" : "bg-white/10"].join(" ")}>
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${heuresPct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
              <span>{latest?.heures_effectuees ?? 0}h effectuées</span>
              <span>{HEURES_CONTRAT}h contractuelles</span>
            </div>
          </div>

          {latest?.mois && (
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-3 font-bold">{latest.mois}</p>
          )}
        </div>

        {/* Historique */}
        <p className={["mt-7 mb-3 text-[10px] font-black uppercase tracking-[0.3em]", isNormal ? "text-slate-400" : "text-slate-600"].join(" ")}>Historique des fiches</p>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : fiches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Banknote className="h-12 w-12 text-slate-700" />
            <p className="text-slate-500 text-sm">Aucune fiche de paie</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fiches.map((f) => (
              <div key={f.id} className={["rounded-3xl border backdrop-blur-xl p-5 flex items-center justify-between", card].join(" ")}>
                <div>
                  <p className={["font-black text-sm", isNormal ? "text-slate-800" : "text-white"].join(" ")}>{f.mois}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{f.heures_effectuees ? `${f.heures_effectuees}h` : "—"} effectuées</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-black text-base">{fmt(f.salaire_net)}</p>
                  <p className="text-slate-600 text-[10px] mt-0.5">Brut {fmt(f.salaire_brut)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className={["w-full max-w-sm rounded-3xl border p-6 space-y-4", isNormal ? "bg-white border-slate-200" : "bg-[#0A1828] border-white/10"].join(" ")}>
            <h2 className={["font-black text-lg uppercase tracking-wider", isNormal ? "text-slate-800" : "text-white"].join(" ")}>Nouvelle Fiche</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Mois (ex: Mars 2025)" value={form.mois}
                onChange={(e) => setForm({ ...form, mois: e.target.value })}
                className={["w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")} />
              <div className="flex gap-3">
                <input type="number" placeholder="Brut (€)" value={form.salaire_brut}
                  onChange={(e) => setForm({ ...form, salaire_brut: e.target.value })}
                  className={["flex-1 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")} />
                <input type="number" placeholder="Net (€) *" value={form.salaire_net}
                  onChange={(e) => setForm({ ...form, salaire_net: e.target.value })}
                  className={["flex-1 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")} />
              </div>
              <input type="number" placeholder="Heures effectuées" value={form.heures_effectuees}
                onChange={(e) => setForm({ ...form, heures_effectuees: e.target.value })}
                className={["w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className={["flex-1 py-3 rounded-2xl border text-sm font-bold uppercase tracking-wider active:scale-95", isNormal ? "border-slate-200 text-slate-600" : "border-white/10 text-slate-400"].join(" ")}>
                Annuler
              </button>
              <button type="button" onClick={handleAdd} disabled={saving || !form.mois || !form.salaire_net}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 text-[#050A12] text-sm font-black uppercase tracking-wider disabled:opacity-50 active:scale-95 transition-all">
                {saving ? "…" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
