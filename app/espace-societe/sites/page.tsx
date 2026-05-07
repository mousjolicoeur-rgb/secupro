"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

const CYAN = "#00d1ff";
const NAVY = "#0B1426";

export default function EspaceSocieteSitesPage() {
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
        <MapPin size={28} className="mx-auto mb-4" style={{ color: CYAN }} />
        <h1 className="text-xl font-black mb-2">Configurer mes sites</h1>
        <p className="text-[13px] mb-6" style={{ color: "rgba(148,163,184,0.65)" }}>
          La gestion des sites et postes sera disponible ici. Revenez au dashboard pour
          suivre votre onboarding ou contactez le support pour un accompagnement.
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
