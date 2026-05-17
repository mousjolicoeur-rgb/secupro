// ─────────────────────────────────────────────────────────────────────────────
// SecuPRO — Cockpit Chef d'Exploitation — Enterprise Light Design
// Route : /espace-societe/dashboard
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useRef, useEffect, CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";
import {
  Users, UserCheck, AlertTriangle, Clock, MapPin, Bell, Bot,
  UserPlus, Eye, ArrowLeft, RefreshCw, Upload, X, Phone, ShieldAlert,
  type LucideIcon,
} from "lucide-react";

const dmSans = DM_Sans({ subsets: ["latin"] });

// ─── 1. TYPES ────────────────────────────────────────────────────────────────

type Statut     = "actif" | "alerte" | "critique" | "disponible";
type StatutSite = "ALERTE" | "CRITIQUE" | "OK";
type TypeAlerte = "critique" | "danger" | "alerte" | "warning" | "info";

interface Agent        { id: number; nom: string; site: string; horaires: string; statut: Statut; }
interface Site         { nom: string; ville: string; effectif: string; statut: StatutSite; }
interface Alerte       { type: TypeAlerte; msg: string; h: string; }
interface Anomalie     { site: string; agent: string; tel: string; }
interface Remplacement { site: string; absent: string; remplace: { nom: string; info: string }; }
interface Infraction   { num: string; label: string; badge?: string; }
interface AIImportResult {
  type_detecte?:       string;
  nb_lignes?:          number;
  colonnes_detectees?: string[];
  agents_detectes?:    string[];
  resume?:             string;
  avertissements?:     string[];
  action_suggeree?:    string;
}

// ─── 2. DONNÉES INITIALES ────────────────────────────────────────────────────

const AGENTS_INIT: Agent[] = [
  { id: 1, nom: "Luc MARTIN",     site: "Gare Part-Dieu",      horaires: "06:00–14:00", statut: "actif"      },
  { id: 2, nom: "Mamadou DIALLO", site: "Centre Commercial A", horaires: "14:00–22:00", statut: "alerte"     },
  { id: 3, nom: "Hoa NGUYEN",     site: "Hôpital Nord",        horaires: "22:00–06:00", statut: "actif"      },
  { id: 4, nom: "Sophie LAMBERT", site: "Bureau Préfecture",   horaires: "08:00–20:00", statut: "critique"   },
  { id: 5, nom: "Karim BENALI",   site: "Entrepôt Meyzieu",    horaires: "06:00–14:00", statut: "actif"      },
  { id: 6, nom: "Jean DUPONT",    site: "—",                   horaires: "—",           statut: "disponible" },
  { id: 7, nom: "Aïssatou KONÉ",  site: "—",                   horaires: "—",           statut: "disponible" },
];

const SITES_INIT: Site[] = [
  { nom: "Gare Part-Dieu",      ville: "Lyon 3e",      effectif: "2/1", statut: "ALERTE"   },
  { nom: "Centre Commercial A", ville: "Villeurbanne", effectif: "1/2", statut: "CRITIQUE" },
  { nom: "Hôpital Nord",        ville: "Lyon 4e",      effectif: "2/2", statut: "OK"       },
  { nom: "Bureau Préfecture",   ville: "Lyon 2e",      effectif: "1/2", statut: "CRITIQUE" },
  { nom: "Entrepôt Meyzieu",    ville: "Meyzieu",      effectif: "1/1", statut: "OK"       },
];

const ALERTES_INIT: Alerte[] = [
  { type: "critique", msg: "Non badgé à la prise de poste — DIALLO · Centre Commercial A", h: "14:02" },
  { type: "critique", msg: "Absence non justifiée — LAMBERT · Bureau Préfecture",           h: "07:58" },
  { type: "alerte",   msg: "Effectif incomplet (2/3) — Gare Part-Dieu",                     h: "06:25" },
  { type: "info",     msg: "Renouvellement CNAPS requis — MARTIN Luc · échéance dans 30 j", h: "00:00" },
  { type: "warning",  msg: "SecuIA — Carte pro expire J-7 · Mamadou DIALLO",                h: "IA"    },
  { type: "warning",  msg: "SecuIA — SST EXPIRÉ · Mamadou DIALLO",                          h: "IA"    },
  { type: "warning",  msg: "SecuIA — Carte pro expire J-21 · Sophie LAMBERT",               h: "IA"    },
  { type: "warning",  msg: "SecuIA — SST expire J-17 · Sophie LAMBERT",                     h: "IA"    },
  { type: "warning",  msg: "SecuIA — SST expire J-24 · Aïssatou KONÉ",                      h: "IA"    },
  { type: "danger",   msg: "SecuIA — Carte pro EXPIRÉ · Pedro FERREIRA",                    h: "IA"    },
  { type: "danger",   msg: "SecuIA — SST EXPIRÉ · Pedro FERREIRA",                          h: "IA"    },
];

