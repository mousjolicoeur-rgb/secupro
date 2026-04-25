"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";

function BenefitCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(0,209,255,0.02) 100%)",
        border: "1px solid rgba(0,209,255,0.12)",
        borderRadius: "20px",
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,209,255,0.3)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,209,255,0.12)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          fontSize: "26px",
          lineHeight: 1,
          width: "50px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,209,255,0.06)",
          borderRadius: "14px",
          border: "1px solid rgba(0,209,255,0.1)",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 800,
          color: "#f1f5f9",
          lineHeight: 1.35,
          margin: 0,
        }}
      >
        ✅ {title}
      </h3>
      <p
        style={{
          fontSize: "13px",
          color: "rgba(148,163,184,0.75)",
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {desc}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();

  return (
    <div
      style={{
        background:
          "linear-gradient(155deg, #020c1b 0%, #04182e 20%, #061f3d 45%, #051a36 70%, #020e21 100%)",
        minHeight: "100vh",
        color: "#f8fafc",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Ambiance — halo central */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "35%",
            transform: "translate(-50%, -50%)",
            width: "900px",
            height: "900px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,209,255,0.12) 0%, rgba(0,140,220,0.06) 40%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,209,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.025) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, black 0%, transparent 75%)",
          }}
        />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid rgba(0,209,255,0.08)",
          background: "rgba(2,12,27,0.85)",
          backdropFilter: "blur(16px)",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Image
              src="/secupro-logo-official.png"
              alt="SecuPRO"
              width={36}
              height={36}
              priority
              style={{
                filter:
                  "drop-shadow(0 0 10px rgba(41,212,245,0.4))",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                fontWeight: 900,
                letterSpacing: "0.06em",
                color: "#ffffff",
                textTransform: "uppercase",
              }}
            >
              Secu<span style={{ color: "#00d1ff" }}>PRO</span>
            </span>
          </div>

          {/* Nav desktop */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* Espace Agent */}
            <button
              type="button"
              onClick={() => router.push("/login")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                background: "rgba(0,209,255,0.05)",
                border: "1px solid rgba(0,209,255,0.2)",
                color: "#00d1ff",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "9px 16px",
                borderRadius: "10px",
                whiteSpace: "nowrap",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,209,255,0.1)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,209,255,0.45)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px rgba(0,209,255,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,209,255,0.05)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,209,255,0.2)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              👮 Espace Agent
            </button>

            {/* Séparateur */}
            <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.08)" }} />

            {/* Essai gratuit */}
            <button
              type="button"
              onClick={() => router.push("/register")}
              style={{
                background: "linear-gradient(135deg, #0095c8 0%, #00d1ff 100%)",
                border: "none",
                color: "#020e21",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "10px 20px",
                borderRadius: "10px",
                boxShadow: "0 0 20px rgba(0,209,255,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              Essai gratuit →
            </button>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "80px 24px 64px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "32px",
        }}
      >
        {/* Badge ex-agent de terrain */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background:
              "linear-gradient(135deg, rgba(0,209,255,0.08) 0%, rgba(0,140,220,0.04) 100%)",
            border: "1px solid rgba(0,209,255,0.35)",
            borderRadius: "999px",
            padding: "8px 20px",
            boxShadow:
              "0 0 24px rgba(0,209,255,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <span
            style={{
              fontSize: "16px",
              lineHeight: 1,
            }}
          >
            🛡️
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "#00d1ff",
            }}
          >
            Conçu par un ex-agent de terrain
          </span>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#00d1ff",
              boxShadow: "0 0 8px rgba(0,209,255,1)",
              flexShrink: 0,
              animation: "pulse 2s infinite",
            }}
          />
        </div>

        {/* Titre principal */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 7vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.025em",
              lineHeight: 1.08,
              color: "#ffffff",
              margin: 0,
              textShadow: "0 0 60px rgba(255,255,255,0.08)",
            }}
          >
            SecuPRO :{" "}
            <span
              style={{
                color: "#00d1ff",
                textShadow:
                  "0 0 20px rgba(0,209,255,0.7), 0 0 50px rgba(0,209,255,0.3)",
              }}
            >
              La Révolution Opérationnelle de la Sécurité.
            </span>
          </h1>
          <p
            style={{
              fontSize: "clamp(15px, 2vw, 17px)",
              fontWeight: 400,
              color: "rgba(148,163,184,0.85)",
              lineHeight: 1.7,
              margin: 0,
              maxWidth: "560px",
              alignSelf: "center",
            }}
          >
            L&apos;alliance parfaite entre l&apos;agent de terrain et son commandement opérationnel. Tout votre écosystème en temps réel.
          </p>
        </div>

        {/* ── Deux Portes de Haute Sécurité ── */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            width: "100%",
            maxWidth: "580px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* ── BOUTON 1 — ESPACE AGENT (HUB) — Bleu Cyber ── */}
          <button
            type="button"
            onClick={() => router.push("/agent/hub")}
            style={{
              flex: "1 1 220px",
              padding: "26px 20px",
              background:
                "linear-gradient(155deg, rgba(0,80,160,0.35) 0%, rgba(0,150,210,0.18) 50%, rgba(0,50,120,0.3) 100%)",
              border: "1.5px solid rgba(0,209,255,0.5)",
              color: "#00d1ff",
              fontSize: "11px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              cursor: "pointer",
              borderRadius: "20px",
              boxShadow:
                "0 0 40px rgba(0,209,255,0.3), 0 0 80px rgba(0,209,255,0.1), inset 0 1px 0 rgba(0,209,255,0.18)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              transition: "all 0.22s ease",
              backdropFilter: "blur(8px)",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.boxShadow = "0 0 70px rgba(0,209,255,0.6), 0 0 140px rgba(0,209,255,0.2), inset 0 1px 0 rgba(0,209,255,0.3)";
              b.style.transform = "translateY(-4px)";
              b.style.borderColor = "rgba(0,209,255,0.9)";
              b.style.background = "linear-gradient(155deg, rgba(0,100,200,0.45) 0%, rgba(0,170,230,0.25) 50%, rgba(0,70,150,0.4) 100%)";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.boxShadow = "0 0 40px rgba(0,209,255,0.3), 0 0 80px rgba(0,209,255,0.1), inset 0 1px 0 rgba(0,209,255,0.18)";
              b.style.transform = "translateY(0)";
              b.style.borderColor = "rgba(0,209,255,0.5)";
              b.style.background = "linear-gradient(155deg, rgba(0,80,160,0.35) 0%, rgba(0,150,210,0.18) 50%, rgba(0,50,120,0.3) 100%)";
            }}
          >
            <span style={{ fontSize: "32px", lineHeight: 1, filter: "drop-shadow(0 0 12px rgba(0,209,255,0.8))" }}>👮</span>
            <span style={{ lineHeight: 1.4, textAlign: "center" }}>
              ESPACE AGENT
              <br />
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  opacity: 0.65,
                  letterSpacing: "0.4em",
                  color: "rgba(0,209,255,0.8)",
                }}
              >
                TERRAIN · HUB
              </span>
            </span>
            <div
              style={{
                width: "100%",
                height: "2px",
                background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.7), transparent)",
                borderRadius: "2px",
              }}
            />
          </button>

        </div>

        {/* Social proof micro */}
        <p
          style={{
            fontSize: "11px",
            color: "rgba(100,116,139,0.7)",
            letterSpacing: "0.05em",
          }}
        >
          Sans engagement · Résiliation en 1 clic · Paiement sécurisé via Stripe
        </p>
      </section>

      {/* ── SECU AI — BANDEAU MARKETING ───────────────────────── */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            border: "1px solid rgba(0,209,255,0.18)",
            borderRadius: "28px",
            boxShadow:
              "0 0 60px rgba(0,209,255,0.07), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0",
          }}
          className="secu-ai-grid"
        >
          {/* ── Colonne gauche — texte ── */}
          <div
            style={{
              padding: "52px 48px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "24px",
              borderRight: "1px solid rgba(0,209,255,0.08)",
            }}
            className="secu-ai-left"
          >
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                width: "fit-content",
                background: "rgba(0,209,255,0.07)",
                border: "1px solid rgba(0,209,255,0.2)",
                borderRadius: "999px",
                padding: "5px 14px",
              }}
            >
              <span style={{ fontSize: "14px", lineHeight: 1 }}>🤖</span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  color: "#00d1ff",
                }}
              >
                SecuAI · Intelligence Opérationnelle
              </span>
            </div>

            {/* Titre */}
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "#00d1ff",
                textShadow:
                  "0 0 30px rgba(0,209,255,0.4), 0 0 60px rgba(0,209,255,0.15)",
              }}
            >
              DÉPLOYEZ VOTRE PREMIER ASSISTANT OPÉRATIONNEL IA
            </h2>

            {/* Body */}
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                color: "rgba(203,213,225,0.85)",
                lineHeight: 1.75,
                fontWeight: 400,
              }}
            >
              SecuAI est l&apos;intelligence artificielle conçue spécifiquement
              pour le terrain, pas pour le bureau. En quelques clics, simplifiez
              votre gestion opérationnelle.
            </p>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: "32px",
                paddingTop: "8px",
                borderTop: "1px solid rgba(0,209,255,0.08)",
              }}
            >
              {[
                { value: "24/7", label: "Disponible" },
                { value: "< 2s", label: "Temps de réponse" },
                { value: "100%", label: "Sécurité privée" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{ display: "flex", flexDirection: "column", gap: "2px" }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: 900,
                      color: "#00d1ff",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "rgba(100,116,139,0.9)",
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Colonne droite — mockup chat ── */}
          <div
            style={{
              padding: "52px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "16px",
              background:
                "linear-gradient(135deg, rgba(0,209,255,0.03) 0%, transparent 60%)",
            }}
            className="secu-ai-right"
          >
            {/* Barre de titre mockup */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  color: "rgba(0,209,255,0.4)",
                }}
              >
                SecuAI · Chat
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "rgba(52,211,153,0.8)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#34d399",
                    boxShadow: "0 0 6px rgba(52,211,153,0.9)",
                    display: "inline-block",
                  }}
                />
                En ligne
              </span>
            </div>

            {/* Bulle Agent */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  maxWidth: "78%",
                  background: "rgba(0,209,255,0.1)",
                  border: "1px solid rgba(0,209,255,0.2)",
                  borderRadius: "18px 18px 4px 18px",
                  padding: "12px 16px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#e2e8f0",
                    lineHeight: 1.55,
                  }}
                >
                  Ma prime de nuit est-elle correcte&nbsp;?
                </p>
              </div>
              {/* Avatar agent */}
              <div
                style={{
                  flexShrink: 0,
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #0095c8, #00d1ff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  boxShadow: "0 0 10px rgba(0,209,255,0.3)",
                }}
              >
                👮
              </div>
            </div>

            {/* Indicateur "en train d'écrire" — visuel statique */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {/* Avatar SecuAI */}
              <div
                style={{
                  flexShrink: 0,
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "rgba(0,209,255,0.1)",
                  border: "1px solid rgba(0,209,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  boxShadow: "0 0 14px rgba(0,209,255,0.25)",
                }}
              >
                🤖
              </div>
              <div
                style={{
                  maxWidth: "78%",
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(0,209,255,0.15)",
                  borderRadius: "18px 18px 18px 4px",
                  padding: "14px 18px",
                  boxShadow: "0 0 20px rgba(0,209,255,0.06)",
                }}
              >
                {/* Label SecuAI */}
                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "9px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.25em",
                    color: "#00d1ff",
                  }}
                >
                  SecuAI
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#cbd5e1",
                    lineHeight: 1.65,
                  }}
                >
                  Bonjour, après analyse de votre planning et contrat, votre prime de nuit de{" "}
                  <span style={{ color: "#00d1ff", fontWeight: 700 }}>10%</span>{" "}
                  a bien été appliquée sur les{" "}
                  <span style={{ color: "#00d1ff", fontWeight: 700 }}>6 heures</span>{" "}
                  travaillées dimanche dernier.
                </p>
                {/* Timestamp */}
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "10px",
                    color: "rgba(100,116,139,0.6)",
                    textAlign: "right",
                  }}
                >
                  À l&apos;instant · SecuAI v2
                </p>
              </div>
            </div>

            {/* Fausse zone de saisie */}
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(0,209,255,0.1)",
                borderRadius: "14px",
                padding: "11px 16px",
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: "12px",
                  color: "rgba(100,116,139,0.5)",
                  fontStyle: "italic",
                }}
              >
                Posez votre question opérationnelle…
              </span>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #0095c8, #00d1ff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(0,209,255,0.4)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="#020e21" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* CSS responsive — grid → colonne sur mobile */}
        <style>{`
          @media (max-width: 768px) {
            .secu-ai-grid {
              grid-template-columns: 1fr !important;
            }
            .secu-ai-left {
              padding: 36px 28px !important;
              border-right: none !important;
              border-bottom: 1px solid rgba(0,209,255,0.08);
            }
            .secu-ai-right {
              padding: 32px 28px !important;
            }
          }
        `}</style>
      </section>

      {/* ── SÉPARATEUR ─────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(0,209,255,0.3))",
            }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#00d1ff",
              boxShadow: "0 0 10px rgba(0,209,255,0.9)",
            }}
          />
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(0,209,255,0.3), transparent)",
            }}
          />
        </div>
      </div>

      {/* ── BÉNÉFICES ──────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "72px 24px",
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            fontSize: "10px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.45em",
            color: "rgba(0,209,255,0.5)",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          Ce que SecuPRO change pour toi
        </p>
        <h2
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          Conçu pour le terrain,{" "}
          <span style={{ color: "#00d1ff" }}>pas pour le bureau.</span>
        </h2>

        {/* Labels de ligne */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Label ligne 1 */}
          <p
            style={{
              fontSize: "9px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.35em",
              color: "rgba(0,209,255,0.35)",
              margin: 0,
            }}
          >
            Les douleurs immédiates
          </p>

          {/* Grille ligne 1 — 3 cartes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              {
                icon: "💰",
                title: "Ne perds plus jamais une heure de paye.",
                desc: "Calcule tes bulletins à la minute près. Chaque heure travaillée compte, même les nuits et jours fériés.",
              },
              {
                icon: "📅",
                title: "Planning intelligent : fini les erreurs de lecture.",
                desc: "Tes vacations s'affichent clairement. Plus d'heure manquée, plus de confusion entre jours et nuits.",
              },
              {
                icon: "🗂️",
                title: "Coffre-fort numérique pour tes cartes pro et SST.",
                desc: "TFP, carte professionnelle, SST — toutes tes certifications stockées et accessibles en un tap.",
              },
            ].map((item) => (
              <BenefitCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} />
            ))}
          </div>

          {/* Séparateur entre lignes */}
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(0,209,255,0.12), transparent)",
              margin: "8px 0",
            }}
          />

          {/* Label ligne 2 */}
          <p
            style={{
              fontSize: "9px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.35em",
              color: "rgba(0,209,255,0.35)",
              margin: 0,
            }}
          >
            Valeur ajoutée &amp; technologie
          </p>

          {/* Grille ligne 2 — 3 cartes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              {
                icon: "📶",
                title: "Accès hors-ligne (idéal pour les sous-sols).",
                desc: "Pas de réseau ? Aucun problème. SecuPRO fonctionne même en zone blanche ou en sous-sol.",
              },
              {
                icon: "🤖",
                title: "SecuAI : Ton Assistant Opérationnel.",
                desc: "Une question sur la convention collective ? Un doute sur une procédure ? SecuAI te répond instantanément, 24/7.",
              },
              {
                icon: "📡",
                title: "Veille & Actualités Sécurité Privée.",
                desc: "Reste informé en temps réel des évolutions réglementaires, des alertes CNAPS et des infos du secteur.",
              },
            ].map((item) => (
              <BenefitCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} />
            ))}
          </div>

        </div>
      </section>

      {/* ── TARIF ──────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.45em",
            color: "rgba(0,209,255,0.5)",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          Tarif
        </p>
        <h2
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          Un seul tarif,{" "}
          <span style={{ color: "#00d1ff" }}>tout inclus.</span>
        </h2>

        {/* Carte tarif */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(0,209,255,0.06) 0%, rgba(0,140,220,0.02) 100%)",
            border: "1px solid rgba(0,209,255,0.25)",
            borderRadius: "24px",
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxShadow:
              "0 0 60px rgba(0,209,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Prix */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(3rem, 10vw, 4.5rem)",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                9,99
              </span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#00d1ff",
                }}
              >
                €
              </span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(148,163,184,0.6)",
                marginTop: "4px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              / mois TTC · Sans engagement
            </p>
          </div>

          {/* Séparateur */}
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(0,209,255,0.2), transparent)",
            }}
          />

          {/* Liste bénéfices */}
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {[
              "Ne perds plus jamais une heure de paye.",
              "Planning intelligent : fini les erreurs de lecture.",
              "Coffre-fort numérique pour tes cartes pro et SST.",
              "Accès hors-ligne (idéal pour les sous-sols).",
              "Secu AI — intelligence opérationnelle intégrée.",
              "Veille & actualités sécurité privée en temps réel.",
            ].map((benefit) => (
              <li
                key={benefit}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  fontSize: "14px",
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    color: "#00d1ff",
                    fontWeight: 900,
                    fontSize: "16px",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  ✅
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          {/* CTA principal */}
          <button
            type="button"
            onClick={() => router.push("/register")}
            style={{
              width: "100%",
              padding: "18px 0",
              background:
                "linear-gradient(135deg, #0095c8 0%, #00d1ff 50%, #0ab8e8 100%)",
              border: "none",
              color: "#020e21",
              fontSize: "13px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              cursor: "pointer",
              borderRadius: "14px",
              boxShadow:
                "0 0 36px rgba(0,209,255,0.45), 0 4px 20px rgba(0,209,255,0.25)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Démarrer maintenant →
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "rgba(100,116,139,0.65)",
              lineHeight: 1.5,
            }}
          >
            Paiement sécurisé via{" "}
            <span style={{ color: "rgba(0,209,255,0.6)", fontWeight: 700 }}>
              Stripe
            </span>{" "}
            · Résiliation à tout moment depuis votre espace client
          </p>
        </div>
      </section>

      {/* ── FONDATEUR ──────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "0 24px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          textAlign: "center",
        }}
      >
        {/* Séparateur */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            width: "100%",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(0,209,255,0.25))",
            }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#00d1ff",
              boxShadow: "0 0 8px rgba(0,209,255,0.9)",
            }}
          />
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(0,209,255,0.25), transparent)",
            }}
          />
        </div>

        <p
          style={{
            fontSize: "10px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.45em",
            color: "rgba(0,209,255,0.5)",
          }}
        >
          Le mot du fondateur
        </p>

        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,209,255,0.015) 100%)",
            border: "1px solid rgba(0,209,255,0.1)",
            borderRadius: "20px",
            padding: "28px 24px",
            maxWidth: "480px",
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "rgba(148,163,184,0.85)",
              lineHeight: 1.75,
              fontStyle: "italic",
              margin: "0 0 20px",
            }}
          >
            &ldquo;J&apos;ai travaillé des années sur le terrain comme agent de sécurité.
            J&apos;ai vu des collègues perdre des heures de paye, rater des vacations,
            égarer leurs cartes pro. SecuPRO est la solution que j&apos;aurais voulu avoir.&rdquo;
          </p>

          {/* Badge LinkedIn */}
          <div
            className="badge-base LI-profile-badge"
            data-locale="fr_FR"
            data-size="medium"
            data-theme="dark"
            data-type="HORIZONTAL"
            data-vanity="mustapha-jelikhi"
            data-version="v1"
          >
            <a
              className="badge-base__link LI-simple-link"
              href="https://fr.linkedin.com/in/mustapha-jelikhi?trk=profile-badge"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#00d1ff", fontSize: "13px", fontWeight: 700 }}
            >
              Mustapha J. — Fondateur SecuPRO
            </a>
          </div>
        </div>

        {/* Contact support */}
        <p
          style={{
            fontSize: "12px",
            color: "rgba(100,116,139,0.7)",
          }}
        >
          Une question ?{" "}
          <a
            href="mailto:support@secupro.app"
            style={{
              color: "#00d1ff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            support@secupro.app
          </a>
        </p>
      </section>

      {/* Script LinkedIn */}
      <Script
        src="https://platform.linkedin.com/badges/js/profile.js"
        strategy="lazyOnload"
      />

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
