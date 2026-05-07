"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";

const CYAN = "#00d1ff";
const NAVY = "#0B1426";

export default function EspaceSocieteAgentsPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{
        background: `radial-gradient(ellipse 100% 50% at 50% 0%, rgba(0,40,90,0.35) 0%, ${NAVY} 55%)`,
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <button
        type="button"
        onClick={() => router.push("/espace-societe/dashboard")}
        className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.22em]"
        style={{ color: "rgba(148,163,184,0.6)", background: "none", border: "none", cursor: "pointer" }}
      >
        <ArrowLeft size={12} /> Dashboard
      </button>

      <div className="max-w-lg mx-auto rounded-2xl p-8 text-center"
        style={{
          background: "rgba(10,20,44,0.85)",
          border: "1px solid rgba(0,209,255,0.12)",
        }}>
        <Upload size={28} className="mx-auto mb-4" style={{ color: CYAN }} />
        <h1 className="text-xl font-black mb-2">Importer mes agents</h1>
        <p className="text-[13px] mb-6" style={{ color: "rgba(148,163,184,0.65)" }}>
          Le module d&apos;import CSV / provisionnement sera relié ici. En attendant,
          utilisez le flux depuis le portail SecuPRO Business ou contactez le support.
        </p>
        <button
          type="button"
          onClick={() => router.push("/espace-societe/dashboard")}
          className="rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em]"
          style={{ background: CYAN, color: NAVY, border: "none", cursor: "pointer" }}
        >
          Retour au dashboard
        </button>
      </div>
    </div>
  );
}
