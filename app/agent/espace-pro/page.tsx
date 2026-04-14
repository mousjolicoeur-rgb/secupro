"use client";

import { useRouter } from "next/navigation";

export default function EspaceProPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0F0A] flex flex-col items-center justify-center px-6">

      {/* Glow ambiance vert sapin */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,83,45,0.18) 0%, transparent 65%)" }}
        />
      </div>

      <div className="flex flex-col items-center gap-8 text-center">

        {/* Label discret */}
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
          SECUPRO — Espace Professionnel
        </p>

        {/* Titre principal */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #16a34a, transparent)" }}
          />
          <h1
            className="text-4xl sm:text-5xl font-black tracking-[0.15em] uppercase"
            style={{
              color: "#16a34a",
              textShadow: "0 0 24px rgba(22,163,74,0.7), 0 0 48px rgba(22,163,74,0.3)",
            }}
          >
            Bientôt disponible
          </h1>
          <div
            className="w-12 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #16a34a, transparent)" }}
          />
        </div>

        {/* Sous-titre */}
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest max-w-xs">
          Cette section est en cours de déploiement.<br />
          Elle sera activée très prochainement.
        </p>

        {/* Bouton retour */}
        <button
          type="button"
          onClick={() => router.push("/agent/hub")}
          className="mt-4 px-8 py-3.5 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/[0.06] transition-all duration-200 active:scale-95"
        >
          ← Retour au Hub
        </button>

      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-[9px] font-bold uppercase tracking-widest text-slate-800">
        © 2026 SECUPRO COMMAND SYSTEM
      </p>
    </div>
  );
}
