"use client";

import AgentAvatar from "@/components/AgentAvatar";
import { Moon, Sun } from "lucide-react";

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
        "flex items-center justify-between gap-4 rounded-3xl border backdrop-blur-xl px-5 py-4",
        isNormal
          ? "border-slate-200 bg-white/80 shadow-sm"
          : "border-cyan-400/15 bg-white/[0.04] shadow-[0_0_40px_rgba(34,211,238,0.06)]",
      ].join(" ")}
    >
      <div className="min-w-0">
        <div
          className={[
            "text-[10px] font-black uppercase tracking-[0.35em]",
            isNormal ? "text-slate-500" : "text-slate-500",
          ].join(" ")}
        >
          {props.title}
        </div>
        <div
          className={[
            "mt-1 text-lg font-black tracking-tight truncate",
            isNormal ? "text-slate-800" : "text-white",
          ].join(" ")}
        >
          {props.agentName}
        </div>
        {props.subtitle ? (
          <div className={props.subtitleClassName ?? "mt-1 text-xs text-slate-500 truncate"}>
            {props.subtitle}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {props.onToggleTheme ? (
          <button
            type="button"
            onClick={props.onToggleTheme}
            className={[
              "inline-flex items-center justify-center h-10 w-10 rounded-2xl border transition-colors",
              isNormal
                ? "border-slate-200 bg-white hover:bg-slate-50"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
            ].join(" ")}
            aria-label="Toggle visual mode"
            title="Visual Mode"
          >
            {props.theme === "normal" ? (
              <Moon className="h-5 w-5 text-slate-300" />
            ) : (
              <Sun className="h-5 w-5 text-slate-300" />
            )}
          </button>
        ) : null}
        {props.rightStatus ? (
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
              STATUT: EN SERVICE
            </span>
          </div>
        ) : null}
        <AgentAvatar size={40} />
      </div>
    </div>
  );
}

