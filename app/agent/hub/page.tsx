"use client";

console.log("HUB CHARGÉ - FORCE LOCK");

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Bot,
  Calendar,
  CalendarDays,
  FileText,
  LifeBuoy,
  Lock,
  Newspaper,
  ShieldCheck,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ── CONTRÔLE ACCÈS — false = verrou FORCÉ, aucune condition ───────────────
const isPremium = false;

// ── BOUTON VERROU — affiché en bas de la carte, titre toujours visible ────
function VerrouBas() {
  return (
    <div
      style={{
        marginTop: "auto",
        paddingTop: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Lock size={13} style={{ color: "#f59e0b" }} />
        <span
          style={{
            color: "#f59e0b",
            fontSize: "9px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          Accès Premium
        </span>
      </div>
      <Link
        href="/abonnement"
        style={{
          display: "inline-block",
          background: "#f59e0b",
          color: "#000",
          padding: "8px 20px",
          borderRadius: "999px",
          fontWeight: 900,
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          textDecoration: "none",
          boxShadow: "0 0 16px rgba(245,158,11,0.45)",
        }}
      >
        S&apos;abonner — 9.99€/mois
      </Link>
    </div>
  );
}

type Tile = {
  href: string;
  label: string;
  sub: string;
  teaser?: string;
  Icon: LucideIcon;
  accent: "cyan" | "emerald" | "violet" | "sky" | "amber" | "red" | "slate" | "indigo";
  secuAiGlow?: boolean;
  espaceProTitle?: boolean;
  premium?: boolean;
};

const TILES: Tile[] = [
  { href: "/agent/profil",     label: "Profil",         sub: "Identité tactique",       Icon: User,        accent: "cyan" },
  { href: "/agent/planning",   label: "Planning",       sub: "Vacations & créneaux",    Icon: Calendar,    accent: "cyan",    premium: true,
    teaser: "Accédez à vos vacations en temps réel" },
  { href: "/agent/paie",       label: "Paie",           sub: "Salaires & acomptes",     Icon: Banknote,    accent: "emerald", premium: true,
    teaser: "Consultez vos bulletins et acomptes instantanément" },
  { href: "/agent/docs",       label: "Documents",      sub: "Carte CNAPS & diplômes",  Icon: FileText,    accent: "violet" },
  { href: "/agent/secu-ai",    label: "Secu AI",        sub: "Assistant sécurité IA",   Icon: Bot,         accent: "sky",     secuAiGlow: true, premium: true,
    teaser: "Votre assistant IA dédié à la sécurité privée" },
  { href: "/agent/actualites", label: "Actualités",     sub: "Infos & alertes secteur", Icon: Newspaper,   accent: "amber",   premium: true,
    teaser: "Infos et alertes du secteur en direct" },
  { href: "/agent/calendrier", label: "RDV-Calendrier", sub: "Calendrier et RDV pro",   Icon: CalendarDays, accent: "indigo" },
  { href: "/agent/espace-pro", label: "Espace PRO",     sub: "Connexion",               Icon: ShieldCheck, accent: "violet",  espaceProTitle: true },
  { href: "/agent/support",    label: "Support",        sub: "Aide & assistance",       Icon: LifeBuoy,    accent: "slate" },
];

const ACCENT_ICON: Record<string, string> = {
  cyan:    "text-[#00d1ff] group-hover:drop-shadow-[0_0_12px_rgba(0,209,255,0.9)]",
  emerald: "text-emerald-400 group-hover:drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]",
  violet:  "text-violet-400 group-hover:drop-shadow-[0_0_10px_rgba(167,139,250,0.9)]",
  sky:     "text-sky-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.75)] group-hover:drop-shadow-[0_0_18px_rgba(56,189,248,1)]",
  amber:   "text-amber-400 group-hover:drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]",
  red:     "text-red-400 group-hover:drop-shadow-[0_0_10px_rgba(248,113,113,0.9)]",
  indigo:  "text-indigo-400 group-hover:drop-shadow-[0_0_12px_rgba(129,140,248,1)]",
  slate:   "text-slate-400 group-hover:text-[#00d1ff] group-hover:drop-shadow-[0_0_8px_rgba(0,209,255,0.6)]",
};

const ACCENT_BORDER: Record<string, string> = {
  cyan:    "border-[#00d1ff]/25 hover:border-[#00d1ff]/55 hover:shadow-[0_0_32px_rgba(0,209,255,0.18)]",
  emerald: "border-emerald-500/25 hover:border-emerald-400/55 hover:shadow-[0_0_28px_rgba(52,211,153,0.18)]",
  violet:  "border-violet-500/25 hover:border-violet-400/55 hover:shadow-[0_0_28px_rgba(167,139,250,0.18)]",
  sky:     "border-sky-500/40 shadow-[0_0_28px_rgba(56,189,248,0.25)] hover:shadow-[0_0_38px_rgba(56,189,248,0.4)]",
  amber:   "border-amber-500/25 hover:border-amber-400/55 hover:shadow-[0_0_28px_rgba(251,191,36,0.18)]",
  red:     "border-red-500/25 hover:border-red-400/55 hover:shadow-[0_0_28px_rgba(248,113,113,0.18)]",
  indigo:  "border-indigo-500/30 hover:border-indigo-400/60 hover:shadow-[0_0_32px_rgba(129,140,248,0.25)]",
  slate:   "border-white/10 hover:border-[#00d1ff]/35 hover:shadow-[0_0_24px_rgba(0,209,255,0.12)]",
};

export default function AgentHubPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <div className="ow-layout-root min-h-screen font-sans">
      <div className="ow-shell min-h-screen">
        {/* Décor cockpit */}
        <div className="ow-radar-rings">
          <span />
          <span />
          <span />
        </div>
        <div className="ow-radar-sweep" />
        <div className="ow-scanlines" />
        <div className="ow-vignette" />

        {/* ── EXIT fixe haut-droite ── */}
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Quitter le système"
          className="fixed top-4 right-5 z-50 font-black uppercase tracking-widest transition-all duration-150 active:scale-95"
          style={{
            fontSize: "13px",
            color: "#00ff00",
            textShadow: "0 0 8px rgba(0,255,0,0.9), 0 0 18px rgba(0,255,0,0.5)",
            background: "none",
            border: "none",
            cursor: "pointer",
            letterSpacing: "0.3em",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.textShadow =
              "0 0 12px rgba(0,255,0,1), 0 0 28px rgba(0,255,0,0.7), 0 0 50px rgba(0,255,0,0.35)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.textShadow =
              "0 0 8px rgba(0,255,0,0.9), 0 0 18px rgba(0,255,0,0.5)";
          }}
        >
          EXIT
        </button>

        <div className="ow-content mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Header cockpit */}
          <header className="mb-10 ow-header-panel">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
              SECUPRO — Interface Agent
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl ow-title-accent">
              HUB <span className="text-[#00d1ff]">AGENT</span>
            </h1>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#39ff14] animate-pulse"
                style={{ boxShadow: "0 0 8px rgba(57,255,20,0.85), 0 0 16px rgba(57,255,20,0.45)" }}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Système opérationnel
              </span>
            </div>
          </header>

          {/* Grille des modules */}
          <nav
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Navigation modules agent"
          >
            {TILES.map(({ href, label, sub, teaser, Icon, accent, secuAiGlow, espaceProTitle, premium }) => {
              const locked = premium && !isPremium;

              return (
                <div
                  key={href}
                  className={[
                    "group relative flex flex-col overflow-hidden rounded-2xl border",
                    "bg-gradient-to-br from-[rgba(28,42,58,0.95)] to-[rgba(12,22,34,0.92)]",
                    "backdrop-blur-xl p-6 transition-all duration-300 min-h-[160px]",
                    locked
                      ? "border-amber-500/30 hover:border-amber-500/60 hover:shadow-[0_0_28px_rgba(245,158,11,0.15)]"
                      : ACCENT_BORDER[accent],
                  ].join(" ")}
                >
                  {/* Liseré haut — amber si verrouillé */}
                  <div
                    className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
                    style={{
                      background: locked
                        ? "linear-gradient(to right, transparent, rgba(245,158,11,0.4), transparent)"
                        : "linear-gradient(to right, transparent, rgba(0,209,255,0.25), transparent)",
                    }}
                  />

                  {/* Icône + badge cadenas */}
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={[
                        "flex h-11 w-11 items-center justify-center rounded-xl border bg-black/30",
                        locked
                          ? "border-amber-500/30"
                          : `border-white/10 ${secuAiGlow ? "border-sky-500/40 shadow-[0_0_16px_rgba(56,189,248,0.3)]" : ""}`,
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "h-5 w-5",
                          locked ? "text-amber-500/50" : ACCENT_ICON[accent],
                        ].join(" ")}
                      />
                    </div>
                    {locked && (
                      <Lock size={14} style={{ color: "#f59e0b", opacity: 0.8 }} />
                    )}
                  </div>

                  {/* Titre — toujours visible */}
                  <span
                    className="text-base font-black uppercase tracking-wide"
                    style={{ color: locked ? "#f59e0b" : "#fff" }}
                  >
                    {espaceProTitle ? "ESPACE PRO" : label}
                  </span>

                  {/* Sous-titre */}
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {sub}
                  </span>

                  {/* Teaser — phrase d'accroche visible même verrouillé */}
                  {locked && teaser && (
                    <p
                      style={{
                        marginTop: "10px",
                        fontSize: "11px",
                        color: "#94a3b8",
                        lineHeight: 1.5,
                        fontStyle: "italic",
                      }}
                    >
                      {teaser}
                    </p>
                  )}

                  {/* Bas de carte : bouton abonnement OU flèche navigation */}
                  {locked ? (
                    <VerrouBas />
                  ) : (
                    <>
                      <Link href={href} className="absolute inset-0" aria-label={label} />
                      <div className="absolute bottom-4 right-4 text-slate-700 transition-all duration-200 group-hover:text-[#00d1ff] group-hover:translate-x-0.5">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </nav>

          <footer className="mt-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-700">
              © 2026 SECUPRO COMMAND SYSTEM
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
