"use client";
import { useState, useEffect } from "react";

const MODULES = [
  { id: "csv", icon: "📊", title: "Effectifs CSV", description: "Importez vos registres en format CNAPS compatible.", features: ["Import CSV instantané", "Format CNAPS natif", "Synchro temps réel", "Détection doublons"] },
  { id: "planning", icon: "🤖", title: "Plannings IA", description: "Plannings optimisés selon habilitations et contraintes légales.", features: ["Génération automatique", "Détection conflits", "Respect repos légaux", "Export Comète"] },
  { id: "dashboard", icon: "📡", title: "Dashboard Live", description: "Présences, anomalies, alertes multi-sites en temps réel.", features: ["Vue multi-sites", "Alertes temps réel", "KPIs opérationnels", "Rapports auto"] },
  { id: "rapports", icon: "📄", title: "Rapports PDF", description: "Génération mensuelle automatique des rapports CNAPS.", features: ["Génération auto", "Branding personnalisé", "Conformité CNAPS", "Archivage 5 ans"] },
  { id: "cnaps", icon: "🛡️", title: "Conformité CNAPS", description: "Suivi cartes pro, TFP APS, habilitations et renouvellements.", features: ["Alertes préventives", "Suivi cartes pro", "TFP APS", "Export CNAPS"] },
  { id: "alertes", icon: "🔔", title: "Alertes Push", description: "Notifications : carte expirée, absence injustifiée, incident.", features: ["Notifications mobile", "Email instantané", "Escalade auto", "Historique alertes"] },
];

const PLANS = [
  { name: "Starter", sub: "Pour les petites structures", price: "49,99", popular: false, color: "#3b82f6", features: ["Jusqu'à 10 agents", "Import planning CSV", "Tableau de bord performance", "Support email"] },
  { name: "Business", sub: "Pour les entreprises en croissance", price: "99,99", popular: true, color: "#8b5cf6", features: ["Jusqu'à 50 agents", "Tout Starter inclus", "Détection conflits planning", "Analyse bulletins de salaire", "Notifications push", "Support prioritaire"] },
  { name: "Enterprise", sub: "Pour les grandes sociétés", price: "199,99", popular: false, color: "#f59e0b", features: ["Agents illimités", "Tout Business inclus", "SecuIA assistant juridique IA", "Multi-sites", "Dashboard admin avancé", "Account manager dédié"] },
];

type Module = typeof MODULES[0];

