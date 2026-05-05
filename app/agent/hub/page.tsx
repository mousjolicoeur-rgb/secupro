"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Bot,
  Calendar,
  CalendarDays,
  FileText,
  LifeBuoy,
  Newspaper,
  ShieldCheck,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import TrialBanner from "@/components/TrialBanner";

// ── CONFIG ACCÈS ───────────────────────────────────────────────────────────
// true  → abonné confirmé, boutons verts + aucune bannière trial
// false → période d'essai, boutons verts + TrialBanner actif
const isPremium = false;

// ── DÉFINITION DES TUILES ──────────────────────────────────────────────────
type Tile = {
  href: string;
  label: string;
  sub: string;
  Icon: LucideIcon;
  color: string;        // couleur accent de l'icône
  glow: string;         // couleur rgba pour box-shadow hover
  borderIdle: string;   // border au repos
  borderHover: string;  // border au hover (injecté via onMouse*)
  featured?: boolean;   // tuile mise en avant (SecuAI)
};

const TILES: Tile[] = [
  {
    href: "/agent/profil",
    label: "PROFIL",
    sub: "Identité tactique",
    Icon: User,
    color: "#00d1ff",
    glow: "rgba(0,209,255,0.22)",
    borderIdle: "rgba(0,209,255,0.15)",
    borderHover: "rgba(0,209,255,0.5)",
  },
  {
    href: "/agent/planning",
    label: "PLANNING",
    sub: "Vacations & créneaux",
    Icon: Calendar,
    color: "#00d1ff",
    glow: "rgba(0,209,255,0.22)",
    borderIdle: "rgba(0,209,255,0.15)",
    borderHover: "rgba(0,209,255,0.5)",
  },
  {
    href: "/agent/paie",
    label: "PAIE",
    sub: "Salaires & acomptes",
    Icon: Banknote,
    color: "#34d399",
    glow: "rgba(52,211,153,0.22)",
    borderIdle: "rgba(52,211,153,0.15)",
    borderHover: "rgba(52,211,153,0.5)",
  },
  {
    href: "/agent/docs",
    label: "DOCUMENTS",
    sub: "Carte CNAPS & diplômes",
    Icon: FileText,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.22)",
    borderIdle: "rgba(167,139,250,0.15)",
    borderHover: "rgba(167,139,250,0.5)",
  },
  {
    href: "/agent/secu-ai",
    label: "SECU AI",
    sub: "Assistant sécurité IA",
    Icon: Bot,
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.3)",
    borderIdle: "rgba(56,189,248,0.3)",
    borderHover: "rgba(56,189,248,0.7)",
    featured: true,
  },
  {
    href: "/agent/actualites",
    label: "ACTUALITÉS",
    sub: "Infos & alertes secteur",
    Icon: Newspaper,
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.22)",
    borderIdle: "rgba(251,191,36,0.15)",
    borderHover: "rgba(251,191,36,0.5)",
  },
  {
    href: "/agent/calendrier",
    label: "CALENDRIER",
    sub: "RDV & planification",
    Icon: CalendarDays,
    color: "#818cf8",
    glow: "rgba(129,140,248,0.22)",
    borderIdle: "rgba(129,140,248,0.15)",
    borderHover: "rgba(129,140,248,0.5)",
  },
  {
    href: "/agent/espace-pro",
    label: "ESPACE PRO",
    sub: "Connexion entreprise",
    Icon: ShieldCheck,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.22)",
    borderIdle: "rgba(167,139,250,0.15)",
    borderHover: "rgba(167,139,250,0.5)",
  },
  {
    href: "/agent/support",
    label: "SUPPORT",
    sub: "Aide & assistance",
    Icon: LifeBuoy,
    color: "#94a3b8",
    glow: "rgba(0,209,255,0.15)",
    borderIdle: "rgba(255,255,255,0.08)",
    borderHover: "rgba(0,209,255,0.35)",
  },
];

