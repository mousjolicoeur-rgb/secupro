"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

/* ── Design tokens ─────────────────────────────────────────────────────── */
const NAVY   = "#060E18";
const NAVY_2 = "#091527";
const NAVY_3 = "#0D1F35";
const CYAN   = "#00C8F0";
const ORANGE = "#F5822A";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface ModuleItem {
  id: string;
  icon: string;
  label: string;
  desc: string;
  accent: string;
  bentoClass: string;
}

interface InfractionItem {
  rank: string;
  infraction: string;
  weight?: string;
  isTop?: boolean;
  solution: string;
}

interface PlanItem {
  id: string;
  name: string;
  price: string;
  agents: string;
  highlight: boolean;
  features: string[];
  cta: string;
  href: string;
}

/* ── Data ───────────────────────────────────────────────────────────────── */
const MODULES: ModuleItem[] = [
  {
    id: "csv",
    icon: "📊",
    label: "Effectifs CSV",
    desc: "Importez et exportez vos registres d'agents en format CNAPS compatible. Mise à jour et synchronisation en temps réel.",
    accent: CYAN,
    bentoClass: "bento-m1",
  },
  {
    id: "ia",
    icon: "🤖",
    label: "Plannings IA",
    desc: "L'IA génère vos plannings optimisés selon habilitations, vacations et contraintes légales.",
    accent: CYAN,
    bentoClass: "bento-m2",
  },
  {
    id: "live",
    icon: "📡",
    label: "Dashboard Live",
    desc: "Présences, anomalies, alertes — vue multi-sites en temps réel.",
    accent: CYAN,
    bentoClass: "bento-m3",
  },
  {
    id: "pdf",
    icon: "📄",
    label: "Rapports PDF",
    desc: "Génération mensuelle automatique des rapports d'activité et de conformité CNAPS.",
    accent: ORANGE,
    bentoClass: "bento-m4",
  },
  {
    id: "cnaps",
    icon: "🛡️",
    label: "Conformité CNAPS",
    desc: "Suivi continu des cartes pro, TFP APS, habilitations et dates de renouvellement réglementaire.",
    accent: ORANGE,
    bentoClass: "bento-m5",
  },
  {
    id: "alerts",
    icon: "🔔",
    label: "Alertes Push",
    desc: "Notifications immédiates : carte expirée, absence injustifiée, incident terrain.",
    accent: ORANGE,
    bentoClass: "bento-m6",
  },
];

const INFRACTIONS: InfractionItem[] = [
  {
    rank: "01",
    infraction: "Exercice sans carte professionnelle valide",
    weight: "75% des dossiers CNAPS",
    isTop: true,
    solution:
      "Alertes automatiques J-60 / J-30 / J-7 avant expiration. Renouvellement guidé et traçabilité intégrée.",
  },
  {
    rank: "02",
    infraction: "Défaut d'habilitation préalable du dirigeant",
    solution:
      "Tableau dirigeants avec statut CNAPS en temps réel et alertes d'expiration avant chaque audit.",
  },
  {
    rank: "03",
    infraction: "Emploi d'agents non titulaires du TFP APS",
    solution:
      "Vérification automatique du TFP APS avant toute affectation. Blocage si non conforme.",
  },
  {
    rank: "04",
    infraction: "Absence du livre de police (registre d'activité)",
    solution:
      "Registre numérique automatisé, exportable en format CNAPS à la demande, horodaté et signé.",
  },
  {
    rank: "05",
    infraction: "Défaut d'assurance responsabilité civile professionnelle",
    solution:
      "Suivi et alertes d'expiration des contrats RC Pro dans le module documents centralisé.",
  },
  {
    rank: "06",
    infraction: "Non-respect de la tenue réglementaire",
    solution:
      "Checklist terrain validée numériquement par le chef de site à chaque prise de poste.",
  },
  {
    rank: "07",
    infraction: "Sous-traitance à une entreprise non autorisée CNAPS",
    solution:
      "Vérification automatique du statut CNAPS des sous-traitants avant signature de contrat.",
  },
  {
    rank: "08",
    infraction: "Dépassement des plafonds horaires légaux",
    solution:
      "Calcul temps réel du temps de travail avec blocage et alertes avant tout dépassement légal.",
  },
  {
    rank: "09",
    infraction: "Absence du DUERP (Document Unique des Risques)",
    solution:
      "Modèles DUERP sécurité privée pré-remplis, mis à jour annuellement et exportables en PDF.",
  },
  {
    rank: "10",
    infraction: "Défaut de formation continue obligatoire",
    solution:
      "Suivi des heures de formation avec rappels automatiques et export des attestations validées.",
  },
];

