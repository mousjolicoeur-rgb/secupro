"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

const NAVY   = "#060E18";
const NAVY_2 = "#091527";
const CYAN   = "#00C8F0";
const ORANGE = "#F5822A";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Plan {
  id: string;
  name: string;
  price: string;
  agents: string;
  priceId: string;
  highlight: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "essentiel",
    name: "Essentiel",
    price: "69,99",
    agents: "Jusqu'à 10 agents",
    priceId: "price_1TIIyL2MgRlKiK2HV8OIvkwV",
    highlight: false,
    features: [
      "Dashboard Live",
      "Import effectifs CSV",
      "Alertes Push",
      "Conformité CNAPS",
      "Rapports PDF mensuels",
      "Support email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "149,99",
    agents: "Jusqu'à 50 agents",
    priceId: "price_1TIIz92MgRlKiK2HuZhM02Id",
    highlight: true,
    features: [
      "Tout Essentiel +",
      "Plannings IA",
      "Multi-sites illimités",
      "Export CNAPS automatisé",
      "Rapports personnalisés",
      "Support prioritaire 7j/7",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "249,99",
    agents: "Agents illimités",
    priceId: "price_1TIJ012MgRlKiK2HLsnto1el",
    highlight: false,
    features: [
      "Tout Pro +",
      "API entreprise",
      "Intégration logiciels tiers",
      "Manager dédié",
      "SLA 99,9%",
      "Onboarding personnalisé",
    ],
  },
];

/* ── Inner page (uses useSearchParams — must be inside Suspense) ─────────── */
function PaiementPageInner() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const userId        = searchParams.get("userId") ?? "";
  const nomSociete    = searchParams.get("nom") ?? "";
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError]             = useState("");

  useEffect(() => {
    if (!userId) router.replace("/inscription");
  }, [userId, router]);

  const handleSelectPlan = async (plan: Plan) => {
    if (!userId) return;
    setError("");
    setLoadingPlan(plan.id);

    try {
      await stripePromise;

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId, societeId: userId }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || data.error) {
        setError(data.error ?? "Erreur lors de la création de la session Stripe.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!userId) return null;

  return (
    <div
      style={{
        background: NAVY,
        minHeight: "100vh",
        color: "#f1f5f9",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,600&display=swap');
        .plan-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .plan-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid rgba(0,200,240,0.07)",
          background: "rgba(6,14,24,0.95)",
          padding: "18px 24px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/entreprises" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: "1.4rem",
                letterSpacing: "2px",
              }}
            >
              <span style={{ color: "#fff" }}>Secu</span>
              <span style={{ color: CYAN }}>PRO</span>
              <span style={{ color: ORANGE, fontSize: "0.9rem", marginLeft: "5px" }}>
                TECH
              </span>
            </span>
          </Link>

          {/* Compte créé badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "20px",
              padding: "6px 14px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 6px rgba(34,197,94,0.8)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(34,197,94,0.8)",
              }}
            >
              Compte créé
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "64px 24px 80px",
        }}
      >
        {/* Progress steps */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "56px",
          }}
        >
          {(
            [
              { num: 1, label: "Compte créé",    done: true,  active: false },
              { num: 2, label: "Choisir un plan", done: false, active: true  },
              { num: 3, label: "Paiement Stripe", done: false, active: false },
            ] as { num: number; label: string; done: boolean; active: boolean }[]
          ).map((step, i) => (
            <div key={step.num} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: step.done
                      ? "#22c55e"
                      : step.active
                      ? `linear-gradient(135deg, #009BB8, ${CYAN})`
                      : NAVY_2,
                    border: `2px solid ${
                      step.done
                        ? "#22c55e"
                        : step.active
                        ? CYAN
                        : "rgba(255,255,255,0.1)"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      step.done || step.active ? NAVY : "rgba(255,255,255,0.25)",
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "15px",
                    fontWeight: 700,
                    boxShadow: step.active
                      ? `0 0 20px rgba(0,200,240,0.35)`
                      : "none",
                  }}
                >
                  {step.done ? "✓" : step.num}
                </div>
                <span
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: step.done
                      ? "#22c55e"
                      : step.active
                      ? CYAN
                      : "rgba(255,255,255,0.2)",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  style={{
                    width: "80px",
                    height: "2px",
                    background: step.done
                      ? "#22c55e"
                      : "rgba(255,255,255,0.06)",
                    margin: "0 8px",
                    marginBottom: "22px",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(0,200,240,0.5)",
              marginBottom: "12px",
            }}
          >
            Étape 2 sur 3
          </p>
          <h1
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#fff",
              margin: "0 0 12px",
            }}
          >
            Choisissez votre plan
          </h1>
          {nomSociete && (
            <p
              style={{
                fontSize: "14px",
                color: "rgba(148,163,184,0.65)",
                lineHeight: 1.6,
              }}
            >
              Bienvenue,{" "}
              <strong style={{ color: CYAN }}>{nomSociete}</strong> —{" "}
              1 mois d&apos;essai gratuit, sans engagement.
            </p>
          )}
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "12px",
              padding: "14px 20px",
              color: "#fca5a5",
              fontSize: "13px",
              marginBottom: "28px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Plans grid */}
        <div className="plan-grid">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              loading={loadingPlan}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        {/* Trust badge */}
        <p
          style={{
            textAlign: "center",
            marginTop: "32px",
            fontSize: "12px",
            color: "rgba(100,116,139,0.45)",
          }}
        >
          Paiement sécurisé via{" "}
          <span style={{ color: "rgba(0,200,240,0.6)", fontWeight: 600 }}>
            Stripe
          </span>{" "}
          · Facturation mensuelle · Données hébergées en France
        </p>
      </main>
    </div>
  );
}

/* ── PlanCard ────────────────────────────────────────────────────────────── */
function PlanCard({
  plan,
  loading,
  onSelect,
}: {
  plan: Plan;
  loading: string | null;
  onSelect: (plan: Plan) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isLoading = loading === plan.id;
  const anyLoading = loading !== null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: plan.highlight
          ? `linear-gradient(145deg, rgba(0,200,240,0.10) 0%, ${NAVY_2} 100%)`
          : `rgba(9,21,39,0.85)`,
        border: `1px solid ${
          plan.highlight
            ? "rgba(0,200,240,0.4)"
            : hovered
            ? "rgba(255,255,255,0.14)"
            : "rgba(255,255,255,0.06)"
        }`,
        borderRadius: "22px",
        padding: "36px 28px",
        display: "flex",
        flexDirection: "column",
        gap: "22px",
        position: "relative",
        transform: plan.highlight
          ? hovered
            ? "translateY(-10px)"
            : "translateY(-6px)"
          : hovered
          ? "translateY(-4px)"
          : "translateY(0)",
        boxShadow: plan.highlight
          ? `0 0 60px rgba(0,200,240,0.14), 0 24px 48px rgba(0,0,0,0.4)`
          : hovered
          ? "0 24px 48px rgba(0,0,0,0.2)"
          : "none",
        transition: "all 0.25s ease",
      }}
    >
      {plan.highlight && (
        <div
          style={{
            position: "absolute",
            top: "-1px",
            left: "50%",
            transform: "translateX(-50%)",
            background: `linear-gradient(90deg, #009BB8, ${CYAN})`,
            color: NAVY,
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            padding: "5px 22px",
            borderRadius: "0 0 10px 10px",
          }}
        >
          Le plus populaire
        </div>
      )}

      {/* Price */}
      <div>
        <p
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: plan.highlight ? CYAN : "rgba(255,255,255,0.35)",
            marginBottom: "10px",
          }}
        >
          {plan.name}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "42px",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {plan.price}
          </span>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>
            €/mois HT
          </span>
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "rgba(148,163,184,0.5)",
            marginTop: "5px",
          }}
        >
          {plan.agents}
        </p>
      </div>

      <div
        style={{
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${
            plan.highlight
              ? "rgba(0,200,240,0.25)"
              : "rgba(255,255,255,0.07)"
          }, transparent)`,
        }}
      />

      {/* Features */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,
        }}
      >
        {plan.features.map((f) => (
          <li
            key={f}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              fontSize: "13px",
              color: "rgba(203,213,225,0.8)",
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                color: plan.highlight ? CYAN : ORANGE,
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSelect(plan)}
        disabled={anyLoading}
        style={{
          width: "100%",
          padding: "15px 0",
          background: isLoading
            ? "rgba(0,200,240,0.2)"
            : plan.highlight
            ? `linear-gradient(135deg, #009BB8 0%, ${CYAN} 100%)`
            : "rgba(255,255,255,0.06)",
          border: `1px solid ${plan.highlight ? "transparent" : "rgba(255,255,255,0.1)"}`,
          color: isLoading
            ? "rgba(255,255,255,0.4)"
            : plan.highlight
            ? NAVY
            : "#fff",
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: anyLoading ? "not-allowed" : "pointer",
          borderRadius: "12px",
          boxShadow: plan.highlight && !isLoading ? `0 0 32px rgba(0,200,240,0.3)` : "none",
          transition: "all 0.2s",
        }}
      >
        {isLoading ? "Chargement..." : "Démarrer l'essai gratuit →"}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: "10px",
          color: "rgba(100,116,139,0.5)",
          lineHeight: 1.5,
        }}
      >
        1 mois gratuit · Sans engagement · Résiliation en 1 clic
      </p>
    </div>
  );
}

/* ── Loading skeleton ────────────────────────────────────────────────────── */
function LoadingFallback() {
  return (
    <div
      style={{
        background: NAVY,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: CYAN,
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: "14px",
        fontWeight: 700,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      Chargement...
    </div>
  );
}

/* ── Exported page (Suspense boundary for useSearchParams) ───────────────── */
export default function PaiementPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaiementPageInner />
    </Suspense>
  );
}
