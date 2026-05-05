"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────────────────────
   DONNÉES STATIQUES
───────────────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: "⬆",
    title: "Import agents IA",
    desc: "Glissez un fichier CSV, Excel ou PDF. Claude extrait automatiquement nom, numéro CNAPS, dates d'expiration et site d'affectation.",
    accent: "#00d4ff",
  },
  {
    icon: "🛡",
    title: "Conformité CNAPS temps réel",
    desc: "Tableau de bord live avec badge rouge/orange/vert par agent. Alerte automatique J-30 avant expiration de la carte professionnelle.",
    accent: "#00d4ff",
  },
  {
    icon: "⛑",
    title: "Suivi SST",
    desc: "Recyclage SST obligatoire tous les 24 mois tracké agent par agent. Notification avant dépassement, rapport PDF exportable.",
    accent: "#22d3ee",
  },
  {
    icon: "⏱",
    title: "Détection infractions repos 11h",
    desc: "Croisement automatique plannings/présences. Toute infraction au repos légal IDCC 1351 est signalée en temps réel.",
    accent: "#f59e0b",
  },
  {
    icon: "🚨",
    title: "SOS Dispatch",
    desc: "Agent signale une urgence sur mobile. Le chef d'exploitation est notifié instantanément avec localisation et historique.",
    accent: "#ef4444",
  },
  {
    icon: "📤",
    title: "Export comptabilité",
    desc: "Génération CSV et PDF des données agents, coefficients IDCC 1351 et primes d'urgence. Prêt pour votre logiciel de paie.",
    accent: "#a78bfa",
  },
];

const STATS = [
  { value: "183 000", label: "Agents de sécurité en France", note: "votre marché" },
  { value: "IDCC 1351", label: "Convention collective intégrée", note: "nativement" },
  { value: "J-30", label: "Alertes CNAPS avant expiration", note: "automatiques" },
  { value: "24 mois", label: "Recyclage SST automatiquement tracké", note: "sans effort" },
];