const ANOMALIES_INIT: Anomalie[] = [
  { site: "Centre Commercial A", agent: "Mamadou DIALLO", tel: "0623456789" },
  { site: "Bureau Préfecture",   agent: "Sophie LAMBERT", tel: "0645678901" },
];

const IA_REMPLACEMENTS: Remplacement[] = [
  { site: "Centre Commercial A", absent: "Mamadou DIALLO", remplace: { nom: "Jean DUPONT",   info: "Disponible · Habilitation valide · Zone compatible" } },
  { site: "Bureau Préfecture",   absent: "Sophie LAMBERT", remplace: { nom: "Aïssatou KONÉ", info: "Disponible · Habilitation valide · Zone compatible" } },
];

const INFRACTIONS: Infraction[] = [
  { num: "01", label: "Exercice sans carte professionnelle valide",        badge: "75% DES DOSSIERS CNAPS" },
  { num: "02", label: "Défaut d'habilitation préalable du dirigeant" },
  { num: "03", label: "Emploi d'agents non titulaires du TFP APS" },
  { num: "04", label: "Absence du livre de police (registre d'activité)" },
  { num: "05", label: "Défaut d'assurance responsabilité civile professionnelle" },
  { num: "06", label: "Non-respect de la tenue réglementaire" },
  { num: "07", label: "Sous-traitance à une entreprise non autorisée CNAPS" },
  { num: "08", label: "Dépassement des plafonds horaires légaux" },
  { num: "09", label: "Absence du DUERP (Document Unique des Risques)" },
  { num: "10", label: "Défaut de formation continue obligatoire" },
];

// ─── 3. DESIGN TOKENS — ENTERPRISE LIGHT ─────────────────────────────────────

const L = {
  bgPage:    "#F8F9FB",
  bgCard:    "#FFFFFF",
  bgMuted:   "#F8F9FB",
  border:    "#E2E8F0",
  borderSub: "#F1F5F9",
  text:      "#0F172A",
  textSec:   "#64748B",
  textMuted: "#94A3B8",
  blue:      "#2563EB",
  red:       "#DC2626",
  amber:     "#D97706",
  green:     "#16A34A",
  // Tinted pill backgrounds + text
  blueBg:    "#EFF6FF",   blueText:  "#1D4ED8",
  redBg:     "#FEE2E2",   redText:   "#991B1B",
  amberBg:   "#FEF3C7",   amberText: "#92400E",
  greenBg:   "#DCFCE7",   greenText: "#166534",
} as const;

// ─── 4. STATUS CONFIGS ────────────────────────────────────────────────────────

const STATUT_CFG: Record<Statut, { bg: string; text: string; label: string }> = {
  actif:      { bg: L.greenBg, text: L.greenText, label: "En poste"   },
  alerte:     { bg: L.amberBg, text: L.amberText, label: "Alerte"     },
  critique:   { bg: L.redBg,   text: L.redText,   label: "Critique"   },
  disponible: { bg: L.blueBg,  text: L.blueText,  label: "Disponible" },
};

const SITE_CFG: Record<StatutSite, { bg: string; text: string; label: string }> = {
  ALERTE:   { bg: L.amberBg, text: L.amberText, label: "Alerte"   },
  CRITIQUE: { bg: L.redBg,   text: L.redText,   label: "Critique" },
  OK:       { bg: L.greenBg, text: L.greenText, label: "OK"       },
};

const ALERTE_DOT: Record<TypeAlerte, string> = {
  critique: L.red, danger: "#EA580C", alerte: L.amber, warning: "#7C3AED", info: "#0284C7",
};

// ─── 5. STYLE HELPERS ─────────────────────────────────────────────────────────

const card: CSSProperties = {
  background:   L.bgCard,
  border:       `1px solid ${L.border}`,
  borderRadius: "8px",
};

const sectionLabel: CSSProperties = {
  fontSize: "11px", fontWeight: 600,
  color: L.textSec, textTransform: "uppercase", letterSpacing: "0.08em",
};

const pill = (bg: string, text: string): CSSProperties => ({
  display: "inline-flex", alignItems: "center",
  padding: "2px 8px", borderRadius: "999px",
  fontSize: "11px", fontWeight: 600,
  background: bg, color: text, whiteSpace: "nowrap",
});

const btnPrimary: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  height: "36px", padding: "0 16px", borderRadius: "6px",
  background: L.blue, color: "#FFFFFF",
  border: "none", fontSize: "13px", fontWeight: 500, cursor: "pointer",
};

const btnSecondary: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  height: "36px", padding: "0 14px", borderRadius: "6px",
  background: L.bgCard, color: "#374151",
  border: `1px solid ${L.border}`,
  fontSize: "13px", fontWeight: 500, cursor: "pointer",
};

