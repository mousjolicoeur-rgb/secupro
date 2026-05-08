// ─────────────────────────────────────────────────────────────────────────────
// SecuPRO — Tableau de bord Chef d'Exploitation
// Route : /espace-societe/dashboard
// ─────────────────────────────────────────────────────────────────────────────

"use client";
import { useState, useRef, CSSProperties, ReactNode } from "react";

// ─── 1. TYPES ────────────────────────────────────────────────────────────────

type Statut       = "actif" | "alerte" | "critique" | "disponible";
type StatutSite   = "ALERTE" | "CRITIQUE" | "OK";
type TypeAlerte   = "critique" | "danger" | "alerte" | "warning" | "info";
type ColorKey     = "blue" | "green" | "amber" | "red";

interface Agent   { id: number; nom: string; site: string; horaires: string; statut: Statut; }
interface Site    { nom: string; ville: string; effectif: string; statut: StatutSite; }
interface Alerte  { type: TypeAlerte; msg: string; h: string; }
interface Anomalie { site: string; agent: string; tel: string; }
interface Remplacement { site: string; absent: string; remplace: { nom: string; info: string; }; }
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

// ─── 3. THÈME ────────────────────────────────────────────────────────────────

const C = {
  bg:        "#0f1420",
  bgDeep:    "#0a0e18",
  bgCard:    "#111827",
  bgDark:    "#0a1218",
  border:    "#1e2a3a",
  blue:      "#3b9eff",
  blue2:     "#4a9eff",
  green:     "#4ade80",
  amber:     "#fbbf24",
  red:       "#f87171",
  orange:    "#fb923c",
  purple:    "#a78bfa",
  text:      "#c8d0e0",
  textMid:   "#a0aec0",
  textMuted: "#6b7280",
  textDim:   "#4a5568",
} as const;

const COLOR_STATUT: Record<Statut, string> = {
  actif:      C.green,
  alerte:     C.amber,
  critique:   C.red,
  disponible: C.blue,
};

const COLOR_ALERTE: Record<TypeAlerte, string> = {
  critique: C.red,
  danger:   C.orange,
  alerte:   C.amber,
  warning:  C.purple,
  info:     "#60a5fa",
};

// ─── 4. STYLES ───────────────────────────────────────────────────────────────

