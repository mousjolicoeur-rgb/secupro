"use client";

import AgentAvatar from "@/components/AgentAvatar";

export default function AgentTopBar(props: {
  title: string;
  subtitle?: string;
  agentName: string;
  rightStatus?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-cyan-400/15 bg-white/[0.04] backdrop-blur-xl px-5 py-4 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
          {props.title}
        </div>
        <div className="mt-1 text-lg font-black tracking-tight text-white truncate">
          {props.agentName}
        </div>
        {props.subtitle ? (
          <div className="mt-1 text-xs text-slate-500 truncate">
            {props.subtitle}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3 shrink-0">
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