const PLANS: PlanItem[] = [
  {
    id: "essentiel",
    name: "Essentiel",
    price: "69,99",
    agents: "Jusqu'à 10 agents",
    highlight: false,
    features: [
      "Dashboard Live",
      "Import effectifs CSV",
      "Alertes Push",
      "Conformité CNAPS",
      "Rapports PDF mensuels",
      "Support email",
    ],
    cta: "Commencer l'essai gratuit",
    href: "/espace-societe/activate",
  },
  {
    id: "pro",
    name: "Pro",
    price: "149,99",
    agents: "Jusqu'à 50 agents",
    highlight: true,
    features: [
      "Tout Essentiel +",
      "Plannings IA",
      "Multi-sites illimités",
      "Export CNAPS automatisé",
      "Rapports personnalisés",
      "Support prioritaire 7j/7",
    ],
    cta: "Commencer l'essai gratuit",
    href: "/espace-societe/activate",
  },
  {
    id: "premium",
    name: "Premium",
    price: "249,99",
    agents: "Agents illimités",
    highlight: false,
    features: [
      "Tout Pro +",
      "API entreprise",
      "Intégration logiciels tiers",
      "Manager dédié",
      "SLA 99,9%",
      "Onboarding personnalisé",
    ],
    cta: "Demander une démo",
    href: "/espace-societe/activate",
  },
];

/* ── ModuleCard ─────────────────────────────────────────────────────────── */
function ModuleCard({ mod }: { mod: ModuleItem }) {
  const [hovered, setHovered] = useState(false);
  const isCyan = mod.accent === CYAN;

  return (
    <div
      className={mod.bentoClass}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: `linear-gradient(145deg, ${NAVY_2} 0%, ${NAVY_3} 100%)`,
        border: `1px solid ${
          hovered
            ? isCyan
              ? "rgba(0,200,240,0.35)"
              : "rgba(245,130,42,0.35)"
            : "rgba(255,255,255,0.06)"
        }`,
        borderRadius: "20px",
        padding: "28px 28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        transition: "border-color 0.25s, transform 0.25s, box-shadow 0.25s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? isCyan
            ? "0 24px 48px rgba(0,200,240,0.07), 0 0 0 1px rgba(0,200,240,0.1)"
            : "0 24px 48px rgba(245,130,42,0.07), 0 0 0 1px rgba(245,130,42,0.1)"
          : "none",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {/* Corner accent glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: isCyan
            ? "radial-gradient(circle, rgba(0,200,240,0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(245,130,42,0.06) 0%, transparent 70%)",
          transform: "translate(40px, -40px)",
          transition: "opacity 0.3s",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          background: isCyan
            ? "rgba(0,200,240,0.07)"
            : "rgba(245,130,42,0.07)",
          border: `1px solid ${isCyan ? "rgba(0,200,240,0.14)" : "rgba(245,130,42,0.14)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          flexShrink: 0,
        }}
      >
        {mod.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "19px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "#ffffff",
            margin: "0 0 10px",
          }}
        >
          {mod.label}
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(148,163,184,0.75)",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {mod.desc}
        </p>
      </div>

      {/* Link */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          fontWeight: 700,
          fontFamily: "'Rajdhani', sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: isCyan ? CYAN : ORANGE,
          opacity: hovered ? 1 : 0.5,
          transition: "opacity 0.2s",
        }}
      >
        En savoir plus →
      </div>
    </div>
  );
}

