// ─────────────────────────────────────────────────────────────────────────────
// SecuPRO — Cockpit Chef d'Exploitation
// Route : /espace-societe/dashboard
// ─────────────────────────────────────────────────────────────────────────────

"use client";
import { useState, useRef, useEffect, CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  Users, UserCheck, AlertTriangle, Clock, MapPin, Bell, Bot,
  UserPlus, Eye, ArrowLeft, RefreshCw, Upload, X, Phone,
  type LucideIcon,
} from "lucide-react";

// ─── 1. TYPES ────────────────────────────────────────────────────────────────

type Statut     = "actif" | "alerte" | "critique" | "disponible";
type StatutSite = "ALERTE" | "CRITIQUE" | "OK";
type TypeAlerte = "critique" | "danger" | "alerte" | "warning" | "info";

interface Agent        { id: number; nom: string; site: string; horaires: string; statut: Statut; }
interface Site         { nom: string; ville: string; effectif: string; statut: StatutSite; }
interface Alerte       { type: TypeAlerte; msg: string; h: string; }
interface Anomalie     { site: string; agent: string; tel: string; }
interface Remplacement { site: string; absent: string; remplace: { nom: string; info: string }; }
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

// ─── 3. DESIGN TOKENS ────────────────────────────────────────────────────────

const P = {
  bg:     "#0F1117",
  card:   "#1A1D27",
  border: "#252836",
  text:   "#F1F5F9",
  sub:    "#94A3B8",
  muted:  "#64748B",
  blue:   "#3B82F6",
  green:  "#10B981",
  amber:  "#F59E0B",
  red:    "#EF4444",
  font:   "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
} as const;

const statusColor: Record<Statut, string> = {
  actif: P.green, alerte: P.amber, critique: P.red, disponible: P.blue,
};

const alertColor: Record<TypeAlerte, string> = {
  critique: P.red, danger: "#F97316", alerte: P.amber, warning: "#A78BFA", info: "#60A5FA",
};

const siteCfg: Record<StatutSite, { color: string; bg: string; border: string; label: string }> = {
  ALERTE:   { color: P.amber, bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  label: "Alerte"   },
  CRITIQUE: { color: P.red,   bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   label: "Critique" },
  OK:       { color: P.green, bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  label: "OK"       },
};

// Shared style helpers
const cardStyle: CSSProperties = {
  background: P.card, border: `1px solid ${P.border}`, borderRadius: "12px", padding: "20px",
};

const panelTitle = (color: string = P.sub): CSSProperties => ({
  fontSize: "12px", fontWeight: 700, color, textTransform: "uppercase" as const,
  letterSpacing: "0.06em", marginBottom: "16px",
  display: "flex", alignItems: "center", gap: "8px",
});

const ghostBtn = (accent: string = P.sub): CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: "6px",
  padding: "6px 12px", borderRadius: "8px",
  background: "transparent", border: `1px solid ${P.border}`,
  color: accent, fontSize: "12px", fontWeight: 600, cursor: "pointer",
  transition: "background 0.15s",
});

const pillBadge = (color: string): CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: "5px",
  padding: "3px 10px", borderRadius: "999px",
  fontSize: "11px", fontWeight: 600,
  color,
  background: color + "1A",
  border: `1px solid ${color}4D`,
});

