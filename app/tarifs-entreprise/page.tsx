"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Check, Zap, Building2, Crown,
  Shield, Loader2,
} from "lucide-react";
import SecuProTechLogo from "@/components/SecuProTechLogo";

// ── Design tokens ──────────────────────────────────────────────────────────
const CYAN   = "#00d1ff";
const GREEN  = "#34d399";
const PURPLE = "#a78bfa";

// ── Plans ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id:       "starter",
    name:     "STARTER",
    price:    "49,99",
    priceId:  "price_1TQ6aARrtg7xDsW3aILcB4JD",
    agents:   "50",
    Icon:     Zap,
    accent:   CYAN,
    accentBg: "rgba(0,209,255,0.07)",
    border:   "rgba(0,209,255,0.22)",
    glow:     "rgba(0,209,255,0.16)",
    popular:  false,
    badge:    "DÉMARRAGE",
    badgeBg:  "rgba(0,209,255,0.10)",
    badgeText:"rgba(0,209,255,0.75)",
    features: [
      "Jusqu'à 50 agents",
      "Planning & gestion des missions",
      "Bulletins de paie",
      "Documents réglementaires",
      "Tableau de bord basique",
      "Support standard (< 24 h)",
    ],
  },
  {
    id:       "business",
    name:     "BUSINESS",
    price:    "99,99",
    priceId:  "price_1TQ6aCRrtg7xDsW3YZ5Proch",
    agents:   "150",
    Icon:     Building2,
    accent:   GREEN,
    accentBg: "rgba(52,211,153,0.08)",
    border:   "rgba(52,211,153,0.35)",
    glow:     "rgba(52,211,153,0.22)",
    popular:  true,
    badge:    "POPULAIRE",
    badgeBg:  "rgba(52,211,153,0.12)",
    badgeText:"rgba(52,211,153,0.90)",
    features: [
      "Jusqu'à 150 agents",
      "Tout le plan Starter",
      "Dashboard performance avancé",
      "Cartographie radar des agents",
      "Provisionnement multi-sites",
      "Support prioritaire (< 4 h)",
    ],
  },
  {
    id:       "enterprise",
    name:     "ENTERPRISE",
    price:    "199,99",
    priceId:  "price_1TQ6aARrtg7xDsW30awo9TNH",
    agents:   "500",
    Icon:     Crown,
    accent:   PURPLE,
    accentBg: "rgba(167,139,250,0.07)",
    border:   "rgba(167,139,250,0.28)",
    glow:     "rgba(167,139,250,0.18)",
    popular:  false,
    badge:    "PREMIUM",
    badgeBg:  "rgba(167,139,250,0.10)",
    badgeText:"rgba(167,139,250,0.82)",
    features: [
      "Jusqu'à 500 agents",
      "Tout le plan Business",
      "SecuAI — IA conversationnelle",
      "Rapports PDF automatisés",
      "Accès API entreprise",
      "Support VIP dédié (< 1 h)",
    ],
  },
] as const;

