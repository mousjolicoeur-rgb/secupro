"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  ArrowLeft, Check, Zap, Shield, Crown,
  Users, ChevronRight, Sparkles,
} from "lucide-react";

// ── Design tokens ──────────────────────────────────────────────────────────
const CYAN   = "#00d1ff";
const BLUE   = "#2563eb";
const GOLD   = "#f59e0b";
const GREEN  = "#34d399";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ── Plans ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id:        "starter",
    label:     "STARTER",
    price:     49,
    agents:    "Jusqu'à 50 agents",
    icon:      Zap,
    accent:    CYAN,
    accentBg:  "rgba(0,209,255,0.07)",
    border:    "rgba(0,209,255,0.22)",
    glow:      "rgba(0,209,255,0.18)",
    priceId:   "price_starter_id_ici", // ← Remplace avec ton vrai ID Stripe
    popular:   false,
    features: [
      "Gestion des agents & documents",
      "Alertes CNAPS automatiques",
      "Planning hebdomadaire",
      "Stockage carte pro, SST, CQP APS",
      "1 administrateur",
      "Support email",
    ],
  },
  {
    id:        "business",
    label:     "BUSINESS",
    price:     99,
    agents:    "Jusqu'à 150 agents",
    icon:      Shield,
    accent:    BLUE,
    accentBg:  "rgba(37,99,235,0.10)",
    border:    "rgba(37,99,235,0.35)",
    glow:      "rgba(37,99,235,0.25)",
    priceId:   "price_business_id_ici", // ← Remplace avec ton vrai ID Stripe
    popular:   true,
    features: [
      "Tout Starter inclus",
      "Import CSV en masse (500 agents)",
      "Dashboard performances",
      "Détection conflits horaires",
      "Export PDF & rapports",
      "3 administrateurs",
      "Support prioritaire < 4h",
    ],
  },
  {
    id:        "enterprise",
    label:     "ENTERPRISE",
    price:     199,
    agents:    "Jusqu'à 500 agents",
    icon:      Crown,
    accent:    GOLD,
    accentBg:  "rgba(245,158,11,0.07)",
    border:    "rgba(245,158,11,0.25)",
    glow:      "rgba(245,158,11,0.20)",
    priceId:   "price_enterprise_id_ici", // ← Remplace avec ton vrai ID Stripe
    popular:   false,
    features: [
      "Tout Business inclus",
      "Administrateurs illimités",
      "SecuIA — assistant légal IDCC 1351",
      "Actu Sécu — veille réglementaire",
      "Onboarding dédié à Lyon",
      "Account manager personnel",
      "SLA garanti 99,9%",
    ],
  },
] as const;

