"use client";

import { useRouter } from "next/navigation";
import { Building2, ArrowLeft, MessageSquare } from "lucide-react";

export default function EspaceSocietePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">

      {/* Glow ambiance */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%)" }}
        />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* ── ICÔNE ── */}
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)" }}
        >
          <Building2 size={28} style={{ color: "#2563eb" }} />
        </div>

        {/* ── TITRE ── */}
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tighter select-none leading-none">
            <span
              style={{
                color: "#2563eb",
                textShadow:
                  "0 0 28px rgba(37,99,235,0.9), 0 0 60px rgba(37,99,235,0.45)",
              }}
            >
              SECUPRO
            </span>{" "}
            <span className="text-white">BUSINESS</span>
          </h1>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">
            Espace réservé aux entreprises de sécurité
          </p>
        </div>

        {/* ── Séparateur ── */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-600/25 to-transparent" />

        {/* ── MESSAGE ── */}
        <div
          className="w-full rounded-2xl px-6 py-5"
          style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.18)" }}
        >
          <p className="text-white/80 text-sm leading-relaxed text-center font-semibold">
            Cet espace est réservé aux entreprises de sécurité.
          </p>
          <p className="mt-2 text-slate-500 text-xs leading-relaxed text-center">
            Il est actuellement en cours d&apos;optimisation pour vos besoins de gestion.
            Pour toute demande d&apos;information ou ouverture de compte entreprise,
            veuillez contacter notre support.
          </p>
        </div>

        {/* ── CTA SUPPORT ── */}
        <button
          onClick={() => router.push("/agent/support")}
          className="group relative overflow-hidden w-full rounded-2xl py-4 px-6 flex items-center justify-center gap-3 font-black text-sm uppercase tracking-[0.2em] text-white transition-all duration-200 active:scale-[0.98]"
          style={{
            background: "#2563eb",
            boxShadow: "0 0 24px rgba(37,99,235,0.45), 0 4px 16px rgba(37,99,235,0.25)",
          }}
        >
          <span
            className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-500 group-hover:translate-x-full"
            aria-hidden
          />
          <MessageSquare size={16} />
          Contacter le Support
        </button>

        {/* ── RETOUR ── */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-700 hover:text-slate-500 transition-colors"
        >
          <ArrowLeft size={11} /> Retour à l&apos;accueil
        </button>

        {/* ── Footer ── */}
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-800 -mt-4">
          © 2026 SECUPRO COMMAND SYSTEM
        </p>

      </div>
    </div>
  );
}