export default function EntreprisesPage() {
  const [popup, setPopup] = useState(false);
  const [mod, setMod] = useState<Module | null>(null);
  const [time, setTime] = useState({ d: 30, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date(Date.now() + 30 * 86400000);
    const id = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    const t = setTimeout(() => setPopup(true), 2500);
    return () => { clearInterval(id); clearTimeout(t); };
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  const Countdown = () => (
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      {([[time.d, "JOURS"], [time.h, "HEURES"], [time.m, "MINS"], [time.s, "SECS"]] as [number, string][]).map(([v, l]) => (
        <div key={l} style={{ textAlign: "center" }}>
          <div style={{ background: "rgba(0,229,204,0.1)", border: "1px solid rgba(0,229,204,0.3)", borderRadius: 10, padding: "12px 14px", minWidth: 56 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#00e5cc" }}>{pad(v)}</div>
          </div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{l}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ background: "#0b1120", color: "#fff", fontFamily: "Inter,sans-serif", minHeight: "100vh" }}>

      {/* POPUP */}
      {popup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0d1b35", border: "1px solid rgba(0,229,204,0.3)", borderRadius: 24, padding: "44px 36px", maxWidth: 460, width: "100%", textAlign: "center", position: "relative" }}>
            <button onClick={() => setPopup(false)} style={{ position: "absolute", top: 14, right: 18, background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>×</button>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎁</div>
            <div style={{ background: "rgba(0,229,204,0.1)", border: "1px solid rgba(0,229,204,0.3)", borderRadius: 100, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "#00e5cc", letterSpacing: 2, display: "inline-block", marginBottom: 14 }}>OFFRE LIMITÉE</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>1 MOIS GRATUIT<br /><span style={{ color: "#00e5cc" }}>SANS ENGAGEMENT</span></h2>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 24px" }}>Accès complet. Aucune carte bancaire requise.</p>
            <Countdown />
            <a href="/register" style={{ display: "block", background: "linear-gradient(135deg,#00e5cc,#0891b2)", color: "#0b1628", textDecoration: "none", padding: "15px 28px", borderRadius: 12, fontWeight: 900, fontSize: 14, letterSpacing: 1, margin: "24px 0 10px" }}>DÉMARRER MON MOIS GRATUIT →</a>
            <button onClick={() => setPopup(false)} style={{ background: "none", border: "none", color: "#475569", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Non merci</button>
          </div>
        </div>
      )}

      {/* MODULE MODAL */}
      {mod && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setMod(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d1b35", border: "1px solid rgba(0,229,204,0.3)", borderRadius: 20, padding: "36px 32px", maxWidth: 460, width: "100%", position: "relative" }}>
            <button onClick={() => setMod(null)} style={{ position: "absolute", top: 14, right: 18, background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>×</button>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{mod.icon}</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>{mod.title}</h2>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 20px", lineHeight: 1.7 }}>{mod.description}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {mod.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: "#00e5cc" }}>✓</span>
                  <span style={{ color: "#e2e8f0", fontSize: 14 }}>{f}</span>
                </div>
              ))}
            </div>
            <a href="/register" style={{ display: "block", background: "linear-gradient(135deg,#00e5cc,#0891b2)", color: "#0b1628", textDecoration: "none", padding: "13px 24px", borderRadius: 10, fontWeight: 900, textAlign: "center", fontSize: 13 }}>ESSAYER GRATUITEMENT →</a>
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={{ padding: "90px 20px 50px", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#00e5cc", marginBottom: 14 }}>PLATEFORME B2B · SÉCURITÉ PRIVÉE</div>
        <h1 style={{ fontSize: "clamp(32px,6vw,64px)", fontWeight: 900, margin: "0 0 18px", lineHeight: 1.05 }}>
          GÉREZ VOS AGENTS.<br /><span style={{ color: "#00e5cc" }}>SÉCURISEZ VOTRE CONFORMITÉ.</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: 17, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.6 }}>
          SecuPRO centralise la gestion de vos agents — plannings, conformité CNAPS, alertes terrain.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/register" style={{ background: "linear-gradient(135deg,#00e5cc,#0891b2)", color: "#0b1628", padding: "15px 32px", borderRadius: 12, textDecoration: "none", fontSize: 15, fontWeight: 900 }}>ESSAI GRATUIT 1 MOIS →</a>
          <a href="#modules" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "15px 32px", borderRadius: 12, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>VOIR LES MODULES</a>
        </div>
      </div>

      {/* MODULES */}
      <div id="modules" style={{ padding: "60px 20px", background: "rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, margin: "0 0 8px" }}>Tous les modules <span style={{ color: "#00e5cc" }}>en un coup d&apos;œil</span></h2>
            <p style={{ color: "#64748b" }}>Cliquez sur un module pour en savoir plus.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
            {MODULES.map(m => (
              <div key={m.id} onClick={() => setMod(m)} style={{ background: "rgba(13,27,53,0.8)", border: "1px solid rgba(0,229,204,0.15)", borderRadius: 14, padding: "24px 20px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,229,204,0.5)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,229,204,0.15)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{m.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px", letterSpacing: 1 }}>{m.title}</h3>
                <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>{m.description}</p>
                <span style={{ color: "#00e5cc", fontSize: 11, fontWeight: 700 }}>EN SAVOIR PLUS →</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COUNTDOWN BANNER */}
      <div style={{ padding: "44px 20px", background: "linear-gradient(135deg,rgba(0,229,204,0.07),rgba(8,145,178,0.07))", borderTop: "1px solid rgba(0,229,204,0.15)", borderBottom: "1px solid rgba(0,229,204,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#00e5cc", marginBottom: 8 }}>⚡ OFFRE LIMITÉE</div>
        <h2 style={{ fontSize: "clamp(20px,3vw,32px)", fontWeight: 900, margin: "0 0 20px" }}>1 MOIS GRATUIT — L&apos;OFFRE SE TERMINE DANS</h2>
        <Countdown />
        <a href="/register" style={{ display: "inline-block", background: "linear-gradient(135deg,#00e5cc,#0891b2)", color: "#0b1628", padding: "15px 40px", borderRadius: 12, textDecoration: "none", fontSize: 15, fontWeight: 900, letterSpacing: 1, marginTop: 24 }}>PROFITER DE L&apos;OFFRE →</a>
        <p style={{ color: "#475569", fontSize: 12, marginTop: 8 }}>Sans carte bancaire · Annulable à tout moment</p>
      </div>

      {/* TARIFS */}
      <div style={{ padding: "70px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, margin: "0 0 6px" }}>Choisissez votre plan <span style={{ color: "#3b82f6" }}>SecuPRO</span></h2>
            <p style={{ color: "#64748b" }}>Conçu par un agent. Pour les agents.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 22 }}>
            {PLANS.map(p => (
              <div key={p.name} style={{ background: "#0d1b35", border: `1px solid ${p.color}`, borderRadius: 14, padding: "32px 24px", position: "relative" }}>
                {p.popular && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: p.color, color: "#fff", padding: "3px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>Populaire</div>}
                {p.name === "Enterprise" && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: p.color, color: "#fff", padding: "3px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>Premium</div>}
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 3px" }}>{p.name}</h3>
                <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 14px" }}>{p.sub}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, margin: "0 0 3px" }}>
                  <span style={{ fontSize: 40, fontWeight: 900 }}>{p.price} €</span>
                  <span style={{ color: "#64748b", fontSize: 12 }}>/ mois</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "18px 0 22px" }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: p.color }}>✓</span>
                      <span style={{ color: "#cbd5e1", fontSize: 13 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/register" style={{ display: "block", textAlign: "center", background: p.color, color: "#fff", padding: "13px", borderRadius: 9, textDecoration: "none", fontSize: 13, fontWeight: 800 }}>Commencer l&apos;essai gratuit</a>
                <p style={{ textAlign: "center", color: "#334155", fontSize: 10, marginTop: 7 }}>7 jours d&apos;essai — Sans engagement — Résiliable à tout moment</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
