"use client";
import type { ReactNode } from "react";

const VARIANTS = {
  success: { color:"#00FFCC", bg:"rgba(0,255,204,0.07)", border:"rgba(0,255,204,0.22)", glow:"rgba(0,255,204,0.15)" },
  danger:  { color:"#f87171", bg:"rgba(248,113,113,0.07)", border:"rgba(248,113,113,0.22)", glow:"rgba(248,113,113,0.15)" },
  warning: { color:"#FFCC00", bg:"rgba(255,204,0,0.07)", border:"rgba(255,204,0,0.22)", glow:"rgba(255,204,0,0.12)" },
  default: { color:"#00d1ff", bg:"rgba(0,209,255,0.07)", border:"rgba(0,209,255,0.22)", glow:"rgba(0,209,255,0.12)" },
};

interface KPICardProps {
  label:     string;
  value:     string | number;
  subValue?: string;
  variant?:  "success" | "danger" | "warning" | "default";
  icon:      ReactNode;
  pulse?:    boolean;
}

export function KPICard({ label, value, subValue, variant = "default", icon, pulse = false }: KPICardProps) {
  const v = VARIANTS[variant];
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300"
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        boxShadow: `0 0 30px ${v.glow}`,
        backdropFilter: "blur(16px)",
      }}>

      <div className="flex items-start justify-between">
        {/* Icône */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background:`${v.color}12`, border:`1px solid ${v.color}25`, color: v.color,
            boxShadow:`0 0 12px ${v.color}20` }}>
          {icon}
        </div>

        {/* Indicateur pulse */}
        {pulse && (
          <div className="relative w-3 h-3 mt-0.5">
            <span className="absolute inset-0 rounded-full animate-ping"
              style={{ background: v.color, opacity: 0.5 }} />
            <span className="relative block w-3 h-3 rounded-full"
              style={{ background: v.color, boxShadow:`0 0 8px ${v.color}` }} />
          </div>
        )}
      </div>

      {/* Valeur */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-end gap-1 leading-none">
          <span className="text-[32px] font-black tracking-tight" style={{ color:"#f1f5f9" }}>
            {value}
          </span>
          {subValue && (
            <span className="text-[15px] font-bold mb-0.5" style={{ color: v.color }}>
              {subValue}
            </span>
          )}
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em]"
          style={{ color:"rgba(148,163,184,0.5)" }}>
          {label}
        </p>
      </div>

      {/* Barre décorative basse */}
      <div className="h-0.5 rounded-full"
        style={{ background:`linear-gradient(90deg, ${v.color}60, transparent)` }} />
    </div>
  );
}
