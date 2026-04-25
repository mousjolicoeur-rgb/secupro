"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface HeaderProps {
  onReset: () => void;
}

export function Header({ onReset }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
      style={{
        background: "rgba(11,20,38,0.96)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(0,255,204,0.08)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
      }}>

      {/* Gauche — retour */}
      <button
        type="button"
        onClick={() => router.push("/espace-societe")}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] transition-colors duration-150"
        style={{ color:"rgba(148,163,184,0.4)" }}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#00FFCC")}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.4)")}>
        <ArrowLeft size={11} /> Retour
      </button>

      {/* Centre — branding */}
      <div className="flex items-center gap-3">
        <Image src="/secupro-logo-official.png" alt="SecuPRO" width={28} height={28}
          style={{ filter:"drop-shadow(0 0 8px rgba(0,255,204,0.5))" }} />
        <div>
          <p className="text-[7px] font-black uppercase tracking-[0.55em]"
            style={{ color:"rgba(0,255,204,0.4)" }}>
            SecuPRO Command Center
          </p>
          <h1 className="text-[13px] font-black leading-none tracking-tight text-white">
            DASHBOARD EXPLOITATION
          </h1>
        </div>
      </div>

      {/* Droite — code + statut */}
      <div className="flex items-center gap-3">
        {/* Code Agent */}
        <div className="flex flex-col items-end">
          <span className="text-[7px] font-black uppercase tracking-[0.3em]"
            style={{ color:"rgba(0,255,204,0.35)" }}>
            Code Agent
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background:"rgba(0,255,204,0.06)", border:"1px solid rgba(0,255,204,0.2)",
              boxShadow:"0 0 10px rgba(0,255,204,0.08)" }}>
            <span className="text-[12px] font-black font-mono tracking-[0.25em]"
              style={{ color:"#00FFCC", textShadow:"0 0 8px rgba(0,255,204,0.6)" }}>
              724839
            </span>
          </div>
        </div>

        {/* Statut En direct */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
          style={{ background:"rgba(0,255,204,0.06)", border:"1px solid rgba(0,255,204,0.18)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background:"#00FFCC", boxShadow:"0 0 6px #00FFCC" }} />
          <span className="text-[8px] font-black uppercase tracking-[0.22em]"
            style={{ color:"rgba(0,255,204,0.75)" }}>
            En direct
          </span>
        </div>

        {/* Reset discret */}
        <button
          onClick={onReset}
          title="Réinitialiser (efface le localStorage)"
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150"
          style={{ color:"rgba(148,163,184,0.2)", border:"1px solid rgba(255,255,255,0.04)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#f87171")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.2)")}>
          <RefreshCw size={11} />
        </button>
      </div>
    </header>
  );
}
