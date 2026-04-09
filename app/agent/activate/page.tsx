"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Bot,
  Calendar,
  FileText,
  LifeBuoy,
  Radio,
  ShieldCheck,
  User,
} from "lucide-react";
import { getAgentDisplayName, hasCompletedAgentLead } from "@/lib/agentSession";

export default function AgentActivatePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [agentName, setAgentName] = useState<string>("");

  useEffect(() => {
    if (!hasCompletedAgentLead()) {
      router.replace("/");
      return;
    }
    setAgentName(getAgentDisplayName() || "Agent");
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest uppercase">
          Redirecting…
        </p>
      </div>
    );
  }

  const tiles: Array<{
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    accent?: "cyan" | "green";
  }> = [
    { label: "Profil", Icon: User, onClick: () => {}, accent: "cyan" },
    { label: "Plannings", Icon: Calendar, onClick: () => {}, accent: "cyan" },
    { label: "Paie", Icon: Banknote, onClick: () => {}, accent: "cyan" },
    { label: "Documents", Icon: FileText, onClick: () => {}, accent: "cyan" },
    { label: "Secu AI", Icon: Bot, onClick: () => {}, accent: "cyan" },
    { label: "Actualités", Icon: Radio, onClick: () => {}, accent: "cyan" },
    {
      label: "Espace PRO",
      Icon: ShieldCheck,
      onClick: () => router.push("/agent/mission"),
      accent: "green",
    },
    { label: "Support", Icon: LifeBuoy, onClick: () => {}, accent: "cyan" },
  ];

  return (
    <div className="min-h-screen bg-[#050A12] text-white font-sans">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 py-6 md:px-8 md:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-cyan-400/15 bg-white/[0.04] backdrop-blur-xl px-5 py-4 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
              SECUPRO / AGENT HUB
            </div>
            <div className="mt-1 text-lg font-black tracking-tight text-white truncate">
              {agentName}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                STATUT: EN SERVICE
              </span>
            </div>
          </div>
        </div>

        {/* Menu grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {tiles.map(({ label, Icon, onClick, accent }) => {
            const glow =
              accent === "green"
                ? "shadow-[0_0_35px_rgba(34,197,94,0.12)] border-emerald-400/25 hover:border-emerald-300/35"
                : "shadow-[0_0_35px_rgba(34,211,238,0.08)] border-cyan-400/15 hover:border-cyan-300/30";
            const iconBg =
              accent === "green" ? "bg-emerald-400/15" : "bg-cyan-400/10";
            const iconColor =
              accent === "green" ? "text-emerald-200" : "text-cyan-200";

            return (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className={[
                  "group relative rounded-3xl border bg-white/[0.035] backdrop-blur-xl",
                  "px-4 py-5 md:px-5 md:py-6 text-left transition-all",
                  "active:scale-[0.99] hover:bg-white/[0.05]",
                  glow,
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={[
                      "h-11 w-11 rounded-2xl flex items-center justify-center border border-white/10",
                      iconBg,
                    ].join(" ")}
                  >
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-black tracking-tight text-white">
                    {label}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                    Ouvrir
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.35em] text-slate-600">
          Night-shift optimized UI • low glare
        </div>
      </div>
    </div>
  );
}