// ─── 4. HOOK — Import IA ─────────────────────────────────────────────────────

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

      const response = await fetch("/api/analyze-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

// ─── 5. HEADER ───────────────────────────────────────────────────────────────

function Header({ time, onReset, onExit, onImport }: { time: string; onReset: () => void; onExit: () => void; onImport: () => void }) {
  return (
    <header style={{
      background: P.card, borderBottom: `1px solid ${P.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: "60px", gap: "16px",
    }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" style={ghostBtn()} onClick={onExit}>
          <ArrowLeft size={14} /> Retour
        </button>
        <button type="button" style={ghostBtn(P.amber)} onClick={onReset}>
          <RefreshCw size={14} /> Réinitialiser
        </button>
        <button type="button" style={ghostBtn(P.blue)} onClick={onImport}>
          <Upload size={14} /> Importer
        </button>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "17px", fontWeight: 800, color: P.text, letterSpacing: "-0.01em" }}>
          Secu<span style={{ color: P.blue }}>PRO</span>{" "}
          <span style={{ fontSize: "12px", fontWeight: 500, color: P.muted }}>Business</span>
        </div>
        <div style={{ fontSize: "11px", color: P.muted, marginTop: "1px" }}>Cockpit chef d'exploitation</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "13px", color: P.sub }}>{time}</span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "4px 12px", borderRadius: "999px",
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
          fontSize: "12px", fontWeight: 600, color: P.green,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.green, display: "inline-block" }} />
          En direct
        </span>
      </div>
    </header>
  );
}

// ─── 6. KPI ROW ───────────────────────────────────────────────────────────────

function KpiRow({ total, actifs, anomalies, dispos }: { total: number; actifs: number; anomalies: number; dispos: number }) {
  const items: { icon: LucideIcon; val: number; label: string; sub: string; color: string }[] = [
    { icon: Users,         val: total,     label: "Agents total",  sub: "inscrits",     color: P.blue  },
    { icon: UserCheck,     val: actifs,    label: "En poste",      sub: "actifs",       color: P.green },
    { icon: AlertTriangle, val: anomalies, label: "Anomalies",     sub: "pointage",     color: P.amber },
    { icon: Clock,         val: dispos,    label: "Disponibles",   sub: "mobilisables", color: P.blue  },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", padding: "20px 24px 0" }}>
      {items.map(({ icon: Icon, val, label, sub, color }) => (
        <div key={label} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "10px", flexShrink: 0,
            background: color + "1A", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={20} color={color} />
          </div>
          <div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: P.text, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: P.sub, marginTop: "2px" }}>{label}</div>
            <div style={{ fontSize: "11px", color: P.muted }}>{sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 7. PANNEAUX ─────────────────────────────────────────────────────────────

function Plannings({ agents }: { agents: Agent[] }) {
  const thStyle: CSSProperties = {
    fontSize: "11px", fontWeight: 600, color: P.muted, textAlign: "left",
    padding: "8px 10px", borderBottom: `1px solid ${P.border}`,
  };
  const tdStyle: CSSProperties = {
    fontSize: "13px", color: P.sub, padding: "10px 10px", borderBottom: `1px solid ${P.border}`,
  };
  return (
    <div style={{ ...cardStyle, height: "100%" }}>
      <div style={{ ...panelTitle(), justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={14} /> Plannings du jour
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <span style={pillBadge(P.blue)}>{agents.length} agents</span>
          <span style={{ ...pillBadge(P.muted), cursor: "pointer" }}>PDF</span>
          <span style={{ ...pillBadge(P.muted), cursor: "pointer" }}>XLSX</span>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Agent</th>
              <th style={thStyle}>Site</th>
              <th style={thStyle}>Horaires</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {agents.slice(0, 8).map((a) => (
              <tr key={a.id}>
                <td style={{ ...tdStyle, fontWeight: 600, color: P.text }}>{a.nom}</td>
                <td style={tdStyle}>{a.site}</td>
                <td style={{ ...tdStyle, color: a.statut === "critique" ? P.red : a.statut === "alerte" ? P.amber : P.sub }}>
                  {a.horaires}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <span style={{
                    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                    background: statusColor[a.statut],
                  }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SitesActifs({ sites }: { sites: Site[] }) {
  return (
    <div style={cardStyle}>
      <div style={panelTitle()}>
        <MapPin size={14} /> Sites actifs
        <span style={{ marginLeft: "auto", ...pillBadge(P.blue) }}>{sites.length} sites</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {sites.map((s, i) => {
          const cfg = siteCfg[s.statut];
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderBottom: i < sites.length - 1 ? `1px solid ${P.border}` : "none",
            }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: P.text }}>{s.nom}</div>
                <div style={{ fontSize: "11px", color: P.muted, marginTop: "2px" }}>{s.ville}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: P.sub }}>{s.effectif}</span>
                <span style={{ ...pillBadge(cfg.color), fontSize: "10px" }}>{cfg.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnomaliesPointage({ anomalies }: { anomalies: Anomalie[] }) {
  return (
    <div style={cardStyle}>
      <div style={panelTitle()}>
        <AlertTriangle size={14} /> Anomalies pointage
        <span style={{ marginLeft: "auto", ...pillBadge(P.red) }}>{anomalies.length} alertes</span>
      </div>
      {anomalies.length === 0 ? (
        <p style={{ fontSize: "12px", color: P.muted }}>Aucune anomalie</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {anomalies.map((a, i) => (
            <div key={i} style={{
              background: P.bg, borderRadius: "8px", padding: "12px",
              border: `1px solid ${P.border}`,
            }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: P.text, marginBottom: "4px" }}>{a.agent}</div>
              <div style={{ fontSize: "11px", color: P.muted, marginBottom: "8px" }}>{a.site}</div>
              <a href={`tel:${a.tel}`} style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                fontSize: "12px", color: P.blue, textDecoration: "none",
                padding: "4px 10px", borderRadius: "6px",
                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
              }}>
                <Phone size={11} /> {a.tel}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AlertesIncidents({ alertes }: { alertes: Alerte[] }) {
  const critiques = alertes.filter((a) => a.type === "critique" || a.type === "danger").length;
  return (
    <div style={cardStyle}>
      <div style={panelTitle()}>
        <Bell size={14} /> Alertes & incidents
        <span style={{ marginLeft: "auto", ...pillBadge(P.red) }}>{critiques} critiques</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxHeight: "240px", overflowY: "auto", gap: "1px" }}>
        {alertes.map((a, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            gap: "10px", padding: "8px 0",
            borderBottom: i < alertes.length - 1 ? `1px solid ${P.border}` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flex: 1 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: "5px",
                background: alertColor[a.type],
              }} />
              <span style={{ fontSize: "12px", color: P.sub, lineHeight: 1.5 }}>{a.msg}</span>
            </div>
            <span style={{ fontSize: "11px", color: P.muted, whiteSpace: "nowrap", flexShrink: 0 }}>{a.h}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IABusiness({ remplacements }: { remplacements: Remplacement[] }) {
  return (
    <div style={cardStyle}>
      <div style={panelTitle()}>
        <Bot size={14} /> IA Business
        <span style={{ marginLeft: "auto", ...pillBadge(P.green) }}>Actif</span>
      </div>
      <div style={{
        padding: "10px 12px", background: P.bg, borderRadius: "8px",
        border: `1px solid ${P.border}`, fontSize: "12px", color: P.sub,
        marginBottom: "14px",
      }}>
        Analyse en cours · {remplacements.length} absences détectées · {remplacements.length} solutions identifiées.
      </div>
      {remplacements.map((r, i) => (
        <div key={i} style={{ marginBottom: i < remplacements.length - 1 ? "14px" : 0 }}>
          <div style={{ fontSize: "11px", color: P.muted, marginBottom: "6px", fontWeight: 600 }}>{r.site}</div>
          <div style={{
            borderLeft: `3px solid ${P.red}`, background: P.bg,
            borderRadius: "0 8px 8px 0", padding: "8px 10px", marginBottom: "4px",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: P.red }}>{r.absent} — absent</div>
          </div>
          <div style={{
            borderLeft: `3px solid ${P.green}`, background: P.bg,
            borderRadius: "0 8px 8px 0", padding: "8px 10px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: P.green }}>{r.remplace.nom}</div>
              <div style={{ fontSize: "11px", color: P.muted, marginTop: "2px" }}>{r.remplace.info}</div>
            </div>
            <button type="button" style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "5px 10px", borderRadius: "6px", cursor: "pointer",
              background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
              color: P.blue, fontSize: "11px", fontWeight: 600,
            }}>
              <Phone size={10} /> Appeler
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 8. GESTION DES AGENTS ───────────────────────────────────────────────────

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
          .from("agent_societe")
          .select("status")
          .eq("societe_id", user.id);
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
    <div style={cardStyle}>
      <div style={panelTitle()}>
        <Users size={14} /> Gestion des agents
        <span style={{ marginLeft: "auto", ...pillBadge(P.blue) }}>
          {loading ? "…" : `${approuves + enAttente} liés`}
        </span>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <span style={pillBadge(P.green)}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: P.green, display: "inline-block" }} />
          {loading ? "…" : approuves} approuvés
        </span>
        <span style={pillBadge(P.amber)}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: P.amber, display: "inline-block" }} />
          {loading ? "…" : enAttente} en attente
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Link href="/entreprises/agents/invite" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          padding: "10px", borderRadius: "8px", textDecoration: "none",
          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
          color: P.blue, fontSize: "12px", fontWeight: 700,
        }}>
          <UserPlus size={14} /> Inviter un agent
        </Link>
        <Link href="/entreprises/agents" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          padding: "10px", borderRadius: "8px", textDecoration: "none",
          background: "transparent", border: `1px solid ${P.border}`,
          color: P.sub, fontSize: "12px", fontWeight: 600,
        }}>
          <Eye size={14} /> Voir mes agents
        </Link>
      </div>
    </div>
  );
}

// ─── 9. MODALES ──────────────────────────────────────────────────────────────

type ImportHook = ReturnType<typeof useImport>;

function ModalImport({ imp, onClose }: { imp: ImportHook; onClose: () => void }) {
  const { fileRef, fileType, setFileType, dragOver, setDragOver, fileName, aiResult, aiLoading, importDone, handleFile, analyzeWithAI, confirmImport } = imp;

  const FILE_ACCEPTS: Record<string, string> = { CSV: ".csv", Excel: ".xlsx,.xls", PDF: ".pdf" };
  const FILE_HINTS: Record<string, string> = {
    CSV:   "Fichiers .csv exportés depuis Comète, Bodet, Planning Auto...",
    Excel: "Fichiers .xlsx/.xls — plannings, listes agents, pointages...",
    PDF:   "Fichiers .pdf — plannings imprimés, cartes pro, contrats...",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: "16px", width: "520px", maxWidth: "95vw", padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: P.text, display: "flex", alignItems: "center", gap: "8px" }}>
            <Upload size={16} color={P.blue} /> Import de données
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: P.muted, cursor: "pointer", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: "11px", fontWeight: 700, color: P.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Format du fichier</div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
          {["CSV", "Excel", "PDF"].map((f) => (
            <button key={f} onClick={() => setFileType(f)} style={{
              flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer",
              background: fileType === f ? "rgba(59,130,246,0.1)" : P.bg,
              border: `1px solid ${fileType === f ? P.blue : P.border}`,
              color: fileType === f ? P.blue : P.muted,
              fontSize: "12px", fontWeight: 600,
            }}>{f}</button>
          ))}
        </div>
        <div style={{ fontSize: "11px", color: P.muted, marginBottom: "12px" }}>{FILE_HINTS[fileType]}</div>

        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: `2px dashed ${dragOver ? P.blue : P.border}`,
            borderRadius: "10px", padding: "28px", textAlign: "center",
            cursor: "pointer", background: dragOver ? "rgba(59,130,246,0.04)" : "transparent",
            transition: "all 0.2s",
          }}
        >
          {fileName ? (
            <>
              <div style={{ fontSize: "13px", fontWeight: 700, color: P.blue, marginBottom: "4px" }}>✓ {fileName}</div>
              <div style={{ fontSize: "11px", color: P.muted }}>Cliquez pour changer de fichier</div>
            </>
          ) : (
            <>
              <Upload size={24} color={P.muted} style={{ marginBottom: "8px" }} />
              <div style={{ fontSize: "13px", color: P.sub }}>
                Glissez votre fichier ici ou <span style={{ color: P.blue }}>cliquez pour parcourir</span>
              </div>
              <div style={{ fontSize: "11px", color: P.muted, marginTop: "4px" }}>{FILE_ACCEPTS[fileType]}</div>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept={FILE_ACCEPTS[fileType]} style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])} />

        {fileName && !aiResult && !aiLoading && (
          <button type="button" onClick={analyzeWithAI} style={{
            width: "100%", marginTop: "12px", padding: "10px",
            borderRadius: "8px", cursor: "pointer",
            background: "rgba(59,130,246,0.08)", border: `1px solid ${P.blue}`,
            color: P.blue, fontSize: "13px", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}>
            <Bot size={14} /> Analyser avec SecuIA
          </button>
        )}

        {aiLoading && (
          <div style={{ textAlign: "center", padding: "20px 0", color: P.blue, fontSize: "13px" }}>
            <Bot size={20} style={{ marginBottom: "8px" }} />
            <div>SecuIA analyse le fichier…</div>
          </div>
        )}

        {aiResult && !importDone && (
          <div style={{
            background: P.bg, border: `1px solid rgba(16,185,129,0.2)`, borderRadius: "8px",
            padding: "14px", marginTop: "12px", fontSize: "12px", color: P.green,
            lineHeight: 1.6, maxHeight: "200px", overflowY: "auto",
          }}>
            {aiResult.type_detecte    && <div style={{ marginBottom: "4px" }}><span style={{ color: P.muted }}>Type :</span> {aiResult.type_detecte}</div>}
            {aiResult.nb_lignes       && <div style={{ marginBottom: "4px" }}><span style={{ color: P.muted }}>Lignes :</span> {aiResult.nb_lignes}</div>}
            {!!aiResult.colonnes_detectees?.length && <div style={{ marginBottom: "4px" }}><span style={{ color: P.muted }}>Colonnes :</span> {aiResult.colonnes_detectees!.join(", ")}</div>}
            {!!aiResult.agents_detectes?.length    && <div style={{ marginBottom: "4px" }}><span style={{ color: P.muted }}>Agents :</span> {aiResult.agents_detectes!.join(", ")}</div>}
            {aiResult.resume          && <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: "8px", marginTop: "6px", color: P.sub }}>{aiResult.resume}</div>}
            {aiResult.avertissements?.map((w, i) => <div key={i} style={{ color: P.amber, marginTop: "4px" }}>⚠ {w}</div>)}
            {aiResult.action_suggeree && <div style={{ color: P.blue, borderTop: `1px solid ${P.border}`, paddingTop: "8px", marginTop: "6px" }}>{aiResult.action_suggeree}</div>}
          </div>
        )}

        {importDone && (
          <div style={{
            textAlign: "center", padding: "14px", color: P.green, fontSize: "13px", fontWeight: 700,
            border: `1px solid rgba(16,185,129,0.3)`, borderRadius: "8px", marginTop: "12px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}>
            <span>✓</span> Import confirmé
          </div>
        )}

        {!importDone && (
          <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{
              padding: "8px 20px", borderRadius: "8px", cursor: "pointer",
              background: "transparent", border: `1px solid ${P.border}`,
              color: P.sub, fontSize: "12px", fontWeight: 600,
            }}>Annuler</button>
            <button
              type="button"
              disabled={!aiResult}
              onClick={aiResult ? () => confirmImport(onClose) : undefined}
              style={{
                padding: "8px 20px", borderRadius: "8px", cursor: aiResult ? "pointer" : "not-allowed",
                background: aiResult ? P.blue : P.border,
                border: "none", color: aiResult ? "#fff" : P.muted,
                fontSize: "12px", fontWeight: 700, opacity: aiResult ? 1 : 0.5,
              }}
            >Importer dans SecuPRO</button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ModalConfirmProps {
  icon: string; accentColor: string; title: string;
  message: string; labelConfirm: string;
  onConfirm: () => void; onCancel: () => void;
}
function ModalConfirm({ icon, accentColor, title, message, labelConfirm, onConfirm, onCancel }: ModalConfirmProps) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={{
        background: P.card, border: `1px solid ${accentColor}33`,
        borderRadius: "14px", width: "360px", padding: "28px", textAlign: "center",
      }}>
        <div style={{ fontSize: "28px", marginBottom: "12px" }}>{icon}</div>
        <div style={{ fontSize: "15px", fontWeight: 800, color: accentColor, marginBottom: "10px" }}>{title}</div>
        <div style={{ fontSize: "13px", color: P.sub, marginBottom: "24px", lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button type="button" onClick={onCancel} style={{
            padding: "9px 20px", borderRadius: "8px", cursor: "pointer",
            background: "transparent", border: `1px solid ${P.border}`,
            color: P.sub, fontSize: "13px", fontWeight: 600,
          }}>Annuler</button>
          <button type="button" onClick={onConfirm} style={{
            padding: "9px 20px", borderRadius: "8px", cursor: "pointer",
            background: accentColor + "1A", border: `1px solid ${accentColor}4D`,
            color: accentColor, fontSize: "13px", fontWeight: 700,
          }}>{labelConfirm}</button>
        </div>
      </div>
    </div>
  );
}

// ─── 10. COMPOSANT PRINCIPAL ──────────────────────────────────────────────────

export default function ChefExploitationDashboard() {
  const [agents,     setAgents]     = useState<Agent[]>(AGENTS_INIT);
  const [sites]                     = useState<Site[]>(SITES_INIT);
  const [alertes]                   = useState<Alerte[]>(ALERTES_INIT);
  const [anomalies]                 = useState<Anomalie[]>(ANOMALIES_INIT);
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

  const actifs    = agents.filter((a) => ["actif", "alerte", "critique"].includes(a.statut)).length;
  const dispos    = agents.filter((a) => a.statut === "disponible").length;

  // Initialise to "--:--" so server and client agree, then sync after mount
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleReset = () => { setAgents(AGENTS_INIT); setShowReset(false); };
  const handleExit  = () => { setShowExit(false); window.history.back(); };

  return (
    <div style={{ background: P.bg, minHeight: "100vh", fontFamily: P.font, color: P.text, fontSize: "14px" }}>
      <Header
        time={time}
        onReset={() => setShowReset(true)}
        onExit={() => setShowExit(true)}
        onImport={() => { imp.reset(); setShowImport(true); }}
      />

      <KpiRow total={agents.length} actifs={actifs} anomalies={anomalies.length} dispos={dispos} />

      <div style={{ display: "grid", gridTemplateColumns: "5fr 4fr 4fr", gap: "16px", padding: "16px 24px 32px" }}>
        {/* Colonne gauche */}
        <Plannings agents={agents} />

        {/* Colonne centrale */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <SitesActifs sites={sites} />
          <AnomaliesPointage anomalies={anomalies} />
        </div>

        {/* Colonne droite */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <AlertesIncidents alertes={alertes} />
          <IABusiness remplacements={IA_REMPLACEMENTS} />
          <GestionAgents />
        </div>
      </div>

      {showImport && <ModalImport imp={imp} onClose={() => setShowImport(false)} />}

      {showReset && (
        <ModalConfirm
          icon="↺" accentColor={P.amber}
          title="Réinitialiser le tableau de bord"
          message="Toutes les modifications seront perdues. Les données initiales seront restaurées."
          labelConfirm="Confirmer le reset"
          onConfirm={handleReset} onCancel={() => setShowReset(false)}
        />
      )}
      {showExit && (
        <ModalConfirm
          icon="←" accentColor={P.red}
          title="Quitter le tableau de bord"
          message="Voulez-vous vraiment quitter la vue Chef d'exploitation ?"
          labelConfirm="Quitter"
          onConfirm={handleExit} onCancel={() => setShowExit(false)}
        />
      )}
    </div>
  );
}