const PLANS = [
  {
    name: "Starter",
    sub: "1 à 10 agents",
    price: "49,99",
    popular: false,
    color: "#1a6bcc",
    features: [
      "Jusqu'à 10 agents",
      "Import CSV/Excel",
      "Suivi CNAPS & SST",
      "Alertes J-30",
      "Export CSV",
      "Support email",
    ],
  },
  {
    name: "Business",
    sub: "11 à 50 agents",
    price: "99,99",
    popular: true,
    color: "#00d4ff",
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
  {
    name: "Enterprise",
    sub: "51 à 100 agents",
    price: "199,99",
    popular: false,
    color: "#7c3aed",
    features: [
      "Jusqu'à 100 agents",
      "Tout Business inclus",
      "Multi-sites",
      "Cockpit chef d'exploitation",
      "SecuIA assistant juridique",
      "Account manager dédié",
      "Onboarding personnalisé",
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   COMPOSANTS UI
───────────────────────────────────────────────────────────────────────────── */

function Badge({ status }: { status: "expired" | "warning" | "valid" | "na" }) {
  const cfg = {
    expired: { bg: "rgba(239,68,68,0.18)", color: "#f87171", border: "rgba(239,68,68,0.35)", label: "Expirée" },
    warning: { bg: "rgba(245,158,11,0.18)", color: "#fbbf24", border: "rgba(245,158,11,0.35)", label: "<30 j" },
    valid:   { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.28)", label: "Valide" },
    na:      { bg: "rgba(100,116,139,0.15)", color: "#64748b", border: "rgba(100,116,139,0.25)", label: "N/A" },
  }[status];
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase",
      padding: "2px 7px", borderRadius: 99,
    }}>{cfg.label}</span>
  );
}

/* Mockup cockpit minimaliste */
function CockpitMockup() {
  const agents = [
    { name: "MARTIN Sarah",   cnaps: "valid"   as const, sst: "warning" as const, site: "Lyon Centre" },
    { name: "DUPONT Jean",    cnaps: "warning" as const, sst: "valid"   as const, site: "Part-Dieu" },
    { name: "BERNARD Claire", cnaps: "expired" as const, sst: "expired" as const, site: "Villeurbanne" },
  ];
  return (
    <div style={{
      background: "#070d1c",
      border: "1px solid rgba(0,212,255,0.18)",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,255,0.08)",
      fontFamily: "inherit",
    }}>
      {/* Topbar mockup */}
      <div style={{ background: "#050a16", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/secupro-logo.svg" alt="SecuPRO" height={22} width={82} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 900, letterSpacing: "0.2em" }}>EN DIRECT</span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 12px 8px" }}>
        {[
          { label: "CNAPS <30j", value: "3", color: "#f59e0b" },
          { label: "En vacation", value: "12", color: "#22c55e" },
          { label: "SST expirés", value: "1", color: "#ef4444" },
        ].map(k => (
          <div key={k.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "8px 10px" }}>
            <p style={{ fontSize: 8, color: "#64748b", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{k.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Mini table agents */}
      <div style={{ padding: "0 12px 12px" }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 80px", padding: "6px 10px", background: "rgba(0,212,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Agent", "CNAPS", "SST", "Site"].map(h => (
              <span key={h} style={{ fontSize: 8, color: "#475569", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>
          {agents.map((a, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 80px", padding: "8px 10px", borderBottom: i < agents.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#e2e8f0", fontWeight: 700 }}>{a.name}</span>
              <Badge status={a.cnaps} />
              <Badge status={a.sst} />
              <span style={{ fontSize: 9, color: "#64748b" }}>{a.site}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────────────────────────────────────────── */

export default function EntreprisesPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const C = {
    bg:       "#060b18",
    bgCard:   "rgba(255,255,255,0.03)",
    border:   "rgba(255,255,255,0.07)",
    cyan:     "#00d4ff",
    blue:     "#1a6bcc",
    text:     "#e2e8f0",
    muted:    "rgba(148,163,184,0.7)",
    font:     "'Barlow', 'Inter', system-ui, sans-serif",
    fontCond: "'Barlow Condensed', 'Inter', system-ui, sans-serif",
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,900;1,700&family=Barlow:wght@400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(0,212,255,0.25); }
      `}</style>

      <div style={{ background: C.bg, color: C.text, fontFamily: C.font, minHeight: "100vh", overflowX: "hidden" }}>

        {/* ════════════════════════════════════════════════════════════════════
            1. NAV FIXE
        ════════════════════════════════════════════════════════════════════ */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: navScrolled ? "rgba(6,11,24,0.96)" : "transparent",
          backdropFilter: navScrolled ? "blur(12px)" : "none",
          borderBottom: navScrolled ? `1px solid ${C.border}` : "1px solid transparent",
          transition: "all 0.3s ease",
          padding: "0 clamp(16px, 5vw, 64px)",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/secupro-logo.svg" alt="SecuPRO" height={30} width={112} style={{ filter: "drop-shadow(0 0 8px rgba(0,212,255,0.3))" }} />
            </Link>

            {/* Liens desktop */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: 32 }}>
              {[
                { label: "Fonctionnalités", id: "fonctionnalites" },
                { label: "Conformité",      id: "conformite" },
                { label: "Tarifs",          id: "tarifs" },
                { label: "Contact",         id: "contact" },
              ].map(link => (
                <button key={link.id} onClick={() => scrollTo(link.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, fontWeight: 500, letterSpacing: "0.02em", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA */}
            <Link href="/espace-societe" className="hidden md:flex" style={{
              background: C.cyan, color: "#020810", padding: "9px 20px", borderRadius: 10,
              fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "0.02em",
              boxShadow: `0 0 20px rgba(0,212,255,0.3)`, transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}>
              Essai gratuit 1 mois
            </Link>

            {/* Burger mobile */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.text, padding: 8 }}
              aria-label="Menu"
            >
              <div style={{ width: 22, display: "flex", flexDirection: "column", gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ height: 2, background: C.text, borderRadius: 2 }} />
                ))}
              </div>
            </button>
          </div>

          {/* Menu mobile */}
          {mobileMenuOpen && (
            <div style={{ background: "rgba(6,11,24,0.98)", borderTop: `1px solid ${C.border}`, padding: "16px clamp(16px,5vw,64px) 24px" }}>
              {[
                { label: "Fonctionnalités", id: "fonctionnalites" },
                { label: "Conformité",      id: "conformite" },
                { label: "Tarifs",          id: "tarifs" },
                { label: "Contact",         id: "contact" },
              ].map(link => (
                <button key={link.id} onClick={() => scrollTo(link.id)}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: C.text, fontSize: 16, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}
                >
                  {link.label}
                </button>
              ))}
              <Link href="/espace-societe" style={{
                display: "block", marginTop: 16, background: C.cyan, color: "#020810",
                padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                textDecoration: "none", textAlign: "center",
              }}>
                Essai gratuit 1 mois
              </Link>
            </div>
          )}
        </nav>

        {/* ════════════════════════════════════════════════════════════════════
            2. HERO
        ════════════════════════════════════════════════════════════════════ */}
        <section ref={heroRef} style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px clamp(16px,5vw,64px) 80px" }}>
          {/* Fond radial */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "60%", height: "80%", background: "radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 65%)" }} />
            <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "70%", background: "radial-gradient(ellipse, rgba(26,107,204,0.08) 0%, transparent 60%)" }} />
          </div>

          <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "clamp(40px,6vw,80px)", alignItems: "center" }}>
            {/* Texte gauche */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 99, padding: "6px 14px", alignSelf: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 8px ${C.cyan}` }} />
                <span style={{ fontSize: 11, color: C.cyan, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Cockpit sécurité privée</span>
              </div>

              {/* Titre */}
              <h1 style={{
                fontFamily: C.fontCond, fontSize: "clamp(38px,5.5vw,68px)", fontWeight: 900,
                lineHeight: 1.05, color: "#fff", letterSpacing: "-0.01em",
              }}>
                Gérez vos agents.{" "}
                <span style={{ color: C.cyan }}>Pilotez la conformité.</span>{" "}
                En temps réel.
              </h1>

              {/* Sous-titre */}
              <p style={{ fontSize: "clamp(15px,1.5vw,18px)", color: C.muted, lineHeight: 1.65, maxWidth: 480 }}>
                SecuPRO centralise la gestion RH de vos agents de sécurité, automatise le contrôle CNAPS/SST et vous alerte <strong style={{ color: C.text }}>avant que ça devienne un problème.</strong>
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link href="/espace-societe" style={{
                  background: C.cyan, color: "#020810", padding: "14px 28px", borderRadius: 12,
                  fontSize: 15, fontWeight: 700, textDecoration: "none",
                  boxShadow: `0 0 28px rgba(0,212,255,0.35)`, transition: "all 0.2s",
                }}>
                  Démarrer — 1 mois gratuit
                </Link>
                <button
                  onClick={() => scrollTo("fonctionnalites")}
                  style={{
                    background: "transparent", border: `1px solid ${C.border}`, color: C.text,
                    padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.cyan; e.currentTarget.style.color = C.cyan; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}
                >
                  Voir les fonctionnalités →
                </button>
              </div>

              {/* Preuves */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {["Sans CB · 1 mois gratuit", "Conforme IDCC 1351", "Données 🇫🇷 hébergées en France"].map(p => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, color: "#22c55e" }}>✓</span>
                    <span style={{ fontSize: 12, color: C.muted }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup droite */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: 460 }}>
                <CockpitMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            3. STATS
        ════════════════════════════════════════════════════════════════════ */}
        <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "60px clamp(16px,5vw,64px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: C.fontCond, fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: C.cyan, letterSpacing: "-0.02em" }}>{s.value}</p>
                <p style={{ fontSize: 13, color: C.text, fontWeight: 600, marginTop: 6 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            4. FONCTIONNALITÉS
        ════════════════════════════════════════════════════════════════════ */}
        <section id="fonctionnalites" style={{ padding: "100px clamp(16px,5vw,64px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 11, color: C.cyan, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Fonctionnalités</p>
              <h2 style={{ fontFamily: C.fontCond, fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#fff" }}>
                Tout ce dont vous avez besoin.<br />
                <span style={{ color: C.cyan }}>Rien de superflu.</span>
              </h2>
              <p style={{ fontSize: 16, color: C.muted, marginTop: 16, maxWidth: 520, margin: "16px auto 0" }}>
                SecuPRO est conçu exclusivement pour la sécurité privée française. Chaque fonctionnalité répond à un vrai problème terrain.
              </p>
            </div>

            {/* Grille */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {FEATURES.map(f => (
                <div key={f.title}
                  style={{
                    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 24px",
                    transition: "all 0.25s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${f.accent}40`; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 32px ${f.accent}0a`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${C.border}`; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: C.fontCond, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            5. SECTION CONFORMITÉ
        ════════════════════════════════════════════════════════════════════ */}
        <section id="conformite" style={{ padding: "100px clamp(16px,5vw,64px)", background: "rgba(0,212,255,0.02)", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "clamp(40px,6vw,80px)", alignItems: "center" }}>
            {/* Texte gauche */}
            <div>
              <p style={{ fontSize: 11, color: C.cyan, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Conformité CNAPS · SST</p>
              <h2 style={{ fontFamily: C.fontCond, fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
                Zéro agent expiré.<br />
                <span style={{ color: C.cyan }}>Zéro surprise lors d'un contrôle.</span>
              </h2>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.65, marginBottom: 28 }}>
                SecuPRO surveille en continu les dates d'expiration des cartes professionnelles CNAPS et des habilitations SST. Chaque agent dispose d'un badge coloré mis à jour automatiquement.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { color: "#ef4444", label: "Expirée", desc: "Alerte immédiate — action requise avant reprise de poste" },
                  { color: "#f59e0b", label: "< 30 jours", desc: "Notification envoyée au chef d'exploitation pour planifier le renouvellement" },
                  { color: "#22c55e", label: "Valide", desc: "Habilitation à jour — agent opérationnel sans restriction" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: r.color, boxShadow: `0 0 10px ${r.color}`, flexShrink: 0, marginTop: 5 }} />
                    <div>
                      <p style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{r.label}</p>
                      <p style={{ fontSize: 13, color: C.muted }}>{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visuel droite — cartes agents */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* CNAPS card */}
              <div style={{ background: "#070d1c", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", background: "rgba(0,212,255,0.05)", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13 }}>🛡</span>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", color: C.cyan, textTransform: "uppercase" }}>Carte Pro CNAPS</span>
                </div>
                <div style={{ padding: 4 }}>
                  {[
                    { name: "MARTIN Sarah",    exp: "12/02/2025", status: "expired" as const },
                    { name: "DUPONT Jean",     exp: "18/05/2026", status: "warning" as const },
                    { name: "LAMBERT Nora",    exp: "04/09/2026", status: "valid"   as const },
                    { name: "BERNARD Claire",  exp: "22/11/2026", status: "valid"   as const },
                  ].map((a, i, arr) => (
                    <div key={a.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{a.name}</p>
                        <p style={{ fontSize: 10, color: "#64748b" }}>Exp. {a.exp}</p>
                      </div>
                      <Badge status={a.status} />
                    </div>
                  ))}
                </div>
              </div>

              {/* SST card */}
              <div style={{ background: "#070d1c", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", background: "rgba(34,211,238,0.05)", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13 }}>⛑</span>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", color: "#22d3ee", textTransform: "uppercase" }}>SST Sauveteur Secouriste</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#64748b" }}>Recyclage 24 mois</span>
                </div>
                <div style={{ padding: 4 }}>
                  {[
                    { name: "MARTIN Sarah",   exp: "03/10/2024", status: "expired" as const },
                    { name: "LAMBERT Nora",   exp: "15/04/2026", status: "warning" as const },
                    { name: "DUPONT Jean",    exp: "20/08/2027", status: "valid"   as const },
                  ].map((a, i, arr) => (
                    <div key={a.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{a.name}</p>
                        <p style={{ fontSize: 10, color: "#64748b" }}>Exp. {a.exp}</p>
                      </div>
                      <Badge status={a.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            6. TARIFS
        ════════════════════════════════════════════════════════════════════ */}
        <section id="tarifs" style={{ padding: "100px clamp(16px,5vw,64px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 11, color: C.cyan, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Tarifs</p>
              <h2 style={{ fontFamily: C.fontCond, fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>
                Simple. Transparent. <span style={{ color: C.cyan }}>Sans surprise.</span>
              </h2>
              <p style={{ fontSize: 15, color: C.muted }}>1 mois gratuit, sans carte bancaire. Résiliable à tout moment.</p>
            </div>

            {/* Plans */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start" }}>
              {PLANS.map(plan => (
                <div key={plan.name} style={{
                  background: plan.popular ? `rgba(0,212,255,0.06)` : C.bgCard,
                  border: `1px solid ${plan.popular ? "rgba(0,212,255,0.35)" : C.border}`,
                  borderRadius: 20,
                  padding: 32,
                  position: "relative",
                  boxShadow: plan.popular ? `0 0 48px rgba(0,212,255,0.1)` : "none",
                }}>
                  {plan.popular && (
                    <div style={{
                      position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                      background: C.cyan, color: "#020810", fontSize: 10, fontWeight: 900,
                      letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 14px", borderRadius: 99,
                      whiteSpace: "nowrap",
                    }}>
                      ⭐ Recommandé
                    </div>
                  )}

                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontWeight: 600 }}>{plan.sub}</p>
                    <h3 style={{ fontFamily: C.fontCond, fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 6 }}>{plan.name}</h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontFamily: C.fontCond, fontSize: 44, fontWeight: 900, color: plan.popular ? C.cyan : "#fff" }}>{plan.price}€</span>
                      <span style={{ fontSize: 13, color: C.muted }}>/mois HT</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#22c55e", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: 14, color: C.text }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/espace-societe" style={{
                    display: "block", textAlign: "center", textDecoration: "none",
                    padding: "13px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                    background: plan.popular ? C.cyan : "transparent",
                    color: plan.popular ? "#020810" : C.cyan,
                    border: `1px solid ${plan.popular ? C.cyan : "rgba(0,212,255,0.3)"}`,
                    transition: "all 0.2s",
                  }}>
                    Commencer gratuitement
                  </Link>
                </div>
              ))}
            </div>

            {/* Note bas */}
            <p style={{ textAlign: "center", fontSize: 13, color: C.muted, marginTop: 32 }}>
              Toutes les formules incluent 1 mois d&apos;essai gratuit · Hébergement France 🇫🇷 · Données conformes RGPD
            </p>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            7. CTA FINAL
        ════════════════════════════════════════════════════════════════════ */}
        <section style={{ padding: "100px clamp(16px,5vw,64px)", borderTop: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
          {/* Fond lumineux */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <p style={{ fontSize: 11, color: C.cyan, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>Passez à l&apos;action</p>
            <h2 style={{ fontFamily: C.fontCond, fontSize: "clamp(30px,5vw,58px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
              Prêt à piloter votre exploitation{" "}
              <span style={{ color: C.cyan }}>comme un vrai cockpit ?</span>
            </h2>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.65, marginBottom: 40 }}>
              Rejoignez les sociétés de sécurité qui ont déjà digitalisé leur gestion. Installation en 10 minutes, sans formation.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
              <Link href="/espace-societe" style={{
                background: C.cyan, color: "#020810", padding: "16px 36px", borderRadius: 14,
                fontSize: 16, fontWeight: 700, textDecoration: "none",
                boxShadow: `0 0 32px rgba(0,212,255,0.4)`,
              }}>
                Démarrer — 1 mois gratuit
              </Link>
              <Link href="mailto:contact@secupro.app" style={{
                background: "transparent", border: `1px solid ${C.border}`, color: C.text,
                padding: "16px 36px", borderRadius: 14, fontSize: 16, fontWeight: 600,
                textDecoration: "none",
              }}>
                Demander une démo
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            8. FOOTER
        ════════════════════════════════════════════════════════════════════ */}
        <footer id="contact" style={{ borderTop: `1px solid ${C.border}`, padding: "48px clamp(16px,5vw,64px) 36px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) repeat(3, minmax(0,1fr))", gap: "clamp(32px,4vw,64px)", marginBottom: 48 }}>
              {/* Colonne marque */}
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/secupro-logo.svg" alt="SecuPRO" height={28} width={105} style={{ marginBottom: 14, opacity: 0.9 }} />
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 260 }}>
                  La plateforme de gestion des agents de sécurité privée. Conçue en France, pour la France.
                </p>
                <p style={{ fontSize: 11, color: "#374151", marginTop: 16 }}>SIRET 10335392600019</p>
              </div>

              {/* Produit */}
              <div>
                <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Produit</p>
                {["Fonctionnalités", "Tarifs", "Cockpit B2B", "Espace Agent"].map(l => (
                  <p key={l} style={{ marginBottom: 10 }}>
                    <button onClick={() => scrollTo(l === "Fonctionnalités" ? "fonctionnalites" : l === "Tarifs" ? "tarifs" : "conformite")}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.muted, padding: 0, textAlign: "left" }}>
                      {l}
                    </button>
                  </p>
                ))}
              </div>

              {/* Légal */}
              <div>
                <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Légal</p>
                {["Mentions légales", "CGV", "Politique de confidentialité", "RGPD"].map(l => (
                  <p key={l} style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 14, color: C.muted }}>{l}</span>
                  </p>
                ))}
              </div>

              {/* Contact */}
              <div>
                <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Contact</p>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 8 }}>
                  <a href="mailto:contact@secupro.app" style={{ color: C.cyan, textDecoration: "none" }}>contact@secupro.app</a>
                </p>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 8 }}>
                  <Link href="/espace-societe/support" style={{ color: C.muted, textDecoration: "none" }}>Support technique</Link>
                </p>
                <p style={{ fontSize: 13, color: "#374151", marginTop: 16 }}>Lyon, France 🇫🇷</p>
              </div>
            </div>

            {/* Bas de footer */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <p style={{ fontSize: 12, color: "#374151" }}>© 2026 SecuPRO — Tous droits réservés</p>
              <p style={{ fontSize: 12, color: "#374151" }}>Par un agent. Pour les agents.</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
