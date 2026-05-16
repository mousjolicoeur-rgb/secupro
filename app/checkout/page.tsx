"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/* ─────────────────────────────────────────────────────────────────────────────
   DONNÉES PLANS
───────────────────────────────────────────────────────────────────────────── */

type PlanKey = "starter" | "business" | "enterprise";

const PLANS = {
  starter: {
    name:      "Starter",
    price:     "49,99",
    priceNum:  49.99,
    agents:    "1 à 10 agents",
    agentKey:  "1-10",
    color:     "#1a6bcc",
    features: [
      "Jusqu'à 10 agents",
      "Import CSV / Excel",
      "Suivi CNAPS & SST",
      "Alertes J-30 automatiques",
      "Export CSV",
      "Support email",
    ],
  },
  business: {
    name:      "Business",
    price:     "99,99",
    priceNum:  99.99,
    agents:    "11 à 50 agents",
    agentKey:  "11-50",
    color:     "#00d4ff",
    popular:   true,
    features: [
      "Jusqu'à 50 agents",
      "Tout Starter inclus",
      "Import IA (PDF inclus)",
      "Détection repos 11h",
      "SOS Dispatch",
      "Export PDF + comptabilité",
      "Support prioritaire",
    ],
  },
  enterprise: {
    name:      "Enterprise",
    price:     "199,99",
    priceNum:  199.99,
    agents:    "51 à 100 agents",
    agentKey:  "51-100",
    color:     "#7c3aed",
    features: [
      "Jusqu'à 100 agents",
      "Tout Business inclus",
      "Multi-sites",
      "SecuIA assistant juridique",
      "Cockpit chef d'exploitation",
      "Account manager dédié",
      "Onboarding personnalisé",
    ],
  },
} as const;

const AGENT_RANGES = ["1-10", "11-50", "51-100", "100+"] as const;
type AgentRange = typeof AGENT_RANGES[number];

const RANGE_TO_PLAN: Record<AgentRange, PlanKey> = {
  "1-10":   "starter",
  "11-50":  "business",
  "51-100": "enterprise",
  "100+":   "enterprise",
};

/* ─────────────────────────────────────────────────────────────────────────────
   COULEURS / CONSTANTS
───────────────────────────────────────────────────────────────────────────── */

const C = {
  bg:       "#060b18",
  bgCard:   "rgba(255,255,255,0.03)",
  bgInput:  "rgba(255,255,255,0.05)",
  border:   "rgba(255,255,255,0.08)",
  borderFocus: "rgba(0,212,255,0.5)",
  cyan:     "#00d4ff",
  blue:     "#1a6bcc",
  text:     "#e2e8f0",
  muted:    "rgba(148,163,184,0.72)",
  error:    "#f87171",
  font:     "'Barlow', 'Inter', system-ui, sans-serif",
  fontCond: "'Barlow Condensed', 'Inter', system-ui, sans-serif",
};

/* ─────────────────────────────────────────────────────────────────────────────
   SOUS-COMPOSANTS
───────────────────────────────────────────────────────────────────────────── */

function InputField({
  label, id, type = "text", placeholder, value, onChange, required, pattern,
}: {
  label: string; id: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  required?: boolean; pattern?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>
        {label}{required && <span style={{ color: C.cyan, marginLeft: 3 }}>*</span>}
      </label>
      <input
        id={id} type={type} placeholder={placeholder} value={value} required={required} pattern={pattern}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14, color: C.text,
          background: C.bgInput,
          border: `1px solid ${focused ? C.borderFocus : C.border}`,
          outline: "none", transition: "border-color 0.2s",
        }}
      />
    </div>
  );
}