const T: Record<string, CSSProperties> = {
  app:          { background: C.bg, minHeight: "100vh", fontFamily: "'DM Mono','Courier New',monospace", color: C.text, fontSize: "11px" },
  grid:         { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "8px" },
  header:       { background: C.bgDeep, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: "44px" },
  logo:         { fontFamily: "'Exo 2','Arial',sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "1px", color: "#fff" },
  logoPro:      { color: C.blue },
  subTitle:     { fontSize: "8px", letterSpacing: "4px", color: C.blue2, textTransform: "uppercase" },
  card:         { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "12px" },
  cardTitle:    { fontSize: "8px", letterSpacing: "3px", color: C.blue2, textTransform: "uppercase", fontWeight: 700, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" },
  table:        { width: "100%", borderCollapse: "collapse" as const },
  th:           { fontSize: "8px", letterSpacing: "2px", color: C.textDim, textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, padding: "4px 6px", textAlign: "left" as const },
  td:           { fontSize: "10px", color: C.textMid, padding: "5px 6px", borderBottom: "1px solid #0f1a2a" },
  metricGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
  metricBox:    { background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "10px 12px" },
  metricLbl:    { fontSize: "8px", letterSpacing: "2px", color: C.textDim, textTransform: "uppercase", marginTop: "2px" },
  metricSub:    { fontSize: "8px", color: C.textDim, marginTop: "2px" },
  iaBox:        { background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "8px 10px", fontSize: "10px", color: C.textMuted, marginBottom: "6px" },
  iaSub:        { fontSize: "9px", color: C.textMuted },
  sectionLabel: { fontSize: "9px", letterSpacing: "2px", color: C.textDim, textTransform: "uppercase", margin: "8px 0 6px" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  modal:        { background: C.bg, border: `1px solid #2a3a50`, borderRadius: "8px", width: "520px", maxWidth: "95vw", padding: "24px" },
  modalTitle:   { fontSize: "11px", letterSpacing: "3px", color: C.blue2, textTransform: "uppercase", fontWeight: 700, marginBottom: "16px" },
  confirmCard:  { background: C.bg, borderRadius: "8px", width: "340px", padding: "24px", textAlign: "center" as const },
  aiResult:     { background: "#060c14", border: "1px solid #1e3a2a", borderRadius: "4px", padding: "12px", marginTop: "12px", fontSize: "10px", color: "#86efac", lineHeight: 1.6, maxHeight: "200px", overflowY: "auto" as const },
};

// ─── Styles dynamiques ────────────────────────────────────────────────────────

const D = {
  dot: (col: string): CSSProperties => ({
    width: "6px", height: "6px", borderRadius: "50%",
    background: col === "green" ? C.green : col === "amber" ? C.amber : col === "red" ? C.red : C.blue,
    display: "inline-block",
  }),
  statusDot: (statut: Statut): CSSProperties => ({
    width: "7px", height: "7px", borderRadius: "50%",
    background: COLOR_STATUT[statut] ?? C.blue,
    display: "inline-block",
  }),
  statusPill: (statut: StatutSite): CSSProperties => {
    const map: Record<StatutSite, { bg: string; border: string; color: string }> = {
      ALERTE:   { bg: "#2a1a00", border: "#7a4a00", color: C.amber },
      CRITIQUE: { bg: "#2a0a0a", border: "#7a1a1a", color: C.red   },
      OK:       { bg: "#0a2a0a", border: "#1a6a1a", color: C.green  },
    };
    const cfg = map[statut];
    return { background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontSize: "8px", padding: "2px 6px", borderRadius: "2px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700 };
  },
  badge: (col: string): CSSProperties => {
    const map: Record<string, { bg: string; border: string; color: string }> = {
      green: { bg: "#0f3a1a", border: "#1a6a2a", color: C.green },
      red:   { bg: "#3a0f0f", border: "#6a1a1a", color: C.red   },
      amber: { bg: "#2a1a00", border: "#7a4a00", color: C.amber },
      blue:  { bg: "#0a1828", border: "#1e3a5a", color: C.blue  },
    };
    const cfg = map[col] ?? map.blue;
    return { background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontSize: "9px", padding: "2px 8px", borderRadius: "3px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 };
  },
  btnHeader: (col?: string): CSSProperties => ({
    background: "transparent",
    border: `1px solid ${col === "red" ? "#6a1a1a" : col === "amber" ? "#7a4a00" : C.border}`,
    color: col === "red" ? C.red : col === "amber" ? C.amber : "#8a9ab0",
    fontSize: "9px", padding: "4px 10px", borderRadius: "3px", cursor: "pointer",
    letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700,
    display: "flex", alignItems: "center", gap: "4px",
  }),
  metricVal: (col: ColorKey): CSSProperties => ({
    fontSize: "24px", fontWeight: 700, lineHeight: 1,
    color: col === "blue" ? C.blue : col === "green" ? C.green : col === "amber" ? C.amber : C.red,
  }),
  alertRow: (type: TypeAlerte): CSSProperties => ({
    color: COLOR_ALERTE[type] ?? C.blue,
    fontSize: "10px", padding: "5px 0", borderBottom: "1px solid #0f1a2a",
    display: "flex", justifyContent: "space-between", gap: "8px",
  }),
  iaAgent: (type: "absent" | "dispo"): CSSProperties => ({
    borderLeft: `3px solid ${type === "absent" ? C.red : C.green}`,
    background: C.bgDark, borderRadius: "0 4px 4px 0",
    padding: "6px 8px", marginBottom: "4px",
  }),
  iaName: (type: "absent" | "dispo"): CSSProperties => ({
    color: type === "absent" ? C.red : C.green,
    fontSize: "10px", fontWeight: 700,
  }),
  fileBtn: (active: boolean): CSSProperties => ({
    flex: 1, textAlign: "center", cursor: "pointer",
    background: active ? "#1a2a3a" : C.bgDeep,
    border: `1px solid ${active ? C.blue : C.border}`,
    color: active ? C.blue : C.textMuted,
    fontSize: "10px", padding: "8px", borderRadius: "4px",
    letterSpacing: "1.5px", textTransform: "uppercase",
  }),
  dropZone: (drag: boolean): CSSProperties => ({
    border: `2px dashed ${drag ? C.blue : C.border}`,
    borderRadius: "6px", padding: "28px", textAlign: "center",
    color: C.textDim, fontSize: "10px", cursor: "pointer",
    background: drag ? "#0a1828" : "transparent",
    transition: "all 0.2s", marginTop: "12px",
  }),
  btnPrimary: (accentColor: string = C.blue): CSSProperties => ({
    background: "#0a2a3a", border: `1px solid ${accentColor}`,
    color: accentColor, fontSize: "10px", padding: "8px 20px",
    borderRadius: "4px", cursor: "pointer",
    letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700,
  }),
  btnSecondary: {
    background: "transparent", border: `1px solid #2a3a50`,
    color: C.textMuted, fontSize: "10px", padding: "8px 20px",
    borderRadius: "4px", cursor: "pointer",
    letterSpacing: "2px", textTransform: "uppercase",
  } as CSSProperties,
  callBtn: {
    background: "transparent", border: "1px solid #1e4a6a",
    color: C.blue, fontSize: "9px", padding: "4px 8px",
    borderRadius: "3px", cursor: "pointer", letterSpacing: "1px",
  } as CSSProperties,
};

// ─── 5. HOOK — Import IA ─────────────────────────────────────────────────────

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
    setFileName(file.name);
    setAiResult(null);
    setImportDone(false);
    const reader = new FileReader();
    reader.onload = (e) => setFileContent(e.target?.result as string);
    reader.readAsText(file);
  };

  const analyzeWithAI = async () => {
    if (!fileContent) return;
    setAiLoading(true);
    setAiResult(null);
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

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
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

// ─── 6. SOUS-COMPOSANTS ───────────────────────────────────────────────────────

function Header({ time, onReset, onExit, onImport }: { time: string; onReset: () => void; onExit: () => void; onImport: () => void; }) {
  return (
    <header style={T.header}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <button style={D.btnHeader()}        onClick={onExit}>   ← RETOUR </button>
        <button style={D.btnHeader("red")}   onClick={onReset}>  ↺ RESET  </button>
        <button style={D.btnHeader("amber")} onClick={onImport}> ⬆ IMPORT </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1px" }}>
        <div style={T.logo}>
          Secu<span style={T.logoPro}>PRO</span>{" "}
          <span style={{ fontSize: "9px", letterSpacing: "2px", color: C.textDim, fontWeight: 400 }}>BUSINESS</span>
        </div>
        <div style={T.subTitle}>Chef d'exploitation</div>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "9px", color: C.textDim, letterSpacing: "1px" }}>{time}</span>
        <span style={D.badge("green")}>● EN DIRECT</span>
      </div>
    </header>
  );
}

function VueOperationnelle({ total, actifs, anomalies, dispos }: { total: number; actifs: number; anomalies: number; dispos: number; }) {
  const metrics: { val: number; lbl: string; sub: string; col: ColorKey }[] = [
    { val: total,     lbl: "Total agents", sub: "inscrits",     col: "blue"  },
    { val: actifs,    lbl: "En poste",     sub: "actifs",       col: "green" },
    { val: anomalies, lbl: "Anomalies",    sub: "pointage",     col: "amber" },
    { val: dispos,    lbl: "Disponibles",  sub: "mobilisables", col: "blue"  },
  ];
  return (
    <div style={T.card}>
      <div style={T.cardTitle}><span style={D.dot("blue")} /> Vue opérationnelle</div>
      <div style={T.metricGrid}>
        {metrics.map(({ val, lbl, sub, col }) => (
          <div key={lbl} style={T.metricBox}>
            <div style={D.metricVal(col)}>{val}</div>
            <div style={T.metricLbl}>{lbl}</div>
            <div style={T.metricSub}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Plannings({ agents }: { agents: Agent[] }) {
  return (
    <div style={T.card}>
      <div style={T.cardTitle}>
        <span style={D.dot("blue")} /> Plannings du jour
        <span style={{ marginLeft: "auto", ...D.badge("blue") }}>{agents.length} AGENTS</span>
        <span style={{ ...D.badge("blue"), opacity: 0.5, cursor: "pointer" }}>PDF</span>
        <span style={{ ...D.badge("blue"), opacity: 0.5, cursor: "pointer" }}>XLSX</span>
      </div>
      <table style={T.table}>
        <thead>
          <tr>{["AGENT", "SITE", "HORAIRES", "ST."].map((h) => <th key={h} style={T.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {agents.slice(0, 8).map((a) => (
            <tr key={a.id}>
              <td style={{ ...T.td, color: "#d1d5db", fontWeight: 500 }}>{a.nom}</td>
              <td style={T.td}>{a.site}</td>
              <td style={{ ...T.td, color: a.statut === "critique" ? C.red : a.statut === "alerte" ? C.amber : C.textMid }}>{a.horaires}</td>
              <td style={{ ...T.td, textAlign: "center" }}><span style={D.statusDot(a.statut)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnomaliesPointage({ anomalies }: { anomalies: Anomalie[] }) {
  return (
    <div style={T.card}>
      <div style={T.cardTitle}>
        <span style={D.dot("amber")} /> Anomalies pointage
        <span style={{ marginLeft: "auto", ...D.badge("red") }}>{anomalies.length} ALERTES</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", marginBottom: "8px" }}>
        {["SITE", "AGENT", "TÉL"].map((h) => <div key={h} style={{ fontSize: "8px", letterSpacing: "2px", color: C.textDim, textTransform: "uppercase" }}>{h}</div>)}
      </div>
      {anomalies.map((a, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", borderTop: "1px solid #0f1a2a", padding: "6px 0", alignItems: "center" }}>
          <div style={{ fontSize: "10px", color: C.textMid }}>{a.site}</div>
          <div style={{ fontSize: "10px", color: "#d1d5db", fontWeight: 600 }}>{a.agent}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "9px", color: C.blue }}>📞</span>
            <span style={{ fontSize: "9px", color: C.blue }}>{a.tel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SitesActifs({ sites }: { sites: Site[] }) {
  return (
    <div style={T.card}>
      <div style={T.cardTitle}>
        <span style={D.dot("blue")} /> Sites actifs
        <span style={{ marginLeft: "auto", ...D.badge("blue") }}>{sites.length} SITES</span>
      </div>
      {sites.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: i === 0 ? "none" : "1px solid #0f1a2a", padding: "7px 0" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#d1d5db", fontWeight: 500 }}>{s.nom}</div>
            <div style={{ fontSize: "8px", color: C.textDim, marginTop: "2px" }}>📍 {s.ville}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "10px", color: C.textMid }}>{s.effectif}</span>
            <span style={D.statusPill(s.statut)}>{s.statut}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertesIncidents({ alertes }: { alertes: Alerte[] }) {
  const critiques = alertes.filter((a) => a.type === "critique" || a.type === "danger").length;
  return (
    <div style={T.card}>
      <div style={T.cardTitle}>
        <span style={D.dot("red")} /> Alertes & incidents
        <span style={{ marginLeft: "auto", ...D.badge("red") }}>{critiques} CRITIQUES</span>
      </div>
      <div style={{ maxHeight: "220px", overflowY: "auto" }}>
        {alertes.map((a, i) => (
          <div key={i} style={D.alertRow(a.type)}>
            <span style={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
              <span style={{ fontSize: "8px", marginTop: "1px" }}>{a.type === "critique" || a.type === "danger" ? "⊗" : "⚠"}</span>
              <span>{a.msg}</span>
            </span>
            <span style={{ fontSize: "8px", color: C.textDim, whiteSpace: "nowrap", marginLeft: "4px" }}>{a.h}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IABusiness({ remplacements }: { remplacements: Remplacement[] }) {
  return (
    <div style={T.card}>
      <div style={T.cardTitle}>
        <span style={D.dot("green")} /> IA Business — Observateur
        <span style={{ marginLeft: "auto", ...D.badge("green") }}>ACTIF</span>
      </div>
      <div style={T.iaBox}>
        <span style={{ color: C.green, fontSize: "10px" }}>⬡</span>{" "}
        Analyse en cours · {remplacements.length} absences détectées · {remplacements.length} solutions identifiées.
      </div>
      {remplacements.map((r, i) => (
        <div key={i}>
          <div style={T.sectionLabel}>{r.site}</div>
          <div style={D.iaAgent("absent")}>
            <div style={D.iaName("absent")}>⚠ {r.absent} — absent</div>
          </div>
          <div style={{ ...D.iaAgent("dispo"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={D.iaName("dispo")}>+ {r.remplace.nom}</div>
              <div style={T.iaSub}>{r.remplace.info}</div>
            </div>
            <button style={D.callBtn}>📞 Appeler</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// — Modal Import ————————————————————————————————————————————————————————————

type ImportHook = ReturnType<typeof useImport>;

function ModalImport({ imp, onClose }: { imp: ImportHook; onClose: () => void }) {
  const { fileRef, fileType, setFileType, dragOver, setDragOver, fileName, aiResult, aiLoading, importDone, handleFile, analyzeWithAI, confirmImport } = imp;

  const FILE_ACCEPTS: Record<string, string> = { CSV: ".csv", Excel: ".xlsx,.xls", PDF: ".pdf" };
  const FILE_HINTS:   Record<string, string> = {
    CSV:   "Fichiers .csv exportés depuis Comète, Bodet, Planning Auto...",
    Excel: "Fichiers .xlsx/.xls — plannings, listes agents, pointages...",
    PDF:   "Fichiers .pdf — plannings imprimés, cartes pro, contrats...",
  };

  return (
    <div style={T.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={T.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={T.modalTitle}>⬆ Import de données</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.textMuted, fontSize: "16px", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ fontSize: "8px", letterSpacing: "2px", color: C.textDim, textTransform: "uppercase", marginBottom: "6px" }}>Format du fichier</div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
          {["CSV", "Excel", "PDF"].map((f) => (
            <button key={f} style={D.fileBtn(fileType === f)} onClick={() => setFileType(f)}>{f}</button>
          ))}
        </div>
        <div style={{ fontSize: "9px", color: C.textDim, marginBottom: "4px" }}>{FILE_HINTS[fileType]}</div>
        <div
          style={D.dropZone(dragOver)}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        >
          {fileName ? (
            <>
              <div style={{ color: C.blue, fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>✓ {fileName}</div>
              <div style={{ fontSize: "9px", color: C.textDim }}>Cliquez pour changer de fichier</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "13px", marginBottom: "6px" }}>⬆</div>
              <div style={{ fontSize: "10px", color: C.textMuted }}>
                Glissez votre fichier ici ou <span style={{ color: C.blue }}>cliquez pour parcourir</span>
              </div>
              <div style={{ fontSize: "8px", color: C.textDim, marginTop: "4px" }}>{FILE_ACCEPTS[fileType]}</div>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept={FILE_ACCEPTS[fileType]} style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])} />

        {fileName && !aiResult && !aiLoading && (
          <button style={{ ...D.btnPrimary(), width: "100%", marginTop: "10px", background: "#0a1828" }} onClick={analyzeWithAI}>
            ⬡ Analyser avec SecuIA
          </button>
        )}
        {aiLoading && (
          <div style={{ textAlign: "center", padding: "16px 0", color: C.blue, fontSize: "10px", letterSpacing: "2px" }}>
            <div style={{ marginBottom: "6px" }}>⬡</div>SecuIA analyse le fichier…
          </div>
        )}
        {aiResult && !importDone && (
          <div style={T.aiResult}>
            {aiResult.type_detecte            && <div style={{ marginBottom: "4px" }}><span style={{ color: C.textDim }}>Type :</span>     <span>{aiResult.type_detecte}</span></div>}
            {aiResult.nb_lignes               && <div style={{ marginBottom: "4px" }}><span style={{ color: C.textDim }}>Lignes :</span>   <span>{aiResult.nb_lignes}</span></div>}
            {!!aiResult.colonnes_detectees?.length && <div style={{ marginBottom: "4px" }}><span style={{ color: C.textDim }}>Colonnes :</span> <span>{aiResult.colonnes_detectees!.join(", ")}</span></div>}
            {!!aiResult.agents_detectes?.length    && <div style={{ marginBottom: "4px" }}><span style={{ color: C.textDim }}>Agents :</span>  <span>{aiResult.agents_detectes!.join(", ")}</span></div>}
            {aiResult.resume                  && <div style={{ borderTop: "1px solid #1e3a2a", paddingTop: "6px", marginTop: "4px" }}>{aiResult.resume}</div>}
            {aiResult.avertissements?.map((w, i) => <div key={i} style={{ color: C.amber, marginTop: "3px" }}>⚠ {w}</div>)}
            {aiResult.action_suggeree         && <div style={{ color: C.blue, borderTop: `1px solid ${C.border}`, paddingTop: "6px", marginTop: "6px" }}>{aiResult.action_suggeree}</div>}
          </div>
        )}
        {importDone && (
          <div style={{ textAlign: "center", padding: "12px", color: C.green, fontSize: "11px", letterSpacing: "2px", border: "1px solid #1a6a1a", borderRadius: "4px", marginTop: "10px" }}>
            ✓ IMPORT CONFIRMÉ
          </div>
        )}
        {!importDone && (
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "flex-end" }}>
            <button style={D.btnSecondary} onClick={onClose}>Annuler</button>
            <button style={{ ...D.btnPrimary(), opacity: aiResult ? 1 : 0.4 }}
              onClick={aiResult ? () => confirmImport(onClose) : undefined} disabled={!aiResult}>
              Importer dans SecuPRO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// — Modal Confirmation ————————————————————————————————————————————————————

interface ModalConfirmProps {
  icon: string; accentColor: string; title: string;
  message: string; labelConfirm: string;
  onConfirm: () => void; onCancel: () => void;
}
function ModalConfirm({ icon, accentColor, title, message, labelConfirm, onConfirm, onCancel }: ModalConfirmProps) {
  return (
    <div style={T.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...T.confirmCard, border: `1px solid ${accentColor}33` }}>
        <div style={{ fontSize: "24px", marginBottom: "10px" }}>{icon}</div>
        <div style={{ fontSize: "11px", letterSpacing: "2px", color: accentColor, textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>{title}</div>
        <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "20px", lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button style={D.btnSecondary} onClick={onCancel}>Annuler</button>
          <button style={D.btnPrimary(accentColor)} onClick={onConfirm}>{labelConfirm}</button>
        </div>
      </div>
    </div>
  );
}

// ─── 7. COMPOSANT PRINCIPAL ───────────────────────────────────────────────────

export default function ChefExploitationDashboard() {
  const [agents,    setAgents]    = useState<Agent[]>(AGENTS_INIT);
  const [sites]                   = useState<Site[]>(SITES_INIT);
  const [alertes]                 = useState<Alerte[]>(ALERTES_INIT);
  const [anomalies]               = useState<Anomalie[]>(ANOMALIES_INIT);
  const [showImport, setShowImport] = useState(false);
  const [showReset,  setShowReset]  = useState(false);
  const [showExit,   setShowExit]   = useState(false);

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
  const time   = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const handleReset = () => { setAgents(AGENTS_INIT); setShowReset(false); };
  const handleExit  = () => { setShowExit(false); window.history.back(); };

  return (
    <div style={T.app}>
      <Header time={time} onReset={() => setShowReset(true)} onExit={() => setShowExit(true)} onImport={() => { imp.reset(); setShowImport(true); }} />

      <div style={T.grid}>
        <VueOperationnelle total={agents.length} actifs={actifs} anomalies={anomalies.length} dispos={dispos} />
        <Plannings agents={agents} />
        <AnomaliesPointage anomalies={anomalies} />
        <SitesActifs sites={sites} />
        <AlertesIncidents alertes={alertes} />
        <IABusiness remplacements={IA_REMPLACEMENTS} />
      </div>

      {showImport && <ModalImport imp={imp} onClose={() => setShowImport(false)} />}

      {showReset && (
        <ModalConfirm icon="↺" accentColor={C.amber}
          title="Réinitialiser le tableau de bord"
          message="Toutes les modifications seront perdues. Les données initiales seront restaurées."
          labelConfirm="Confirmer le reset"
          onConfirm={handleReset} onCancel={() => setShowReset(false)} />
      )}
      {showExit && (
        <ModalConfirm icon="←" accentColor={C.red}
          title="Quitter le tableau de bord"
          message="Voulez-vous vraiment quitter la vue Chef d'exploitation ?"
          labelConfirm="Quitter"
          onConfirm={handleExit} onCancel={() => setShowExit(false)} />
      )}
    </div>
  );
}
