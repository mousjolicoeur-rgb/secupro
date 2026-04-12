"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { checkActivationCode } from "@/services/entrepriseService";
import { LS_ENTREPRISE_ID, LS_ENTREPRISE_NOM } from "@/lib/agentSession";

export default function AgentActivation() {
  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const router = useRouter();

  const handleActivation = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError("");

    const entreprise = await checkActivationCode(code.toUpperCase());

    if (entreprise) {
      localStorage.setItem(LS_ENTREPRISE_ID, entreprise.id);
      localStorage.setItem(LS_ENTREPRISE_NOM, entreprise.nom);
      router.push("/agent/mission");
    } else {
      setError("Code invalide — contactez votre centre de contrôle.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">

      {/* ── Glow ambiance ── */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="w-full max-w-xs flex flex-col items-center gap-8">

        {/* ── TITRE ── */}
        <h1 className="text-6xl font-black tracking-tighter select-none">
          <span
            style={{
              color: "#2563eb",
              textShadow:
                "0 0 28px rgba(37,99,235,0.9), 0 0 60px rgba(37,99,235,0.5), 0 0 100px rgba(37,99,235,0.2)",
            }}
          >
            SECUPRO
          </span>{" "}
          <span style={{ color: "#ffffff" }}>PRO</span>
        </h1>

        {/* ── CHAMP DE SAISIE ── */}
        <div className="w-full flex flex-col items-center gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && void handleActivation()}
            placeholder="Enter your company code..."
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="w-full rounded-2xl border bg-black px-5 py-5 text-center font-mono text-2xl tracking-[0.5em] text-white outline-none transition-all duration-200 placeholder:text-slate-700 placeholder:text-sm placeholder:tracking-normal"
            style={{
              borderColor: error
                ? "rgba(239,68,68,0.5)"
                : code
                ? "rgba(37,99,235,0.65)"
                : "rgba(255,255,255,0.08)",
              boxShadow: code && !error
                ? "0 0 18px rgba(37,99,235,0.18), inset 0 0 16px rgba(37,99,235,0.05)"
                : "none",
              caretColor: "#2563eb",
            }}
          />

          {/* Erreur */}
          {error && (
            <p className="text-red-400 text-[11px] font-bold tracking-wide text-center">
              {error}
            </p>
          )}

          {/* ── BOUTON START MISSION ── */}
          <button
            type="button"
            onClick={() => void handleActivation()}
            disabled={loading || !code.trim()}
            className="relative overflow-hidden w-full rounded-xl py-4 font-black text-sm uppercase tracking-[0.25em] text-white transition-all duration-200 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background: "#2563eb",
              boxShadow: code.trim() && !loading
                ? "0 0 24px rgba(37,99,235,0.55), 0 4px 16px rgba(37,99,235,0.3)"
                : "none",
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/15 transition-transform duration-500 group-hover:translate-x-full"
              aria-hidden="true"
            />
            {loading ? (
              <Loader2 size={18} className="animate-spin mx-auto" />
            ) : (
              "START MISSION"
            )}
          </button>
        </div>

        {/* ── RETOUR AU HUB ── */}
        <button
          type="button"
          onClick={() => router.push("/agent/hub")}
          className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-700 hover:text-slate-500 transition-colors mt-4"
        >
          ← RETOUR AU HUB
        </button>

        {/* ── FOOTER ── */}
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-800 mt-2">
          © 2026 SECUPRO COMMAND SYSTEM
        </p>

      </div>
    </div>
  );
}