function CardIcon({ type }: { type: "visa" | "mc" | "amex" | "sepa" }) {
  const cfg = {
    visa:  { bg: "#1a1f6e", text: "#fff",    label: "VISA",   w: 44 },
    mc:    { bg: "#eb001b", text: "#fff",    label: "MC",     w: 36, extra: "#f79e1b" },
    amex:  { bg: "#006fcf", text: "#fff",    label: "AMEX",   w: 44 },
    sepa:  { bg: "#003087", text: "#fff",    label: "SEPA",   w: 44 },
  }[type];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 24, width: cfg.w, borderRadius: 4, background: cfg.bg, flexShrink: 0 }}>
      {type === "mc" ? (
        <div style={{ display: "flex" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#eb001b", marginRight: -5 }} />
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#f79e1b", opacity: 0.9 }} />
        </div>
      ) : (
        <span style={{ fontSize: 9, fontWeight: 900, color: cfg.text, letterSpacing: "0.05em" }}>{cfg.label}</span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────────────────────────────────────────── */

function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pré-sélectionne le plan depuis l'URL (?plan=business)
  const initialPlan = (searchParams.get("plan") as PlanKey | null) ?? "business";

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(
    Object.keys(PLANS).includes(initialPlan) ? initialPlan : "business"
  );
  const [agentRange, setAgentRange]   = useState<AgentRange>(PLANS[selectedPlan].agentKey as AgentRange);

  // Formulaire société
  const [societe, setSociete]     = useState("");
  const [siret, setSiret]         = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail]         = useState("");

  // État submit
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");

  // Sync plan ↔ tranche agents
  const handlePlanSelect = (plan: PlanKey) => {
    setSelectedPlan(plan);
    setAgentRange(PLANS[plan].agentKey as AgentRange);
  };
  const handleRangeSelect = (range: AgentRange) => {
    setAgentRange(range);
    setSelectedPlan(RANGE_TO_PLAN[range]);
  };

  const plan = PLANS[selectedPlan];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          societe_name: societe,
          siret,
          telephone,
          email,
          nb_agents: agentRange,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Erreur serveur");
      if (data.url) router.push(data.url);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Erreur inconnue. Réessayez.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={{ background: C.bg, color: C.text, fontFamily: C.font, minHeight: "100vh", overflowX: "hidden" }}>

        {/* ─── NAV ──────────────────────────────────────────────────────────── */}
        <nav style={{
          borderBottom: `1px solid ${C.border}`, padding: "0 clamp(16px,5vw,48px)",
          background: "rgba(6,11,24,0.97)", position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <Link href="/entreprises" style={{ display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/secupro-logo.svg" alt="SecuPRO" height={26} width={98} />
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>🔒</span>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Paiement sécurisé SSL</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.18)" }}>
                <span style={{ fontSize: 11, color: C.cyan, fontWeight: 700 }}>Stripe · PCI DSS</span>
              </div>
            </div>
          </div>
        </nav>

        {/* ─── LAYOUT PRINCIPAL ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(24px,4vw,56px) clamp(16px,5vw,48px)" }}>

          {/* Titre page */}
          <div style={{ textAlign: "center", marginBottom: "clamp(32px,4vw,56px)" }}>
            <p style={{ fontSize: 11, color: C.cyan, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>Inscription</p>
            <h1 style={{ fontFamily: C.fontCond, fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: "#fff" }}>
              Démarrez votre essai gratuit
            </h1>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>
              1 mois offert · Sans carte bancaire · Résiliable à tout moment
            </p>
          </div>

          <form onSubmit={e => void handleSubmit(e)}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)", gap: "clamp(24px,3vw,40px)", alignItems: "start" }}>

              {/* ══════════════════════════════════════════════════════════════
                  COLONNE GAUCHE — Résumé commande
              ══════════════════════════════════════════════════════════════ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Sélecteur plans */}
                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                  <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>Choisissez votre plan</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(Object.entries(PLANS) as [PlanKey, typeof PLANS["business"]][]).map(([key, p]) => {
                      const active = selectedPlan === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handlePlanSelect(key)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 16px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                            background: active ? `${p.color}14` : "rgba(255,255,255,0.02)",
                            border: `1.5px solid ${active ? p.color + "60" : C.border}`,
                            boxShadow: active ? `0 0 20px ${p.color}12` : "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                              border: `2px solid ${active ? p.color : "#334155"}`,
                              background: active ? p.color : "transparent",
                              transition: "all 0.2s",
                            }} />
                            <div style={{ textAlign: "left" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: active ? "#fff" : C.muted }}>{p.name}</span>
                                {"popular" in p && p.popular && (
                                  <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#020810", background: C.cyan, padding: "2px 7px", borderRadius: 99 }}>⭐ Populaire</span>
                                )}
                              </div>
                              <span style={{ fontSize: 11, color: "#64748b" }}>{p.agents}</span>
                            </div>
                          </div>
                          <span style={{ fontSize: 16, fontWeight: 900, color: active ? p.color : C.muted, whiteSpace: "nowrap" }}>
                            {p.price}€<span style={{ fontSize: 11, fontWeight: 400, color: "#64748b" }}>/mois</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Récapitulatif plan actif */}
                <div style={{ background: C.bgCard, border: `1.5px solid ${plan.color}30`, borderRadius: 16, padding: 20, boxShadow: `0 0 32px ${plan.color}08` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: C.fontCond }}>{plan.name}</p>
                      <p style={{ fontSize: 12, color: C.muted }}>{plan.agents}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 24, fontWeight: 900, color: plan.color, fontFamily: C.fontCond }}>{plan.price}€</p>
                      <p style={{ fontSize: 10, color: "#64748b" }}>/mois HT</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: C.cyan, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: 13, color: C.text }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total + badge essai gratuit */}
                <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 14, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: C.muted }}>Aujourd&apos;hui</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#22c55e", fontFamily: C.fontCond }}>0,00 €</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <span style={{ fontSize: 13, color: C.muted }}>Après 1 mois</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{plan.price}€ / mois</span>
                  </div>
                  <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🎁</span>
                    <p style={{ fontSize: 12, color: "#86efac", lineHeight: 1.5 }}>
                      <strong>1 mois gratuit</strong> — Aucun débit avant 1 mois. Résiliable à tout moment depuis votre espace.
                    </p>
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════════════
                  COLONNE DROITE — Formulaire
              ══════════════════════════════════════════════════════════════ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Section : Informations société */}
                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🏢</span> Informations société
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <InputField
                      label="Raison sociale" id="societe" placeholder="SOCIETE SECURITE LYON"
                      value={societe} onChange={setSociete} required
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <InputField
                        label="SIRET" id="siret" placeholder="10335392600019"
                        value={siret} onChange={setSiret}
                        pattern="[0-9]{14}"
                      />
                      <InputField
                        label="Téléphone" id="telephone" type="tel" placeholder="04 XX XX XX XX"
                        value={telephone} onChange={setTelephone}
                      />
                    </div>
                    <InputField
                      label="Email professionnel" id="email" type="email" placeholder="direction@votre-societe.fr"
                      value={email} onChange={setEmail} required
                    />
                  </div>
                </div>

                {/* Section : Nombre d'agents */}
                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>👥</span> Nombre d&apos;agents
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {AGENT_RANGES.map(range => {
                      const active = agentRange === range;
                      return (
                        <button
                          key={range}
                          type="button"
                          onClick={() => handleRangeSelect(range)}
                          style={{
                            padding: "10px 6px", borderRadius: 10, cursor: "pointer",
                            fontSize: 13, fontWeight: 700, transition: "all 0.2s", textAlign: "center",
                            background: active ? `${PLANS[RANGE_TO_PLAN[range]].color}18` : "rgba(255,255,255,0.03)",
                            border: `1.5px solid ${active ? PLANS[RANGE_TO_PLAN[range]].color + "55" : C.border}`,
                            color: active ? "#fff" : C.muted,
                          }}
                        >
                          {range}
                        </button>
                      );
                    })}
                  </div>
                  {agentRange === "100+" && (
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
                      Pour plus de 100 agents, contactez-nous à <a href="mailto:contact@secupro.app" style={{ color: C.cyan }}>contact@secupro.app</a>
                    </p>
                  )}
                </div>

                {/* Section : Paiement */}
                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>💳</span> Paiement
                    </p>
                    <div style={{ display: "flex", gap: 5 }}>
                      <CardIcon type="visa" />
                      <CardIcon type="mc" />
                      <CardIcon type="amex" />
                      <CardIcon type="sepa" />
                    </div>
                  </div>

                  {/* Champs carte — visuels uniquement, Stripe prend le relais */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>
                        Numéro de carte
                      </label>
                      <div style={{
                        display: "flex", alignItems: "center", padding: "11px 14px", borderRadius: 10,
                        background: C.bgInput, border: `1px solid ${C.border}`, gap: 8,
                      }}>
                        <span style={{ fontSize: 14, color: "#334155", letterSpacing: "0.2em", flex: 1 }}>•••• •••• •••• ••••</span>
                        <span style={{ fontSize: 11, color: "#334155" }}>💳</span>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>
                          Date d&apos;expiration
                        </label>
                        <div style={{ padding: "11px 14px", borderRadius: 10, background: C.bgInput, border: `1px solid ${C.border}`, fontSize: 14, color: "#334155", letterSpacing: "0.1em" }}>
                          MM / AA
                        </div>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>
                          CVC
                        </label>
                        <div style={{ padding: "11px 14px", borderRadius: 10, background: C.bgInput, border: `1px solid ${C.border}`, fontSize: 14, color: "#334155", letterSpacing: "0.2em" }}>
                          •••
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 8 }}>
                    <span style={{ fontSize: 12 }}>🔒</span>
                    <p style={{ fontSize: 11, color: C.muted }}>
                      Vous serez redirigé vers <strong style={{ color: C.cyan }}>Stripe</strong> pour saisir vos informations de paiement en toute sécurité.
                    </p>
                  </div>
                </div>

                {/* Erreur API */}
                {apiError && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: 13, color: C.error }}>{apiError}</p>
                  </div>
                )}

                {/* Bouton CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "17px 24px", borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer",
                    background: loading ? "rgba(0,212,255,0.4)" : C.cyan,
                    color: "#020810", fontSize: 16, fontWeight: 700,
                    boxShadow: loading ? "none" : `0 0 32px rgba(0,212,255,0.35)`,
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: 18, height: 18, border: "2.5px solid rgba(2,8,16,0.4)", borderTopColor: "#020810", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Redirection vers Stripe…
                    </>
                  ) : (
                    <>Démarrer mon essai gratuit →</>
                  )}
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                {/* Garanties */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 20px" }}>
                  {[
                    "Aucun frais aujourd'hui",
                    "Résiliable à tout moment",
                    "Données hébergées en France 🇫🇷",
                  ].map(g => (
                    <div key={g} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: "#22c55e", fontSize: 12 }}>✓</span>
                      <span style={{ fontSize: 12, color: C.muted }}>{g}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* ─── FOOTER MINIMAL ───────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "20px clamp(16px,5vw,48px)", marginTop: 32 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 12, color: "#374151" }}>© 2026 SecuPRO — SIRET 10335392600019</p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Mentions légales", "CGV", "Confidentialité"].map(l => (
                <span key={l} style={{ fontSize: 12, color: "#374151", cursor: "pointer" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ background: "#060b18", minHeight: "100vh" }} />}>
      <CheckoutPageInner />
    </Suspense>
  );
}
