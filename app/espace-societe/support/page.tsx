"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Settings, CreditCard,
  ArrowLeft, Phone, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

// ── Design tokens ──────────────────────────────────────────────────────────
const CYAN    = "#00d1ff";
const ORANGE  = "#fb923c";
const GREEN   = "#34d399";

const CARDS = [
  {
    id:       "urgence",
    label:    "URGENCE TERRAIN",
    icon:     AlertTriangle,
    accent:   ORANGE,
    accentBg: "rgba(251,146,60,0.08)",
    border:   "rgba(251,146,60,0.25)",
    glow:     "rgba(251,146,60,0.20)",
    desc:     "Problème de badgeage ou planning agent",
    btn:      "Lancer une alerte",
    badge:    "PRIORITÉ HAUTE",
    badgeBg:  "rgba(251,146,60,0.12)",
    badgeText:"rgba(251,146,60,0.85)",
    href:     "mailto:urgence@secupro.app",
  },
  {
    id:       "technique",
    label:    "SUPPORT TECHNIQUE",
    icon:     Settings,
    accent:   CYAN,
    accentBg: "rgba(0,209,255,0.07)",
    border:   "rgba(0,209,255,0.25)",
    glow:     "rgba(0,209,255,0.20)",
    desc:     "Bug d'interface ou accès compte",
    btn:      "Ouvrir un ticket",
    badge:    "RÉPONSE < 4H",
    badgeBg:  "rgba(0,209,255,0.10)",
    badgeText:"rgba(0,209,255,0.75)",
    href:     "mailto:support@secupro.app",
  },
  {
    id:       "facturation",
    label:    "FACTURATION & LICENCE",
    icon:     CreditCard,
    accent:   GREEN,
    accentBg: "rgba(52,211,153,0.07)",
    border:   "rgba(52,211,153,0.25)",
    glow:     "rgba(52,211,153,0.20)",
    desc:     "Gérer votre abonnement Stripe",
    btn:      "Accéder au portail",
    badge:    "ACCÈS DIRECT",
    badgeBg:  "rgba(52,211,153,0.10)",
    badgeText:"rgba(52,211,153,0.75)",
    href:     "https://billing.stripe.com/p/login/test_00g00000000000000000",
  },
] as const;

// ── Composant tuile ────────────────────────────────────────────────────────
function SupportCard({ card }: { card: typeof CARDS[number] }) {
  const Icon = card.icon;

  return (
    <motion.a
      href={card.href}
      target={card.href.startsWith("http") ? "_blank" : undefined}
      rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
      whileHover={{ y: -6, boxShadow: `0 20px 50px ${card.glow}, 0 0 0 1px ${card.border}` }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="relative flex flex-col gap-5 rounded-2xl p-6 cursor-pointer"
      style={{
        background: card.accentBg,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid ${card.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Liseré haut */}
      <div
        aria-hidden
        className="absolute top-0 left-[20%] right-[20%] h-px rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${card.accent}60, transparent)`,
        }}
      />

      {/* Icône + Badge */}
      <div className="flex items-start justify-between">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{
            background: `${card.accent}14`,
            border: `1px solid ${card.accent}30`,
            boxShadow: `0 0 18px ${card.accent}20`,
          }}
        >
          <Icon size={22} style={{ color: card.accent }} />
        </div>

        <span
          className="text-[8px] font-black uppercase tracking-[0.28em] px-2.5 py-1 rounded-full"
          style={{
            background: card.badgeBg,
            border: `1px solid ${card.accent}25`,
            color: card.badgeText,
          }}
        >
          {card.badge}
        </span>
      </div>

      {/* Texte */}
      <div className="flex flex-col gap-1.5">
        <h2
          className="text-[13px] font-black uppercase tracking-[0.1em]"
          style={{ color: "#f1f5f9" }}
        >
          {card.label}
        </h2>
        <p
          className="text-[12px] font-medium leading-snug"
          style={{ color: "rgba(148,163,184,0.7)" }}
        >
          {card.desc}
        </p>
      </div>

      {/* Bouton */}
      <div
        className="flex items-center justify-between mt-auto pt-4"
        style={{ borderTop: `1px solid ${card.accent}15` }}
      >
        <span
          className="text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ color: card.accent }}
        >
          {card.btn}
        </span>
        <ChevronRight size={14} style={{ color: card.accent }} />
      </div>
    </motion.a>
  );
}

