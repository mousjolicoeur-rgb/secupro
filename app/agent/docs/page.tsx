"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getEntrepriseId, LS_ENTREPRISE_NOM } from "@/lib/agentSession";
import { isAuthenticatedClient } from "@/lib/authClient";
import AgentTopBar from "@/components/AgentTopBar";
import { getTheme, onThemeChange } from "@/lib/theme";

type Document = {
  id: string;
  nom: string;
  type: string;
  expiration: string | null;
  created_at: string;
};

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  carte_pro: { label: "Carte Pro CNAPS", icon: "🪪", color: "text-violet-400 bg-violet-400/10 border-violet-400/30" },
  diplome:   { label: "Diplôme / SST",   icon: "🎓", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" },
  contrat:   { label: "Contrat",          icon: "📄", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  autre:     { label: "Autre",            icon: "📎", color: "text-slate-400 bg-slate-400/10 border-slate-400/30" },
};

function isExpired(d: string | null) { return !!d && new Date(d).getTime() < Date.now(); }
function expiresSoon(d: string | null) {
  if (!d) return false;
  const diff = new Date(d).getTime() - Date.now();
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 60;
}

export default function DocsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"nocturne" | "normal">("nocturne");
  const [agentName, setAgentName] = useState("");
  const [nom, setNom] = useState("");
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nom: "", type: "carte_pro", expiration: "" });

  const fetchDocs = useCallback(async () => {
    const id = getEntrepriseId();
    if (!id) return;
    setLoading(true);
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("entreprise_id", id)
      .order("created_at", { ascending: false });
    setDocs((data as Document[]) || []);
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
      await fetchDocs();
    })();
    return () => unsub();
  }, [router, fetchDocs]);

  const handleAdd = async () => {
    if (!form.nom) return;
    setSaving(true);
    await supabase.from("documents").insert([{
      nom: form.nom,
      type: form.type,
      expiration: form.expiration || null,
      entreprise_id: getEntrepriseId(),
      url: "",
    }]);
    setShowForm(false);
    setForm({ nom: "", type: "carte_pro", expiration: "" });
    await fetchDocs();
    setSaving(false);
  };

  const isNormal = theme === "normal";
  const bg = isNormal ? "bg-[#F8FAFC] text-[#1E293B]" : "bg-[#050A12] text-white";
  const card = isNormal ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.035] border-cyan-400/15";
  const input = isNormal
    ? "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-violet-500"
    : "bg-white/[0.05] border-white/10 text-white placeholder:text-slate-600 focus:border-violet-400";

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050A12] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest uppercase">Chargement…</p>
      </div>
    );
  }

  const hasAlert = docs.some((d) => isExpired(d.expiration) || expiresSoon(d.expiration));

  return (
    <div className={["min-h-screen font-sans pb-10", bg].join(" ")}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 py-6 md:px-8 md:py-10">
        <AgentTopBar title="SECUPRO / DOCUMENTS" subtitle={`ENTREPRISE: ${nom}`} agentName={agentName} theme={theme} />

        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={() => router.push("/agent/activate")}
            className={["inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest border transition-colors",
              isNormal ? "bg-white border-slate-200 text-slate-700" : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"].join(" ")}>
            <ArrowLeft className="h-4 w-4" /> Hub
          </button>
          <button type="button" onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest bg-violet-500 text-white hover:bg-violet-400 transition-colors">
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>

        {hasAlert && (
          <div className="mt-5 rounded-2xl bg-amber-400/10 border border-amber-400/30 p-4 flex items-center gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <p className="text-amber-300 text-xs font-bold">Un ou plusieurs documents arrivent à expiration — pensez à les renouveler.</p>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FolderOpen className="h-12 w-12 text-slate-700" />
              <p className="text-slate-500 text-sm">Aucun document ajouté</p>
              <p className="text-slate-600 text-xs text-center">Carte Pro CNAPS, diplômes, contrats…</p>
            </div>
          ) : (
            docs.map((d) => {
              const meta = TYPE_META[d.type] || TYPE_META.autre;
              const expired = isExpired(d.expiration);
              const soon = expiresSoon(d.expiration);
              return (
                <div key={d.id} className={["rounded-3xl border backdrop-blur-xl p-5", card].join(" ")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta.icon}</span>
                      <p className={["font-black text-sm", isNormal ? "text-slate-800" : "text-white"].join(" ")}>{d.nom}</p>
                    </div>
                    <span className={["text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest whitespace-nowrap", meta.color].join(" ")}>
                      {meta.label}
                    </span>
                  </div>
                  {d.expiration && (
                    <p className={["text-xs font-semibold mt-2", expired ? "text-red-400" : soon ? "text-amber-400" : "text-slate-500"].join(" ")}>
                      {expired ? "⛔ Expiré le" : soon ? "⚠️ Expire le" : "Valide jusqu'au"}{" "}
                      {new Date(d.expiration).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className={["w-full max-w-sm rounded-3xl border p-6 space-y-4", isNormal ? "bg-white border-slate-200" : "bg-[#0A1828] border-white/10"].join(" ")}>
            <h2 className={["font-black text-lg uppercase tracking-wider", isNormal ? "text-slate-800" : "text-white"].join(" ")}>Nouveau Document</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Nom du document" value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className={["w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")} />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={["w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")}>
                <option value="carte_pro">Carte Pro CNAPS</option>
                <option value="diplome">Diplôme / SST</option>
                <option value="contrat">Contrat</option>
                <option value="autre">Autre</option>
              </select>
              <div>
                <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Date d'expiration (optionnel)</label>
                <input type="date" value={form.expiration}
                  onChange={(e) => setForm({ ...form, expiration: e.target.value })}
                  className={["w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", input].join(" ")} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className={["flex-1 py-3 rounded-2xl border text-sm font-bold uppercase tracking-wider active:scale-95", isNormal ? "border-slate-200 text-slate-600" : "border-white/10 text-slate-400"].join(" ")}>
                Annuler
              </button>
              <button type="button" onClick={handleAdd} disabled={saving || !form.nom}
                className="flex-1 py-3 rounded-2xl bg-violet-500 text-white text-sm font-black uppercase tracking-wider disabled:opacity-50 active:scale-95 transition-all">
                {saving ? "…" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