// ── Carte plan ─────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  loading,
  onCheckout,
}: {
  plan: typeof PLANS[number];
  loading: string | null;
  onCheckout: (priceId: string, planId: string) => void;
}) {
  const { Icon } = plan;
  const isLoading = loading === plan.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: `0 24px 56px ${plan.glow}, 0 0 0 1px ${plan.border}` }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="relative flex flex-col rounded-2xl p-6"
      style={{
        background: plan.accentBg,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid ${plan.border}`,
        boxShadow: plan.popular
          ? `0 8px 32px ${plan.glow}`
          : "0 4px 24px rgba(0,0,0,0.30)",
      }}
    >
      {/* Liseré supérieur */}
      <div
        aria-hidden
        className="absolute top-0 left-[15%] right-[15%] h-px rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${plan.accent}70, transparent)`,
        }}
      />

      {/* Badge populaire flottant */}
      {plan.popular && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.30em]"
          style={{
            background: `linear-gradient(135deg, ${plan.accent}22, ${plan.accent}10)`,
            border: `1px solid ${plan.accent}50`,
            color: plan.accent,
            boxShadow: `0 0 16px ${plan.glow}`,
          }}
        >
          ★ {plan.badge}
        </div>
      )}

      {/* Icône + badge */}
      <div className="flex items-start justify-between mb-5">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{
            background: `${plan.accent}14`,
            border: `1px solid ${plan.accent}30`,
            boxShadow: `0 0 18px ${plan.accent}20`,
          }}
        >
          <Icon size={22} style={{ color: plan.accent }} />
        </div>
        {!plan.popular && (
          <span
            className="text-[8px] font-black uppercase tracking-[0.28em] px-2.5 py-1 rounded-full"
            style={{
              background: plan.badgeBg,
              border: `1px solid ${plan.accent}25`,
              color: plan.badgeText,
            }}
          >
            {plan.badge}
          </span>
        )}
      </div>

      {/* Nom du plan */}
      <p
        className="text-[11px] font-black uppercase tracking-[0.22em] mb-1"
        style={{ color: plan.accent }}
      >
        {plan.name}
      </p>

      {/* Prix */}
      <div className="flex items-end gap-1.5 mb-1">
        <span
          className="text-[clamp(2rem,5vw,2.6rem)] font-black leading-none"
          style={{
            color: "#f1f5f9",
            textShadow: `0 0 24px ${plan.glow}`,
          }}
        >
          {plan.price} €
        </span>
        <span
          className="text-[11px] font-semibold mb-1"
          style={{ color: "rgba(148,163,184,0.5)" }}
        >
          /mois
        </span>
      </div>

      {/* Agents */}
      <p
        className="text-[11px] font-bold mb-1"
        style={{ color: "rgba(148,163,184,0.55)" }}
      >
        Jusqu'à{" "}
        <span style={{ color: plan.accent, fontWeight: 900 }}>
          {plan.agents} agents
        </span>
      </p>

      {/* Badge essai */}
      <div
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-5 w-fit"
        style={{
          background: "rgba(52,211,153,0.08)",
          border: "1px solid rgba(52,211,153,0.22)",
        }}
      >
        <Shield size={10} style={{ color: "#34d399" }} />
        <span
          className="text-[9px] font-black uppercase tracking-[0.22em]"
          style={{ color: "rgba(52,211,153,0.85)" }}
        >
          7 jours gratuits
        </span>
      </div>

      {/* Séparateur */}
      <div
        className="w-full h-px mb-5"
        style={{
          background: `linear-gradient(90deg, transparent, ${plan.accent}20, transparent)`,
        }}
      />

      {/* Features */}
      <ul className="flex flex-col gap-2.5 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check
              size={12}
              className="mt-0.5 shrink-0"
              style={{ color: plan.accent }}
            />
            <span
              className="text-[11px] font-medium leading-snug"
              style={{ color: "rgba(148,163,184,0.75)" }}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <motion.button
        type="button"
        onClick={() => onCheckout(plan.priceId, plan.id)}
        disabled={!!loading}
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-[0.20em] transition-opacity duration-200"
        style={{
          background: plan.popular
            ? `linear-gradient(135deg, ${plan.accent}35, ${plan.accent}18)`
            : `${plan.accent}14`,
          border: `1px solid ${plan.accent}45`,
          color: plan.accent,
          boxShadow: plan.popular ? `0 0 20px ${plan.glow}` : "none",
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : null}
        {isLoading ? "Redirection…" : "Démarrer l'essai gratuit"}
      </motion.button>
    </motion.div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────
export default function TarifsEntreprise() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(priceId: string, planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data: { sessionId?: string; url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url)
        throw new Error(data.error ?? "Erreur serveur");

      // Redirection directe vers la page Stripe Checkout (pas besoin de @stripe/stripe-js)
      window.location.href = data.url;
    } catch (err) {
      console.error("[checkout]", err);
    } finally {
      setLoading(null);
    }
  }

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
          width: 900,
          height: 480,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(0,209,255,0.08) 0%, transparent 65%)",
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
          background: "rgba(11,20,38,0.80)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "rgba(148,163,184,0.60)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = CYAN;
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(0,209,255,0.30)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            "rgba(148,163,184,0.60)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(255,255,255,0.07)";
        }}
      >
        <ArrowLeft size={11} />
        Retour
      </motion.button>

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4 mt-14 mb-10"
      >
        {/* Logo */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(0,209,255,0.14) 0%, transparent 68%)",
            }}
          />
          <SecuProTechLogo width={160} />
        </div>

        {/* Titre */}
        <div className="text-center mt-2">
          <p
            className="text-[9px] font-black uppercase tracking-[0.5em] mb-2"
            style={{ color: "rgba(0,209,255,0.45)" }}
          >
            SecuPRO Business
          </p>
          <h1 className="text-[clamp(1.5rem,5vw,2.2rem)] font-black leading-tight tracking-tight">
            TARIFS{" "}
            <span
              style={{
                color: CYAN,
                textShadow:
                  "0 0 22px rgba(0,209,255,0.70), 0 0 55px rgba(0,209,255,0.30)",
              }}
            >
              ENTREPRISE
            </span>
          </h1>
          <p
            className="mt-2 text-[12px] font-semibold"
            style={{ color: "rgba(148,163,184,0.50)" }}
          >
            Choisissez le plan adapté à votre structure · Résiliable à tout moment
          </p>
        </div>
      </motion.div>

      {/* Séparateur */}
      <div
        className="w-full max-w-5xl mx-auto h-px mb-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,209,255,0.18), transparent)",
        }}
      />

      {/* ── GRILLE DES PLANS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl mx-auto grid gap-5 tarifs-grid"
      >
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            loading={loading}
            onCheckout={handleCheckout}
          />
        ))}
      </motion.div>

      {/* ── Note essai ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="text-center text-[10px] font-semibold mt-8"
        style={{ color: "rgba(148,163,184,0.35)" }}
      >
        Essai 7 jours sans engagement · Aucun prélèvement pendant la période d'essai
      </motion.p>

      {/* ── FOOTER ── */}
      <p
        className="text-center text-[9px] font-bold uppercase tracking-widest mt-6"
        style={{ color: "rgba(0,209,255,0.10)" }}
      >
        © 2026 SECUPRO COMMAND SYSTEM · SIRET 10335392600019
      </p>

      {/* ── Responsive ── */}
      <style>{`
        .tarifs-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 900px) {
          .tarifs-grid {
            grid-template-columns: 1fr;
            max-width: 420px;
            margin-left: auto;
            margin-right: auto;
          }
        }
        @media (min-width: 540px) and (max-width: 900px) {
          .tarifs-grid {
            grid-template-columns: repeat(2, 1fr);
            max-width: 680px;
          }
        }
      `}</style>
    </div>
  );
}