const btnDestructive: CSSProperties = {
  ...btnSecondary, color: L.red, border: "1px solid #FCA5A5",
};

// ─── 6. PANEL WRAPPER ─────────────────────────────────────────────────────────

function Panel({
  title, icon: Icon, badge, children,
}: {
  title: string; icon: LucideIcon; badge?: ReactNode; children: ReactNode;
}) {
  return (
    <div style={{ ...card, overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: `1px solid ${L.borderSub}`,
      }}>
        <div style={{ ...sectionLabel, display: "flex", alignItems: "center", gap: "7px" }}>
          <Icon size={14} color={L.textMuted} /> {title}
        </div>
        {badge && <div>{badge}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── 7. HOOK — Import IA ─────────────────────────────────────────────────────

function useImport(onAgentsImported: (names: string[]) => void) {
  const fileRef                                   = useRef<HTMLInputElement>(null);
  const [fileType,    setFileType]    = useState("CSV");
  const [dragOver,    setDragOver]    = useState(false);
  const [fileName,    setFileName]    = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [aiResult,    setAiResult]    = useState<AIImportResult | null>(null);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [importDone,  setImportDone]  = useState(false);

  const reset = () => {
    setFileName(null); setFileContent(null);
    setAiResult(null); setImportDone(false); setFileType("CSV");
  };

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    setFileName(file.name); setAiResult(null); setImportDone(false);
    const reader = new FileReader();
    reader.onload = (e) => setFileContent(e.target?.result as string);
    reader.readAsText(file);
  };

  const analyzeWithAI = async () => {
    if (!fileContent) return;
    setAiLoading(true); setAiResult(null);
    try {
      const prompt = `Tu es SecuPRO IA, assistant d'import pour une plateforme de sécurité privée.
Le chef d'exploitation vient d'importer un fichier ${fileType} nommé "${fileName}".

Voici le contenu brut (extrait 1500 chars max) :
---
${fileContent.slice(0, 1500)}
---

Analyse ce fichier et retourne UNIQUEMENT un JSON (sans balises markdown) avec :
{
  "type_detecte": "planning|agents|formations|pointages|autre",
  "nb_lignes": <nombre>,
  "colonnes_detectees": ["col1","col2",...],
  "agents_detectes": ["NOM PRENOM",...],
  "resume": "1 phrase décrivant le contenu",
  "avertissements": ["..."],
  "action_suggeree": "description de l'import"
}`;
      const response = await fetch("/api/analyze-import", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      const raw  = (data.content as Array<{ type: string; text?: string }>)?.find((b) => b.type === "text")?.text ?? "";
      const clean = raw.replace(/```json|```/g, "").trim();
      try {
        setAiResult(JSON.parse(clean) as AIImportResult);
      } catch {
        setAiResult({ resume: raw, avertissements: [], action_suggeree: "Voir l'analyse ci-dessus." });
      }
    } catch {
      setAiResult({ resume: "Erreur de connexion à SecuIA.", avertissements: ["Vérifiez votre connexion."], action_suggeree: "Réessayez." });
    }
    setAiLoading(false);
  };

  const confirmImport = (onDone: () => void) => {
    if (aiResult?.agents_detectes?.length) onAgentsImported(aiResult.agents_detectes);
    setImportDone(true);
    setTimeout(() => { onDone(); reset(); }, 1500);
  };

  return { fileRef, fileType, setFileType, dragOver, setDragOver, fileName, fileContent, aiResult, aiLoading, importDone, handleFile, analyzeWithAI, confirmImport, reset };
}

// ─── 8. HEADER ───────────────────────────────────────────────────────────────

function Header({ time, onReset, onExit, onImport }: {
  time: string; onReset: () => void; onExit: () => void; onImport: () => void;
}) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: L.bgCard, borderBottom: `1px solid ${L.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: "56px", gap: "16px",
    }}>
      {/* Logo + nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: L.text, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            Secu<span style={{ color: L.blue }}>PRO</span>
            <span style={{ fontSize: "11px", fontWeight: 400, color: L.textMuted, marginLeft: "6px" }}>Business</span>
          </div>
          <div style={{ fontSize: "10px", color: L.textMuted, letterSpacing: "0.04em", marginTop: "1px" }}>Chef d'exploitation</div>
        </div>

        <nav style={{ display: "flex", alignItems: "stretch", height: "56px", gap: "2px" }}>
          {([
            { label: "Tableau de bord", href: "/espace-societe/dashboard",  active: true  },
            { label: "Conformité",      href: "/espace-societe/conformite", active: false },
            { label: "Agents",          href: "/espace-societe/agents",     active: false },
          ] as const).map(({ label, href, active }) =>
            active ? (
              <div key={label} style={{
                display: "flex", alignItems: "center", padding: "0 14px",
                fontSize: "13px", fontWeight: 600,
                color: L.blue,
                borderBottom: `2px solid ${L.blue}`,
                cursor: "default",
              }}>
                {label}
              </div>
            ) : (
              <Link key={label} href={href} style={{
                display: "flex", alignItems: "center", padding: "0 14px",
                fontSize: "13px", fontWeight: 400,
                color: L.textSec,
                borderBottom: "2px solid transparent",
                textDecoration: "none",
                cursor: "pointer",
              }}>
                {label}
              </Link>
            )
          )}
        </nav>
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <span style={{ fontSize: "12px", color: L.textMuted, fontVariantNumeric: "tabular-nums", marginRight: "4px" }}>
          {time}
        </span>
        <span style={{
          ...pill("#F0FDF4", L.green),
          border: "1px solid #BBF7D0", padding: "3px 10px",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: L.green, display: "inline-block", marginRight: "5px" }} />
          En direct
        </span>
        <div style={{ width: "1px", height: "20px", background: L.border, margin: "0 4px" }} />
        <button type="button" style={btnSecondary} onClick={onExit}>
          <ArrowLeft size={14} /> Retour
        </button>
        <button type="button" style={btnSecondary} onClick={onReset}>
          <RefreshCw size={14} /> Réinitialiser
        </button>
        <button type="button" style={btnPrimary} onClick={onImport}>
          <Upload size={14} /> Importer
        </button>
      </div>
    </header>
  );
}

// ─── 9. KPI ROW ──────────────────────────────────────────────────────────────

function KpiRow({ total, actifs, anomalies, dispos }: {
  total: number; actifs: number; anomalies: number; dispos: number;
}) {
  const items: { icon: LucideIcon; val: number; label: string; sub: string; iconBg: string; iconColor: string }[] = [
    { icon: Users,         val: total,     label: "Agents total",  sub: "inscrits",     iconBg: L.blueBg,  iconColor: L.blue  },
    { icon: UserCheck,     val: actifs,    label: "En poste",      sub: "actifs",       iconBg: L.greenBg, iconColor: L.green },
    { icon: AlertTriangle, val: anomalies, label: "Anomalies",     sub: "pointage",     iconBg: L.amberBg, iconColor: L.amber },
    { icon: Clock,         val: dispos,    label: "Disponibles",   sub: "mobilisables", iconBg: L.blueBg,  iconColor: L.blue  },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
      {items.map(({ icon: Icon, val, label, sub, iconBg, iconColor }) => (
        <div key={label} style={{ ...card, padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "8px", flexShrink: 0,
            background: iconBg, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={18} color={iconColor} />
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: L.text, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: "13px", fontWeight: 500, color: L.text, marginTop: "2px" }}>{label}</div>
            <div style={{ fontSize: "11px", color: L.textMuted }}>{sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 10. PLANNINGS ───────────────────────────────────────────────────────────

function Plannings({ agents }: { agents: Agent[] }) {
  return (
    <Panel
      title="Plannings du jour"
      icon={Users}
      badge={
        <div style={{ display: "flex", gap: "6px" }}>
          <span style={pill(L.blueBg, L.blueText)}>{agents.length} agents</span>
          <button type="button" style={{ ...btnSecondary, height: "26px", padding: "0 10px", fontSize: "11px" }}>PDF</button>
          <button type="button" style={{ ...btnSecondary, height: "26px", padding: "0 10px", fontSize: "11px" }}>XLSX</button>
        </div>
      }
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: L.bgMuted, borderBottom: `2px solid ${L.border}` }}>
              {["Agent", "Site", "Horaires", "Statut"].map((h, i) => (
                <th key={h} style={{
                  ...sectionLabel,
                  padding: "10px 16px",
                  textAlign: i === 3 ? "center" : "left",
                  fontWeight: 600,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((a, i) => {
              const cfg = STATUT_CFG[a.statut];
              return (
                <tr
                  key={a.id}
                  style={{ borderBottom: i < agents.length - 1 ? `1px solid ${L.borderSub}` : "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = L.bgMuted; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                >
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: L.text }}>{a.nom}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: L.textSec }}>{a.site}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: L.textSec }}>{a.horaires}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span style={pill(cfg.bg, cfg.text)}>{cfg.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

// ─── 11. SITES ACTIFS ────────────────────────────────────────────────────────

function SitesActifs({ sites }: { sites: Site[] }) {
  return (
    <Panel title="Sites actifs" icon={MapPin} badge={<span style={pill(L.blueBg, L.blueText)}>{sites.length} sites</span>}>
      {sites.map((s, i) => {
        const cfg = SITE_CFG[s.statut];
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "11px 16px",
            borderBottom: i < sites.length - 1 ? `1px solid ${L.borderSub}` : "none",
          }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: L.text }}>{s.nom}</div>
              <div style={{ fontSize: "11px", color: L.textMuted, marginTop: "1px" }}>{s.ville}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: L.textSec, fontVariantNumeric: "tabular-nums" }}>{s.effectif}</span>
              <span style={pill(cfg.bg, cfg.text)}>{cfg.label}</span>
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

// ─── 12. ANOMALIES POINTAGE ──────────────────────────────────────────────────

function AnomaliesPointage({ anomalies }: { anomalies: Anomalie[] }) {
  return (
    <Panel
      title="Anomalies pointage"
      icon={AlertTriangle}
      badge={<span style={pill(L.redBg, L.redText)}>{anomalies.length} alerte{anomalies.length > 1 ? "s" : ""}</span>}
    >
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {anomalies.length === 0 ? (
          <p style={{ fontSize: "13px", color: L.textMuted }}>Aucune anomalie</p>
        ) : anomalies.map((a, i) => (
          <div key={i} style={{
            background: L.bgMuted, borderRadius: "6px",
            border: `1px solid ${L.border}`, padding: "12px 14px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: L.text, marginBottom: "2px" }}>{a.agent}</div>
            <div style={{ fontSize: "12px", color: L.textMuted, marginBottom: "10px" }}>{a.site}</div>
            <a href={`tel:${a.tel}`} style={{ ...btnSecondary, height: "28px", padding: "0 10px", fontSize: "12px", textDecoration: "none" }}>
              <Phone size={12} /> {a.tel}
            </a>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ─── 13. ALERTES & INCIDENTS ─────────────────────────────────────────────────

function AlertesIncidents({ alertes }: { alertes: Alerte[] }) {
  const critiques = alertes.filter((a) => a.type === "critique" || a.type === "danger").length;
  return (
    <Panel
      title="Alertes & incidents"
      icon={Bell}
      badge={<span style={pill(L.redBg, L.redText)}>{critiques} critique{critiques > 1 ? "s" : ""}</span>}
    >
      <div style={{ maxHeight: "240px", overflowY: "auto" }}>
        {alertes.map((a, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            gap: "10px", padding: "10px 16px",
            borderBottom: i < alertes.length - 1 ? `1px solid ${L.borderSub}` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flex: 1 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: "5px",
                background: ALERTE_DOT[a.type],
              }} />
              <span style={{ fontSize: "12px", color: L.textSec, lineHeight: 1.5 }}>{a.msg}</span>
            </div>
            <span style={{ fontSize: "11px", color: L.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>{a.h}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ─── 14. IA BUSINESS ─────────────────────────────────────────────────────────

function IABusiness({ remplacements }: { remplacements: Remplacement[] }) {
  return (
    <Panel title="IA Business" icon={Bot} badge={<span style={pill(L.greenBg, L.greenText)}>Actif</span>}>
      <div style={{ padding: "12px 16px" }}>
        <div style={{
          padding: "10px 12px", background: "#EFF6FF",
          border: "1px solid #BFDBFE", borderRadius: "6px",
          fontSize: "12px", color: "#1E40AF", lineHeight: 1.5, marginBottom: "14px",
        }}>
          Analyse en cours · {remplacements.length} absences · {remplacements.length} solutions identifiées.
        </div>
        {remplacements.map((r, i) => (
          <div key={i} style={{ marginBottom: i < remplacements.length - 1 ? "14px" : 0 }}>
            <div style={{ ...sectionLabel, marginBottom: "6px" }}>{r.site}</div>
            <div style={{ borderLeft: `3px solid ${L.red}`, background: "#FFF8F8", borderRadius: "0 6px 6px 0", padding: "8px 12px", marginBottom: "4px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: L.red }}>{r.absent} — absent</div>
            </div>
            <div style={{ borderLeft: `3px solid ${L.green}`, background: "#F0FDF4", borderRadius: "0 6px 6px 0", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: L.green }}>{r.remplace.nom}</div>
                <div style={{ fontSize: "11px", color: L.textMuted, marginTop: "2px" }}>{r.remplace.info}</div>
              </div>
              <button type="button" style={{ ...btnSecondary, height: "28px", padding: "0 10px", fontSize: "12px" }}>
                <Phone size={12} /> Appeler
              </button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ─── 15. GESTION DES AGENTS ──────────────────────────────────────────────────

function GestionAgents() {
  const [approuves, setApprouves] = useState(0);
  const [enAttente, setEnAttente] = useState(0);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchCounts() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data } = await supabase
          .from("agent_societe").select("status").eq("societe_id", user.id);
        if (!data || cancelled) return;
        setApprouves(data.filter((r) => r.status === "approved").length);
        setEnAttente(data.filter((r) => r.status === "pending").length);
      } catch { /* silently fail */ } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCounts();
    return () => { cancelled = true; };
  }, []);

  return (
    <Panel
      title="Gestion des agents"
      icon={Users}
      badge={<span style={pill(L.blueBg, L.blueText)}>{loading ? "…" : `${approuves + enAttente} liés`}</span>}
    >
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <span style={pill(L.greenBg, L.greenText)}>✓ {loading ? "…" : approuves} approuvés</span>
          <span style={pill(L.amberBg, L.amberText)}>⏳ {loading ? "…" : enAttente} en attente</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link href="/entreprises/agents/invite" style={{ ...btnPrimary, justifyContent: "center", textDecoration: "none", width: "100%" }}>
            <UserPlus size={14} /> Inviter un agent
          </Link>
          <Link href="/entreprises/agents" style={{ ...btnSecondary, justifyContent: "center", textDecoration: "none", width: "100%" }}>
            <Eye size={14} /> Voir mes agents
          </Link>
        </div>
      </div>
    </Panel>
  );
}

// ─── 16. CHECKLIST CNAPS ─────────────────────────────────────────────────────

function CnapsChecklist() {
  const [checked, setChecked] = useState<boolean[]>(new Array(10).fill(false));
  const [userId,  setUserId]  = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const uid = user?.id ?? "guest";
      setUserId(uid);
      try {
        const saved = localStorage.getItem(`cnaps_checklist_${uid}`);
        if (saved) setChecked(JSON.parse(saved) as boolean[]);
      } catch { /* ignore */ }
    });
  }, []);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      if (userId) {
        try { localStorage.setItem(`cnaps_checklist_${userId}`, JSON.stringify(next)); } catch { /* ignore */ }
      }
      return next;
    });
  };

  const score     = checked.filter(Boolean).length;
  const barColor  = score > 8 ? L.green : score >= 5 ? L.amber : L.red;
  const riskAlert = score < 7;

  return (
    <Panel title="Infractions CNAPS les plus fréquentes" icon={ShieldAlert}>
      {/* Score bar */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${L.borderSub}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: L.text }}>
            {score}/10 points de contrôle validés
          </span>
          {riskAlert && (
            <span style={{ ...pill(L.redBg, L.redText), fontWeight: 700 }}>
              ⚠ RISQUE DE CONTRÔLE CNAPS
            </span>
          )}
        </div>
        <div style={{ height: "4px", background: L.border, borderRadius: "999px", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "999px",
            width: `${(score / 10) * 100}%`,
            background: barColor,
            transition: "width 0.3s ease, background 0.3s ease",
          }} />
        </div>
      </div>

      {/* Infraction rows */}
      {INFRACTIONS.map((inf, i) => (
        <button
          key={inf.num}
          type="button"
          onClick={() => toggle(i)}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            width: "100%", height: "48px", padding: "0 16px",
            background: "transparent", border: "none",
            borderBottom: i < INFRACTIONS.length - 1 ? `1px solid ${L.borderSub}` : "none",
            cursor: "pointer", textAlign: "left",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = L.bgMuted; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          {/* Numéro */}
          <span style={{
            width: "22px", height: "20px", borderRadius: "4px", flexShrink: 0,
            background: checked[i] ? L.greenBg : L.bgMuted,
            color:      checked[i] ? L.greenText : L.textMuted,
            fontSize: "10px", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
            {inf.num}
          </span>

          {/* Checkbox */}
          <span style={{
            width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
            border: `1.5px solid ${checked[i] ? L.blue : "#CBD5E1"}`,
            background: checked[i] ? L.blue : L.bgCard,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
            {checked[i] && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>

          {/* Label */}
          <span style={{
            flex: 1, fontSize: "13px",
            color: checked[i] ? L.textMuted : L.text,
            textDecoration: checked[i] ? "line-through" : "none",
            textDecorationColor: L.textMuted,
            transition: "color 0.15s",
          }}>
            {inf.label}
          </span>

          {/* Badge #01 */}
          {inf.badge && (
            <span style={{ ...pill(L.redBg, L.redText), fontSize: "10px", flexShrink: 0 }}>
              {inf.badge}
            </span>
          )}

          {/* Statut pill */}
          <span style={{
            ...pill(checked[i] ? L.greenBg : L.amberBg, checked[i] ? L.greenText : L.amberText),
            flexShrink: 0, transition: "all 0.15s",
          }}>
            {checked[i] ? "Conforme" : "À vérifier"}
          </span>
        </button>
      ))}
    </Panel>
  );
}

// ─── 17. MODAL IMPORT ────────────────────────────────────────────────────────

type ImportHook = ReturnType<typeof useImport>;

function ModalImport({ imp, onClose }: { imp: ImportHook; onClose: () => void }) {
  const {
    fileRef, fileType, setFileType, dragOver, setDragOver,
    fileName, aiResult, aiLoading, importDone,
    handleFile, analyzeWithAI, confirmImport,
  } = imp;

  const FILE_ACCEPTS: Record<string, string> = { CSV: ".csv", Excel: ".xlsx,.xls", PDF: ".pdf" };
  const FILE_HINTS: Record<string, string> = {
    CSV:   "Fichiers .csv exportés depuis Comète, Bodet, Planning Auto...",
    Excel: "Fichiers .xlsx/.xls — plannings, listes agents, pointages...",
    PDF:   "Fichiers .pdf — plannings imprimés, cartes pro, contrats...",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: L.bgCard, border: `1px solid ${L.border}`, borderRadius: "12px", width: "520px", maxWidth: "95vw", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: L.text, display: "flex", alignItems: "center", gap: "8px" }}>
            <Upload size={16} color={L.blue} /> Import de données
          </div>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", color: L.textMuted, cursor: "pointer", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ ...sectionLabel, marginBottom: "8px" }}>Format du fichier</div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
          {["CSV", "Excel", "PDF"].map((f) => (
            <button key={f} type="button" onClick={() => setFileType(f)} style={{
              flex: 1, height: "36px", borderRadius: "6px", cursor: "pointer",
              background: fileType === f ? L.blueBg : L.bgMuted,
              border: `1px solid ${fileType === f ? L.blue : L.border}`,
              color: fileType === f ? L.blue : L.textSec,
              fontSize: "13px", fontWeight: fileType === f ? 600 : 400,
            }}>{f}</button>
          ))}
        </div>
        <div style={{ fontSize: "12px", color: L.textMuted, marginBottom: "14px" }}>{FILE_HINTS[fileType]}</div>

        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: `2px dashed ${dragOver ? L.blue : L.border}`, borderRadius: "8px",
            padding: "28px", textAlign: "center", cursor: "pointer",
            background: dragOver ? L.blueBg : L.bgMuted, transition: "all 0.15s",
          }}
        >
          {fileName ? (
            <>
              <div style={{ fontSize: "13px", fontWeight: 600, color: L.blue, marginBottom: "4px" }}>✓ {fileName}</div>
              <div style={{ fontSize: "12px", color: L.textMuted }}>Cliquez pour changer</div>
            </>
          ) : (
            <>
              <Upload size={22} color={L.textMuted} style={{ marginBottom: "8px" }} />
              <div style={{ fontSize: "13px", color: L.textSec }}>
                Glissez votre fichier ici ou <span style={{ color: L.blue, fontWeight: 500 }}>cliquez pour parcourir</span>
              </div>
              <div style={{ fontSize: "12px", color: L.textMuted, marginTop: "4px" }}>{FILE_ACCEPTS[fileType]}</div>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept={FILE_ACCEPTS[fileType]} style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])} />

        {fileName && !aiResult && !aiLoading && (
          <button type="button" onClick={analyzeWithAI} style={{ ...btnPrimary, width: "100%", justifyContent: "center", marginTop: "12px" }}>
            <Bot size={14} /> Analyser avec SecuIA
          </button>
        )}

        {aiLoading && (
          <div style={{ textAlign: "center", padding: "20px 0", color: L.blue, fontSize: "13px" }}>
            <Bot size={20} style={{ marginBottom: "8px" }} />
            <div>SecuIA analyse le fichier…</div>
          </div>
        )}

        {aiResult && !importDone && (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "14px", marginTop: "12px", fontSize: "12px", lineHeight: 1.6, maxHeight: "200px", overflowY: "auto" }}>
            {aiResult.type_detecte    && <div style={{ marginBottom: "4px", color: L.text }}><span style={{ color: L.textMuted }}>Type :</span> {aiResult.type_detecte}</div>}
            {aiResult.nb_lignes       && <div style={{ marginBottom: "4px", color: L.text }}><span style={{ color: L.textMuted }}>Lignes :</span> {aiResult.nb_lignes}</div>}
            {!!aiResult.colonnes_detectees?.length && <div style={{ marginBottom: "4px", color: L.text }}><span style={{ color: L.textMuted }}>Colonnes :</span> {aiResult.colonnes_detectees!.join(", ")}</div>}
            {!!aiResult.agents_detectes?.length    && <div style={{ marginBottom: "4px", color: L.text }}><span style={{ color: L.textMuted }}>Agents :</span> {aiResult.agents_detectes!.join(", ")}</div>}
            {aiResult.resume          && <div style={{ borderTop: "1px solid #BBF7D0", paddingTop: "8px", marginTop: "6px", color: L.green }}>{aiResult.resume}</div>}
            {aiResult.avertissements?.map((w, j) => <div key={j} style={{ color: L.amber, marginTop: "4px" }}>⚠ {w}</div>)}
            {aiResult.action_suggeree && <div style={{ color: L.blue, borderTop: "1px solid #BBF7D0", paddingTop: "8px", marginTop: "6px" }}>{aiResult.action_suggeree}</div>}
          </div>
        )}

        {importDone && (
          <div style={{ textAlign: "center", padding: "14px", fontSize: "13px", fontWeight: 600, color: L.green, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            ✓ Import confirmé
          </div>
        )}

        {!importDone && (
          <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Annuler</button>
            <button type="button" disabled={!aiResult} onClick={aiResult ? () => confirmImport(onClose) : undefined}
              style={{ ...btnPrimary, opacity: aiResult ? 1 : 0.4, cursor: aiResult ? "pointer" : "not-allowed" }}>
              Importer dans SecuPRO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 18. MODAL CONFIRM ───────────────────────────────────────────────────────

interface ModalConfirmProps {
  icon: string; accentColor: string; title: string;
  message: string; labelConfirm: string;
  onConfirm: () => void; onCancel: () => void;
}

function ModalConfirm({ icon, accentColor, title, message, labelConfirm, onConfirm, onCancel }: ModalConfirmProps) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div style={{ background: L.bgCard, border: `1px solid ${L.border}`, borderRadius: "10px", width: "380px", padding: "28px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        <div style={{ fontSize: "28px", marginBottom: "12px" }}>{icon}</div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: L.text, marginBottom: "8px" }}>{title}</div>
        <div style={{ fontSize: "13px", color: L.textSec, marginBottom: "24px", lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button type="button" onClick={onCancel} style={btnSecondary}>Annuler</button>
          <button type="button" onClick={onConfirm} style={
            accentColor === L.red
              ? btnDestructive
              : { ...btnPrimary, background: accentColor }
          }>
            {labelConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 19. COMPOSANT PRINCIPAL ──────────────────────────────────────────────────

export default function ChefExploitationDashboard() {
  const [agents,     setAgents]     = useState<Agent[]>(AGENTS_INIT);
  const [sites]                     = useState<Site[]>(SITES_INIT);
  const [alertes]                   = useState<Alerte[]>(ALERTES_INIT);
  const [anomalies]                 = useState<Anomalie[]>(ANOMALIES_INIT);
  const [showImport, setShowImport] = useState(false);
  const [showReset,  setShowReset]  = useState(false);
  const [showExit,   setShowExit]   = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const imp = useImport((newNames: string[]) => {
    setAgents((prev) => {
      const existing = new Set(prev.map((a) => a.nom));
      const toAdd = newNames
        .filter((n) => !existing.has(n))
        .map((n, i): Agent => ({ id: prev.length + i + 1, nom: n, site: "—", horaires: "—", statut: "disponible" }));
      return [...prev, ...toAdd];
    });
  });

  const actifs = agents.filter((a) => ["actif", "alerte", "critique"].includes(a.statut)).length;
  const dispos = agents.filter((a) => a.statut === "disponible").length;

  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 60_000);
    return () => clearInterval(id);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = () => {
    setAgents([...AGENTS_INIT]);
    setShowReset(false);
    showToast("Tableau de bord réinitialisé");
  };

  const handleExit = () => { setShowExit(false); window.history.back(); };

  return (
    <div className={dmSans.className} style={{ background: L.bgPage, minHeight: "100vh", color: L.text, fontSize: "14px" }}>
      <Header
        time={time}
        onReset={() => setShowReset(true)}
        onExit={() => setShowExit(true)}
        onImport={() => { imp.reset(); setShowImport(true); }}
      />

      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* KPIs */}
        <KpiRow total={agents.length} actifs={actifs} anomalies={anomalies.length} dispos={dispos} />

        {/* Main 3-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "5fr 4fr 4fr", gap: "16px", alignItems: "start" }}>
          <Plannings agents={agents} />

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <SitesActifs sites={sites} />
            <AnomaliesPointage anomalies={anomalies} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <AlertesIncidents alertes={alertes} />
            <IABusiness remplacements={IA_REMPLACEMENTS} />
            <GestionAgents />
          </div>
        </div>

        {/* CNAPS Checklist — full width */}
        <CnapsChecklist />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
          zIndex: 10000, pointerEvents: "none",
          display: "flex", alignItems: "center", gap: "8px",
          padding: "12px 20px", borderRadius: "8px",
          background: L.bgCard, border: `1px solid ${L.border}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          fontSize: "13px", fontWeight: 600, color: L.green,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: L.green, display: "inline-block" }} />
          {toast}
        </div>
      )}

      {showImport && <ModalImport imp={imp} onClose={() => setShowImport(false)} />}

      {showReset && (
        <ModalConfirm
          icon="↺" accentColor={L.amber}
          title="Réinitialiser le tableau de bord"
          message="Toutes les modifications seront perdues. Les données initiales seront restaurées."
          labelConfirm="Confirmer le reset"
          onConfirm={handleReset} onCancel={() => setShowReset(false)}
        />
      )}
      {showExit && (
        <ModalConfirm
          icon="←" accentColor={L.red}
          title="Quitter le tableau de bord"
          message="Voulez-vous vraiment quitter la vue Chef d'exploitation ?"
          labelConfirm="Quitter"
          onConfirm={handleExit} onCancel={() => setShowExit(false)}
        />
      )}
    </div>
  );
}
