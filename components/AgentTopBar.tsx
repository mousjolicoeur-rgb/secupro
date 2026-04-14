"use client";

import AgentAvatar from "@/components/AgentAvatar";
import { Moon, Sun, Crown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AgentTopBar(props: {
  title: string;
  subtitle?: string;
  subtitleClassName?: string;
  agentName: string;
  rightStatus?: boolean;
  theme?: "nocturne" | "normal";
  onToggleTheme?: () => void;
}) {
  const isNormal = props.theme === "normal";

  return (
    <div
      className={[
        "flex items-center justify-between gap-4 rounded-3xl border backdrop-blur-md p-4 mb-6 transition-all duration-300",
        isNormal
          ? "border-slate-200 bg-white/80 shadow-sm"
          : "border-cyan-400/15 bg-white/[0.04] shadow-[0_0_40px_rgba(34,211,238,0.05)]",
      ].join(" ")}
    >
      {/* SECTION GAUCHE : Logo + Titres */}
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src="/secupro-logo-official.png"
          alt="SecuPRO"
          width={36}
          height={36}
          className="shrink-0"
          priority
        />
        <div className="w-px h-8 shrink-0 opacity-20" style={{ background: "currentColor" }} />
        <div className="min-w-0">
          <div
            className={[
              "text-lg font-black uppercase tracking-tight truncate",
              isNormal ? "text-slate-900" : "text-white",
            ].join(" ")}
          >
            {props.title}
          </div>
          {props.subtitle && (
            <div
              className={[
                "text-[10px] font-medium uppercase tracking-widest opacity-60 truncate",
                props.subtitleClassName || (isNormal ? "text-slate-500" : "text-cyan-400"),
              ].join(" ")}
            >
              {props.subtitle}
            </div>
          )}
        </div>
      </div>

      {/* SECTION DROITE : Boutons et Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* 🔥 BOUTON PREMIUM STRATÉGIQUE */}
        <Link 
          href="/abonnement" 
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95 transition-all group"
        >
          <Crown size={14} className="text-black fill-black" />
          <span className="hidden sm:inline text-[10px] font-black text-black uppercase tracking-tighter">
            Premium
          </span>
        </Link>

        {/* BOUTON THÈME */}
        <button
          onClick={props.onToggleTheme}
          className={[
            "p-2 rounded-xl border transition-all hover:scale-110",
            isNormal 
              ? "bg-slate-100 border-slate-200 text-slate-600" 
              : "bg-white/[0.05] border-white/10 text-cyan-400"
          ].join(" ")}
        >
          {isNormal ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* AVATAR AGENT */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <div className="hidden text-right sm:block">
            <div className={["text-[10px] font-bold uppercase", isNormal ? "text-slate-900" : "text-white"].join(" ")}>
              {props.agentName}
            </div>
            <div className="text-[8px] text-green-400 font-bold uppercase flex items-center justify-end gap-1">
              <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
              Opérationnel
            </div>
          </div>
          <AgentAvatar />
        </div>
      </div>
    </div>
  );
}