// ── Composant carte plan ───────────────────────────────────────────────────
function PlanCard({ plan, loading, onSelect }: {
  plan: typeof PLANS[number];
  loading: string | null;
  onSelect: (priceId: string, planId: string) => void;
}) {
  const Icon = plan.icon;
  const isLoading = loading === plan.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col rounded-2xl p-6"
      style={{
        background: plan.popular
          ? `linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.06))`
          : plan.accentBg,
        border: `1px solid ${plan.border}`,
        boxShadow: plan.popular
          ? `0 0 60px rgba(37,99,235,0.20), 0 4px 24px rgba(0,0,0,0.4)`
          : `0 4px 24px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Liseré haut */}
      <div
        aria-hidden
        className="absolute top-0 left-[15%] right-[15%] h-px rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${plan.accent}80, transparent)`,
        }}
      />

      {/* Badge populaire */}
      {plan.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em]"
          style={{
            background: `linear-gradient(90deg, ${BLUE}, #1d4ed8)`,
            boxShadow: `0 0 20px rgba(37,99,235,0.5)`,
            color: "#fff",
          }}
        >
          <Sparkles size={8} />
          PLUS POPULAIRE
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl"
          style={{
            background: `${plan.accent}14`,
            border: `1px solid ${plan.accent}30`,
            boxShadow: `0 0 18px ${plan.accent}20`,
          }}
        >
          <Icon size={20} style={{ color: plan.accent }} />
        </div>
        <div
          className="text-[9px] font-black uppercase tracking-[0.35em] px-2.5 py-1 rounded-full"
          style={{
            background: `${plan.accent}12`,
            border: `1px solid ${plan.accent}25`,
            color: plan.accent,
          }}
        >
          {plan.agents}
        </div>
      </div>

      {/* Nom + Prix */}
      <div className="mb-6">
        <p
          className="text-[11px] font-black uppercase tracking-[0.25em] mb-2"
          style={{ color: `${plan.accent}90` }}
        >
          {plan.label}
        </p>
        <div className="flex items-end gap-1">
          <span
            className="text-[2.8rem] font-black leading-none tracking-tight"
            style={{
              color: "#f1f5f9",
              textShadow: `0 0 30px ${plan.accent}40`,
            }}
          >
            {plan.price}€
          </span>
          <span
            className="text-[12px] font-semibold mb-2"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            /mois
          </span>
        </div>
        <p
          className="text-[10px] font-semibold mt-1"
          style={{ color: "rgba(148,163,184,0.4)" }}
        >
          + 7 jours d&apos;essai gratuit
        </p>
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-2.5 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <div
              className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
              style={{
                background: `${plan.accent}15`,
                border: `1px solid ${plan.accent}30`,
              }}
            >
              <Check size={9} style={{ color: plan.accent }} />
            </div>
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
        onClick={() => onSelect(plan.priceId, plan.id)}
        disabled={!!loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-200"
        style={{
          background: plan.popular
            ? `linear-gradient(90deg, ${BLUE}, #1d4ed8)`
            : `${plan.accent}18`,
          border: `1px solid ${plan.border}`,
          color: plan.popular ? "#fff" : plan.accent,
          boxShadow: plan.popular ? `0 0 24px rgba(37,99,235,0.35)` : "none",
          opacity: loading && !isLoading ? 0.5 : 1,
        }}
      >
        {isLoading ? (
          <div
            className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${plan.accent}60`, borderTopColor: "transparent" }}
          />
        ) : (
          <>
            Démarrer l&apos;essai gratuit
            <ChevronRight size={13} />
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────
export default function TarifsEntreprise() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (priceId: string, planId: string) => {
    try {
      setLoading(planId);
      setError(null);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors du paiement");

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe non chargé");

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) throw new Error(stripeError.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

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

      {/* Bouton retour */}
      <motion.button
        type="button"
        onClick={() => router.push("/espace-societe")}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.22em] backdrop-blur-md"
        style={{
          background: "rgba(11,20,38,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "rgba(148,163,184,0.6)",
        }}
      >
        <ArrowLeft size={11} />
        Retour
      </motion.button>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4 mt-12 mb-10"
      >
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

        <div className="text-center">
          <p
            className="text-[9px] font-black uppercase tracking-[0.5em] mb-2"
            style={{ color: "rgba(0,209,255,0.45)" }}
          >
            SecuPRO Business
          </p>
          <h1 className="text-[clamp(1.5rem,5vw,2.2rem)] font-black leading-tight tracking-tight">
            CHOISISSEZ VOTRE{" "}
            <span
              style={{
                color: CYAN,
                textShadow: "0 0 22px rgba(0,209,255,0.7), 0 0 55px rgba(0,209,255,0.3)",
              }}
            >
              FORMULE
            </span>
          </h1>
          <p
            className="mt-2 text-[11px] font-semibold"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            7 jours d&apos;essai gratuit · Sans engagement · Résiliable à tout moment
          </p>
        </div>

        {/* Badge agents */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
          style={{
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.2)",
            color: GREEN,
          }}
        >
          <Users size={11} />
          Conçu par un agent de terrain · Pour les professionnels de la sécurité
        </div>
      </motion.div>

      {/* Séparateur */}
      <div
        className="w-full max-w-5xl mx-auto h-px mb-10"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.18), transparent)",
        }}
      />

      {/* Erreur */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-5xl mx-auto mb-6 px-4 py-3 rounded-xl text-[11px] font-semibold text-center"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
          }}
        >
          {error}
        </motion.div>
      )}

      {/* GRILLE DES PLANS */}
      <div className="w-full max-w-5xl mx-auto grid gap-5 plans-grid">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            loading={loading}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Note de bas */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-[10px] font-semibold mt-10"
        style={{ color: "rgba(148,163,184,0.35)" }}
      >
        Paiement sécurisé par Stripe · TVA non applicable art. 293B du CGI · SIRET 10335392600019
      </motion.p>

      {/* Responsive */}
      <style>{`
        .plans-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 900px) {
          .plans-grid {
            grid-template-columns: 1fr;
            max-width: 420px;
            margin-left: auto;
            margin-right: auto;
          }
        }
        @media (min-width: 600px) and (max-width: 900px) {
          .plans-grid {
            grid-template-columns: repeat(2, 1fr);
            max-width: 680px;
          }
        }
      `}</style>
    </div>
  );
}