/* ── InfractionRow ──────────────────────────────────────────────────────── */
function InfractionRow({ inf }: { inf: InfractionItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(90deg, rgba(245,130,42,0.04) 0%, rgba(9,21,39,0.5) 100%)`
          : "transparent",
        border: `1px solid ${hovered ? "rgba(245,130,42,0.18)" : "rgba(255,255,255,0.04)"}`,
        borderRadius: "12px",
        padding: "16px 22px",
        transition: "all 0.22s ease",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
        {/* Rank */}
        <span
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: inf.isTop ? ORANGE : "rgba(245,130,42,0.3)",
            flexShrink: 0,
            minWidth: "28px",
            marginTop: "2px",
          }}
        >
          {inf.rank}
        </span>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: hovered ? 600 : 400,
                color: hovered ? "#f1f5f9" : "rgba(203,213,225,0.8)",
                transition: "color 0.2s, font-weight 0.2s",
                lineHeight: 1.5,
              }}
            >
              {inf.infraction}
            </span>
            {inf.isTop && inf.weight && (
              <span
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: ORANGE,
                  background: "rgba(245,130,42,0.1)",
                  border: "1px solid rgba(245,130,42,0.25)",
                  padding: "3px 10px",
                  borderRadius: "999px",
                }}
              >
                {inf.weight}
              </span>
            )}
          </div>

          {/* Solution revealed on hover */}
          <div
            style={{
              marginTop: hovered ? "10px" : 0,
              opacity: hovered ? 1 : 0,
              maxHeight: hovered ? "100px" : 0,
              overflow: "hidden",
              transition: "opacity 0.3s ease, max-height 0.38s ease, margin-top 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <span
                style={{
                  color: CYAN,
                  fontSize: "12px",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                ✓
              </span>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(148,163,184,0.85)",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                <span
                  style={{ fontWeight: 600, color: CYAN, marginRight: "4px" }}
                >
                  Solution SecuPRO Tech :
                </span>
                {inf.solution}
              </p>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <span
          style={{
            color: hovered ? CYAN : "rgba(255,255,255,0.12)",
            transition: "color 0.2s, transform 0.25s",
            transform: hovered ? "rotate(90deg)" : "rotate(0deg)",
            fontSize: "18px",
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          ›
        </span>
      </div>
    </div>
  );
}

/* ── PricingCard ────────────────────────────────────────────────────────── */
function PricingCard({ plan }: { plan: PlanItem }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: plan.highlight
          ? `linear-gradient(145deg, rgba(0,200,240,0.10) 0%, rgba(9,21,39,0.95) 100%)`
          : `rgba(9,21,39,0.8)`,
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
        gap: "24px",
        transition: "all 0.25s ease",
        transform: plan.highlight
          ? hovered
            ? "translateY(-10px)"
            : "translateY(-6px)"
          : hovered
          ? "translateY(-4px)"
          : "translateY(0)",
        boxShadow: plan.highlight
          ? `0 0 60px rgba(0,200,240,0.14), 0 24px 48px rgba(0,0,0,0.45)`
          : hovered
          ? "0 24px 48px rgba(0,0,0,0.25)"
          : "none",
        position: "relative",
      }}
    >
      {/* "Popular" badge */}
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

      {/* Plan name + price */}
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
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "5px",
          }}
        >
          <span
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "46px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {plan.price}
          </span>
          <span
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.35)",
              fontWeight: 400,
            }}
          >
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

      {/* Divider */}
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
          gap: "12px",
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
                marginTop: "1px",
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
        onClick={() => router.push(plan.href)}
        style={{
          width: "100%",
          padding: "15px 0",
          background: plan.highlight
            ? `linear-gradient(135deg, #009BB8 0%, ${CYAN} 100%)`
            : "rgba(255,255,255,0.06)",
          border: `1px solid ${
            plan.highlight ? "transparent" : "rgba(255,255,255,0.1)"
          }`,
          color: plan.highlight ? NAVY : "#fff",
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: "pointer",
          borderRadius: "12px",
          boxShadow: plan.highlight
            ? `0 0 32px rgba(0,200,240,0.3)`
            : "none",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!plan.highlight) {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.1)";
          }
        }}
        onMouseLeave={(e) => {
          if (!plan.highlight) {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.06)";
          }
        }}
      >
        {plan.cta}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: "10px",
          color: "rgba(100,116,139,0.5)",
          lineHeight: 1.5,
        }}
      >
        14 jours gratuits · Sans engagement · Résiliation en 1 clic
      </p>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function EntreprisesPage() {
  const router = useRouter();

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
      {/* ── Fonts + Global styles ─────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

        /* Bento grid */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .bento-m1 { grid-column: span 2; }
        .bento-m2 { grid-column: span 1; }
        .bento-m3 { grid-column: span 1; }
        .bento-m4 { grid-column: span 2; }
        .bento-m5 { grid-column: span 2; }
        .bento-m6 { grid-column: span 1; }

        /* Pricing grid */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          align-items: end;
        }

        /* Footer grid */
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 40px;
        }

        /* Hero stats */
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          width: 100%;
          max-width: 900px;
        }

        /* Nav links */
        .nav-links { display: flex; align-items: center; gap: 2px; }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .bento-m1, .bento-m2, .bento-m3,
          .bento-m4, .bento-m5, .bento-m6 {
            grid-column: span 1 !important;
          }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .footer-grid  { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-stats   { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .hero-stats { grid-template-columns: 1fr !important; }
          .nav-links  { display: none !important; }
        }
      `}</style>

      {/* ── Ambient background ────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(0,200,240,0.02) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,200,240,0.02) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 20%, black 0%, transparent 72%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "50%",
          top: "-80px",
          transform: "translateX(-50%)",
          width: "1100px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(0,200,240,0.07) 0%, transparent 65%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          right: "-280px",
          top: "35%",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(245,130,42,0.04) 0%, transparent 65%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ══ 1. NAVIGATION ═════════════════════════════════════════════ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(6,14,24,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,200,240,0.07)",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            height: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
            onClick={() => router.push("/")}
          >
            <Image
              src="/secupro-logo-official.png"
              alt="SecuPRO Tech"
              width={38}
              height={38}
              priority
              style={{
                filter: `drop-shadow(0 0 14px rgba(0,200,240,0.5))`,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "17px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "#ffffff",
                  textTransform: "uppercase",
                  lineHeight: 1.1,
                }}
              >
                Secu<span style={{ color: CYAN }}>PRO</span>
                <span
                  style={{
                    color: ORANGE,
                    marginLeft: "6px",
                    fontSize: "11px",
                    letterSpacing: "0.22em",
                  }}
                >
                  TECH
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "8px",
                  letterSpacing: "0.22em",
                  color: "rgba(0,200,240,0.35)",
                  textTransform: "uppercase",
                }}
              >
                Gestion · Conformité · Terrain
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="nav-links">
            {[
              { label: "Modules", href: "#modules" },
              { label: "Infractions CNAPS", href: "#infractions" },
              { label: "Tarifs", href: "#tarifs" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  color: "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  transition: "all 0.18s",
                  display: "block",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = CYAN;
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(0,200,240,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(255,255,255,0.45)";
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "transparent";
                }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => router.push("/espace-societe")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.55)",
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "9px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(255,255,255,0.22)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.55)";
              }}
            >
              Connexion
            </button>
            <button
              onClick={() => router.push("/espace-societe/activate")}
              style={{
                background: `linear-gradient(135deg, #c45e00 0%, ${ORANGE} 100%)`,
                border: "none",
                color: "#ffffff",
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "10px 22px",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: `0 0 26px rgba(245,130,42,0.35)`,
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 44px rgba(245,130,42,0.55)`;
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 26px rgba(245,130,42,0.35)`;
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
              }}
            >
              Demander une démo →
            </button>
          </div>
        </div>
      </header>

      {/* ══ 2. HERO ═══════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "100px 24px 90px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "44px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(245,130,42,0.07)",
            border: "1px solid rgba(245,130,42,0.3)",
            borderRadius: "999px",
            padding: "8px 22px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: ORANGE,
              boxShadow: `0 0 8px ${ORANGE}`,
              flexShrink: 0,
              animation: "pulse-dot 2s infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: ORANGE,
            }}
          >
            Plateforme SaaS B2B · Sécurité Privée
          </span>
        </div>

        {/* H1 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "860px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(2.6rem, 7.5vw, 5rem)",
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1.04,
              color: "#ffffff",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Gérez vos agents.{" "}
            <br />
            <span
              style={{
                color: CYAN,
                textShadow: `0 0 30px rgba(0,200,240,0.55), 0 0 70px rgba(0,200,240,0.2)`,
              }}
            >
              Sécurisez votre conformité.
            </span>
          </h1>
          <p
            style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              color: "rgba(148,163,184,0.85)",
              lineHeight: 1.72,
              margin: "0 auto",
              maxWidth: "580px",
            }}
          >
            SecuPRO Tech centralise la gestion opérationnelle de vos agents
            de sécurité — plannings, conformité CNAPS, alertes terrain — dans
            une seule plateforme pensée pour les dirigeants d&apos;entreprises de
            gardiennage.
          </p>
        </div>

        {/* CTA group */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => router.push("/espace-societe/activate")}
            style={{
              background: `linear-gradient(135deg, #009BB8 0%, ${CYAN} 100%)`,
              border: "none",
              color: NAVY,
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "17px 40px",
              borderRadius: "13px",
              cursor: "pointer",
              boxShadow: `0 0 44px rgba(0,200,240,0.38)`,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 64px rgba(0,200,240,0.58)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 44px rgba(0,200,240,0.38)`;
            }}
          >
            Essai gratuit 14 jours →
          </button>
          <a
            href="#modules"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.65)",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "17px 36px",
              borderRadius: "13px",
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(255,255,255,0.2)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLAnchorElement).style.color =
                "rgba(255,255,255,0.65)";
            }}
          >
            Voir les modules
          </a>
        </div>

        {/* CNAPS Stats */}
        <div className="hero-stats">
          {[
            {
              value: "303 000",
              label: "Agents de sécurité privée en France",
              icon: "👮",
              color: CYAN,
            },
            {
              value: "131 000",
              label: "Décisions CNAPS prononcées en 2025",
              icon: "📋",
              color: CYAN,
            },
            {
              value: "+21%",
              label: "Cartes professionnelles délivrées",
              icon: "📈",
              color: ORANGE,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: `linear-gradient(145deg, ${NAVY_2} 0%, ${NAVY_3} 100%)`,
                border: `1px solid rgba(0,200,240,0.1)`,
                borderRadius: "18px",
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "22px", lineHeight: 1 }}>{stat.icon}</span>
              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                  fontWeight: 700,
                  color: stat.color,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  textShadow: `0 0 20px ${stat.color}55`,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(148,163,184,0.65)",
                  lineHeight: 1.45,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Source */}
        <p
          style={{
            fontSize: "10px",
            color: "rgba(100,116,139,0.5)",
            letterSpacing: "0.08em",
          }}
        >
          Source : CNAPS — Rapport officiel du 16/04/2026
        </p>
      </section>

      {/* ── Divider ───────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto 0",
          padding: "0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0,200,240,0.2), transparent)",
          }}
        />
      </div>

      {/* ══ 3. MODULES — BENTO GRID ═══════════════════════════════════ */}
      <section
        id="modules"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "96px 24px 100px",
        }}
      >
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <p
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(0,200,240,0.45)",
              marginBottom: "14px",
            }}
          >
            Fonctionnalités
          </p>
          <h2
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              color: "#ffffff",
              margin: "0 0 16px",
            }}
          >
            6 Modules Opérationnels
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(148,163,184,0.65)",
              maxWidth: "460px",
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            Tout ce dont une entreprise de sécurité a besoin pour gérer ses
            équipes terrain et rester conforme CNAPS.
          </p>
        </div>

        <div className="bento-grid">
          {MODULES.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} />
          ))}
        </div>
      </section>

      {/* ══ 4. INFRACTIONS CNAPS ══════════════════════════════════════ */}
      <section
        id="infractions"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px 100px",
        }}
      >
        {/* Header card */}
        <div
          style={{
            background: `linear-gradient(135deg, rgba(245,130,42,0.07) 0%, ${NAVY_2} 60%)`,
            border: "1px solid rgba(245,130,42,0.22)",
            borderRadius: "24px",
            padding: "44px 48px 36px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "32px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "280px" }}>
              <p
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: ORANGE,
                  marginBottom: "14px",
                }}
              >
                ⚠️ Risques CNAPS
              </p>
              <h2
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  color: "#ffffff",
                  margin: "0 0 18px",
                }}
              >
                10 Infractions qui coûtent cher
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "rgba(148,163,184,0.8)",
                  lineHeight: 1.68,
                  maxWidth: "540px",
                }}
              >
                Ces infractions représentent 90% des sanctions prononcées par
                le CNAPS. SecuPRO Tech les détecte et les prévient
                automatiquement.{" "}
                <span style={{ color: "rgba(0,200,240,0.7)", fontWeight: 500 }}>
                  Passez votre curseur sur chaque ligne pour voir la solution.
                </span>
              </p>
            </div>

            {/* 75% Highlight */}
            <div
              style={{
                background: "rgba(245,130,42,0.09)",
                border: "1px solid rgba(245,130,42,0.28)",
                borderRadius: "18px",
                padding: "24px 28px",
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "58px",
                  fontWeight: 700,
                  color: ORANGE,
                  lineHeight: 1,
                  textShadow: `0 0 24px rgba(245,130,42,0.45)`,
                }}
              >
                75%
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(148,163,184,0.65)",
                  lineHeight: 1.45,
                  maxWidth: "130px",
                  marginTop: "10px",
                }}
              >
                des dossiers CNAPS concernent des agents sans carte valide
              </div>
            </div>
          </div>
        </div>

        {/* Infraction rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {INFRACTIONS.map((inf) => (
            <InfractionRow key={inf.rank} inf={inf} />
          ))}
        </div>
      </section>

      {/* ══ 5. PRICING ════════════════════════════════════════════════ */}
      <section
        id="tarifs"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px 110px",
        }}
      >
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(0,200,240,0.45)",
              marginBottom: "14px",
            }}
          >
            Tarifs
          </p>
          <h2
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              color: "#ffffff",
              margin: "0 0 18px",
            }}
          >
            Choisissez votre plan
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(148,163,184,0.65)",
              maxWidth: "440px",
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            14 jours d&apos;essai gratuit. Sans engagement. Résiliation en 1 clic.
          </p>
        </div>

        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Trust line */}
        <p
          style={{
            textAlign: "center",
            marginTop: "32px",
            fontSize: "12px",
            color: "rgba(100,116,139,0.5)",
          }}
        >
          Paiement sécurisé via{" "}
          <span style={{ color: "rgba(0,200,240,0.6)", fontWeight: 600 }}>
            Stripe
          </span>{" "}
          · Facturation mensuelle · TVA incluse · Données hébergées en France
        </p>
      </section>

      {/* ══ 6. FOOTER ═════════════════════════════════════════════════ */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(0,200,240,0.06)",
          background: "rgba(4,9,18,0.98)",
          padding: "56px 24px 32px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="footer-grid" style={{ marginBottom: "44px" }}>
            {/* Brand column */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "18px",
                }}
              >
                <Image
                  src="/secupro-logo-official.png"
                  alt="SecuPRO"
                  width={34}
                  height={34}
                  style={{
                    filter: `drop-shadow(0 0 10px rgba(0,200,240,0.4))`,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "#fff",
                    textTransform: "uppercase",
                  }}
                >
                  Secu<span style={{ color: CYAN }}>PRO</span>
                  <span style={{ color: ORANGE, fontSize: "11px", marginLeft: "5px" }}>
                    Tech
                  </span>
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(148,163,184,0.55)",
                  lineHeight: 1.7,
                  maxWidth: "260px",
                }}
              >
                Plateforme de gestion opérationnelle et de conformité CNAPS
                pour les entreprises de sécurité privée.
              </p>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 8px rgba(34,197,94,0.8)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(34,197,94,0.7)",
                  }}
                >
                  Tous systèmes opérationnels
                </span>
              </div>
            </div>

            {/* Platform links */}
            <div>
              <p
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "rgba(0,200,240,0.35)",
                  marginBottom: "18px",
                }}
              >
                Plateforme
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  { label: "Modules", href: "#modules" },
                  { label: "Conformité CNAPS", href: "#infractions" },
                  { label: "Tarifs", href: "#tarifs" },
                  { label: "Connexion entreprise", href: "/espace-societe" },
                  { label: "Espace agent", href: "/login" },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    style={{
                      fontSize: "13px",
                      color: "rgba(148,163,184,0.55)",
                      textDecoration: "none",
                      transition: "color 0.18s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = CYAN)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color =
                        "rgba(148,163,184,0.55)")
                    }
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <p
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "rgba(0,200,240,0.35)",
                  marginBottom: "18px",
                }}
              >
                Légal & Contact
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  { label: "Conditions Générales de Vente", href: "/cgv" },
                  { label: "Mentions légales", href: "/mentions-legales" },
                  {
                    label: "contact@secupro.app",
                    href: "mailto:contact@secupro.app",
                  },
                  {
                    label: "support@secupro.app",
                    href: "mailto:support@secupro.app",
                  },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    style={{
                      fontSize: "13px",
                      color: "rgba(148,163,184,0.55)",
                      textDecoration: "none",
                      transition: "color 0.18s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = CYAN)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color =
                        "rgba(148,163,184,0.55)")
                    }
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.04)",
              paddingTop: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(100,116,139,0.35)",
              }}
            >
              © 2026 SecuPRO Tech · Lyon 69007, France · APE 6201Z
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "rgba(100,116,139,0.28)",
              }}
            >
              Données hébergées en France · RGPD conforme · Chiffrement AES-256
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
