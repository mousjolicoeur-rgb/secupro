"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Bot,
  Calendar,
  FileText,
  LifeBuoy,
  LogOut,
  Radio,
  ShieldCheck,
  User,
} from "lucide-react";
import { getAgentDisplayName, getEntrepriseId } from "@/lib/agentSession";
import AgentTopBar from "@/components/AgentTopBar";
import { getTheme, onThemeChange, toggleTheme } from "@/lib/theme";
import { supabase } from "@/lib/supabaseClient";
import { isAuthenticatedClient } from "@/lib/authClient";

export default function AgentActivatePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [agentName, setAgentName] = useState<string>("");
  const [theme, setTheme] = useState<"nocturne" | "normal">("nocturne");

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      if (!(await isAuthenticatedClient())) {
        router.replace("/");
        return;
      }
      // Require company code after login/registration
      if (!getEntrepriseId()) {
        router.replace("/agent/code");
        return;
      }
      setAgentName(getAgentDisplayName() || "Agent");
      setTheme(getTheme());
      unsub = onThemeChange(() => setTheme(getTheme()));
      setAllowed(true);
    })();
    return () => unsub();
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
    {
      label: "Profil",
      Icon: User,
      onClick: () => router.push("/agent/profil"),
      accent: "cyan",
    },
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
    <div
      className={[
        "min-h-screen font-sans",
        theme === "normal"
          ? "bg-[#F8FAFC] text-[#1E293B]"
          : "bg-[#050A12] text-white",
      ].join(" ")}
    >
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 py-6 md:px-8 md:py-10">
        {/* Top bar */}
        <AgentTopBar
          title="SECUPRO / AGENT HUB"
          agentName={agentName}
          rightStatus
          theme={theme}
          onToggleTheme={() => {
            const next = toggleTheme();
            setTheme(next);
          }}
        />

        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            className={[
              "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest border transition-colors",
              theme === "normal"
                ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]",
            ].join(" ")}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
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
            const cardBase =
              theme === "normal"
                ? "bg-white text-[#1E293B] border-slate-200 shadow-sm hover:bg-white"
                : "bg-white/[0.035] text-white border-cyan-400/15 hover:bg-white/[0.05]";
            const cardFx =
              theme === "normal"
                ? "shadow-sm hover:shadow-md"
                : glow;

            return (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className={[
                  "group relative rounded-3xl border backdrop-blur-xl",
                  cardBase,
                  "px-4 py-5 md:px-5 md:py-6 text-left transition-all",
                  "active:scale-[0.99]",
                  cardFx,
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={[
                      "h-11 w-11 rounded-2xl flex items-center justify-center border border-white/10",
                      iconBg,
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "h-5 w-5",
                        theme === "normal"
                          ? accent === "green"
                            ? "text-emerald-700"
                            : "text-cyan-700"
                          : iconColor,
                      ].join(" ")}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div
                    className={[
                      "text-sm font-black tracking-tight",
                      theme === "normal" ? "text-slate-800" : "text-white",
                    ].join(" ")}
                  >
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