// ── COMPOSANT TUILE ────────────────────────────────────────────────────────
function HubTile({ tile }: { tile: Tile }) {
  const { href, label, sub, Icon, color, glow, borderIdle, borderHover, featured } = tile;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        background: featured
          ? "linear-gradient(135deg, rgba(56,189,248,0.06) 0%, rgba(13,17,23,0.98) 60%)"
          : "rgba(22,27,34,0.95)",
        border: `1px solid ${borderIdle}`,
        borderRadius: "18px",
        padding: "24px",
        minHeight: "190px",
        overflow: "hidden",
        transition: "border-color 0.25s, box-shadow 0.25s, transform 0.2s",
        cursor: "pointer",
        boxShadow: featured
          ? `0 0 30px rgba(56,189,248,0.12)`
          : "none",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = borderHover;
        el.style.boxShadow = `0 0 36px ${glow}`;
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = borderIdle;
        el.style.boxShadow = featured ? `0 0 30px rgba(56,189,248,0.12)` : "none";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Liseré lumineux en haut */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${color}55, transparent)`,
        }}
      />

      {/* Badge FEATURED */}
      {featured && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(56,189,248,0.12)",
            border: "1px solid rgba(56,189,248,0.35)",
            borderRadius: "999px",
            padding: "3px 10px",
            fontSize: "8px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "#38bdf8",
          }}
        >
          IA
        </div>
      )}

      {/* Icône */}
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: `${color}12`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          boxShadow: featured ? `0 0 16px ${color}40` : "none",
        }}
      >
        <Icon
          size={20}
          style={{
            color,
            filter: featured ? `drop-shadow(0 0 6px ${color})` : "none",
          }}
        />
      </div>

      {/* Titre */}
      <span
        style={{
          fontSize: "13px",
          fontWeight: 900,
          color: "#f1f5f9",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>

      {/* Sous-titre */}
      <span
        style={{
          marginTop: "4px",
          fontSize: "10px",
          fontWeight: 600,
          color: "rgba(148,163,184,0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}
      >
        {sub}
      </span>

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: "16px" }} />

      {/* Bouton ACCÉDER */}
      <Link
        href={href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          alignSelf: "flex-start",
          padding: "8px 18px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #16a34a, #22c55e)",
          color: "#fff",
          fontSize: "10px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          textDecoration: "none",
          boxShadow: "0 0 16px rgba(34,197,94,0.35)",
          transition: "box-shadow 0.2s",
          zIndex: 1,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        ACCÉDER
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* Overlay de clic sur toute la carte (sous le bouton) */}
      <Link href={href} className="absolute inset-0" aria-label={label} style={{ zIndex: 0 }} />
    </div>
  );
}

// ── PAGE PRINCIPALE ────────────────────────────────────────────────────────
export default function AgentHubPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        color: "#f1f5f9",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ── Grille de fond décorative ── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(0,209,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 85% 75% at 50% 20%, black 0%, transparent 70%)",
        }}
      />
      {/* Halo central */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(0,209,255,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── EXIT fixe haut-droite ── */}
      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Se déconnecter"
        style={{
          position: "fixed",
          top: "18px",
          right: "20px",
          zIndex: 50,
          background: "rgba(13,17,23,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          padding: "7px 14px",
          color: "rgba(148,163,184,0.7)",
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          transition: "color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.color = "#f87171";
          el.style.borderColor = "rgba(248,113,113,0.4)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.color = "rgba(148,163,184,0.7)";
          el.style.borderColor = "rgba(255,255,255,0.08)";
        }}
      >
        ← Quitter
      </button>

      {/* ── CONTENU ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "40px 24px 64px",
        }}
      >
        {/* ── HEADER ── */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
            paddingBottom: "28px",
            borderBottom: "1px solid rgba(0,209,255,0.08)",
          }}
        >
          <Image
            src="/secupro-logo-official.png"
            alt="SecuPRO"
            width={52}
            height={52}
            priority
            style={{
              filter:
                "drop-shadow(0 0 14px rgba(41,212,245,0.35))",
            }}
          />
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: "9px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.4em",
                color: "rgba(0,209,255,0.45)",
              }}
            >
              Interface Agent · SecuPRO
            </p>
            <h1
              style={{
                margin: "4px 0 0",
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#ffffff",
                lineHeight: 1,
              }}
            >
              HUB{" "}
              <span
                style={{
                  color: "#00d1ff",
                  textShadow:
                    "0 0 20px rgba(0,209,255,0.6), 0 0 50px rgba(0,209,255,0.25)",
                }}
              >
                AGENT
              </span>
            </h1>
          </div>

          {/* Statut système */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "rgba(34,197,94,0.05)",
              border: "1px solid rgba(34,197,94,0.18)",
              borderRadius: "10px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px rgba(34,197,94,0.9)",
                display: "inline-block",
                animation: "sysPulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: "9px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "rgba(34,197,94,0.8)",
                whiteSpace: "nowrap",
              }}
            >
              Système actif
            </span>
          </div>
        </header>

        {/* ── TRIAL BANNER ── */}
        {!isPremium && <TrialBanner />}

        {/* ── GRILLE DES MODULES ── */}
        <nav
          aria-label="Modules agent"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
          className="hub-grid"
        >
          {TILES.map((tile) => (
            <HubTile key={tile.href} tile={tile} />
          ))}
        </nav>

        {/* ── FOOTER ── */}
        <footer
          style={{
            marginTop: "48px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(0,209,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.35em",
              color: "rgba(0,209,255,0.18)",
              margin: 0,
            }}
          >
            © 2026 SecuPRO — SIRET 10335392600019
          </p>
          <a
            href="mailto:support@secupro.app"
            style={{
              fontSize: "9px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(0,209,255,0.25)",
              textDecoration: "none",
            }}
          >
            support@secupro.app
          </a>
        </footer>
      </div>

      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes sysPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 900px) {
          .hub-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 540px) {
          .hub-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