// ── Page principale ────────────────────────────────────────────────────────
export default function EspaceSocieteSupport() {
  const router = useRouter();

  return (
    <div
      className="relative min-h-screen flex flex-col px-5 py-10 overflow-x-hidden"
      style={{
        background:
          "radial-gradient(ellipse 110% 65% at 50% 0%, rgba(0,40,100,0.40) 0%, #0B1426 55%)",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* Grille tactique */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,209,255,0.025) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,209,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 20%, black, transparent 68%)",
        }}
      />
      {/* Halo haut */}
      <div
        aria-hidden
        className="pointer-events-none fixed -z-10 left-1/2 top-0 -translate-x-1/2"
        style={{
          width: 900, height: 480, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,209,255,0.08) 0%, transparent 65%)",
        }}
      />

      {/* ── Bouton retour ── */}
      <motion.button
        type="button"
        onClick={() => router.push("/espace-societe")}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.22em] backdrop-blur-md transition-colors duration-200"
        style={{
          background: "rgba(11,20,38,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "rgba(148,163,184,0.6)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = CYAN;
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,209,255,0.3)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.6)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
        }}
      >
        <ArrowLeft size={11} />
        Retour au dashboard
      </motion.button>

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4 mt-12 mb-10"
      >
        {/* Logo */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-5 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(0,209,255,0.16) 0%, transparent 68%)",
            }}
          />
          <Image
            src="/secupro-logo-official.png"
            alt="SecuPRO"
            width={54}
            height={54}
            priority
            style={{ filter: "drop-shadow(0 0 16px rgba(0,209,255,0.5))", position: "relative" }}
          />
        </div>

        {/* Titre */}
        <div className="text-center">
          <p
            className="text-[9px] font-black uppercase tracking-[0.5em] mb-2"
            style={{ color: "rgba(0,209,255,0.45)" }}
          >
            SecuPRO Business
          </p>
          <h1 className="text-[clamp(1.5rem,5vw,2.2rem)] font-black leading-tight tracking-tight">
            CENTRE D&apos;ASSISTANCE{" "}
            <span
              style={{
                color: CYAN,
                textShadow: "0 0 22px rgba(0,209,255,0.7), 0 0 55px rgba(0,209,255,0.3)",
              }}
            >
              BUSINESS
            </span>
          </h1>
          <p
            className="mt-2 text-[11px] font-semibold"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            Sélectionnez votre type de demande
          </p>
        </div>
      </motion.div>

      {/* Séparateur */}
      <div
        className="w-full max-w-3xl mx-auto h-px mb-8"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.18), transparent)",
        }}
      />

      {/* ── GRILLE DES TUILES ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-3xl mx-auto grid gap-4 support-grid"
      >
        {CARDS.map((card) => (
          <SupportCard key={card.id} card={card} />
        ))}
      </motion.div>

      {/* ── LIGNE VIP ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="w-full max-w-3xl mx-auto mt-8"
      >
        <div
          className="flex items-center justify-center gap-3 rounded-2xl px-6 py-4"
          style={{
            background: "rgba(0,209,255,0.04)",
            border: "1px solid rgba(0,209,255,0.13)",
          }}
        >
          <Phone size={14} style={{ color: "rgba(0,209,255,0.5)" }} />
          <span
            className="text-[10px] font-black uppercase tracking-[0.3em]"
            style={{ color: "rgba(0,209,255,0.4)" }}
          >
            Ligne VIP Business :
          </span>
          <span
            className="text-[13px] font-black tracking-wider"
            style={{
              color: CYAN,
              textShadow: "0 0 12px rgba(0,209,255,0.45)",
            }}
          >
            +33 1 80 XX XX XX
          </span>
          <span
            className="text-[8px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(0,209,255,0.08)",
              border: "1px solid rgba(0,209,255,0.18)",
              color: "rgba(0,209,255,0.55)",
            }}
          >
            Abonnés uniquement
          </span>
        </div>
      </motion.div>

      {/* ── FOOTER ── */}
      <p
        className="text-center text-[9px] font-bold uppercase tracking-widest mt-8"
        style={{ color: "rgba(0,209,255,0.1)" }}
      >
        © 2026 SECUPRO COMMAND SYSTEM · SIRET 10335392600019
      </p>

      {/* ── Responsive ── */}
      <style>{`
        .support-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 768px) {
          .support-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (min-width: 480px) and (max-width: 768px) {
          .support-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
