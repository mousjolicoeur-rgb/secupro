"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useRef } from "react";

/* ── Tokens ─────────────────────────────────────────────────────────────── */
const NAVY   = "#060E18";
const NAVY_2 = "#091527";
const NAVY_3 = "#0D1F35";
const CYAN   = "#00C8F0";
const ORANGE = "#F5822A";

/* ── Types ──────────────────────────────────────────────────────────────── */
type Status = "valid" | "warning" | "expired";
interface Agent { nom: string; prenom: string; carte: string; exp: string; status: Status; jours: number; }

/* ── Mock data ──────────────────────────────────────────────────────────── */
const AGENTS: Agent[] = [
  { nom:"MARTIN",  prenom:"Jean",   carte:"APS-2021-047921", exp:"15/08/2025", status:"warning", jours: 30   },
  { nom:"DUBOIS",  prenom:"Sarah",  carte:"APS-2023-112048", exp:"30/01/2027", status:"valid",   jours: 603  },
  { nom:"BERNARD", prenom:"Karim",  carte:"APS-2020-098734", exp:"01/12/2024", status:"expired", jours: -157 },
  { nom:"LEROY",   prenom:"Amélie", carte:"APS-2022-034512", exp:"22/09/2026", status:"valid",   jours: 473  },
  { nom:"MOREAU",  prenom:"Thomas", carte:"APS-2021-076341", exp:"04/07/2025", status:"warning", jours: 58   },
  { nom:"PETIT",   prenom:"Nadia",  carte:"APS-2019-005817", exp:"18/03/2024", status:"expired", jours: -415 },
  { nom:"GARCIA",  prenom:"Luis",   carte:"APS-2023-089234", exp:"11/06/2027", status:"valid",   jours: 766  },
];

const RAW_ROWS = [
  ["martin",   "jean",    "2021-047921",      "15/08/25"  ],
  ["Dubois",   "SARAH",   "APS2023112048",    "30-01-2027"],
  ["BERNARD",  "karim",   "098734",           "01/12/2024"],
  ["leroy",    "amelie",  "APS-2022-034512",  "22/09/26"  ],
  ["moreau t", "",        "076341",           "04-07-2025"],
];

const STATUS_COLOR: Record<Status, string> = { valid:"#22c55e", warning:ORANGE, expired:"#ef4444" };
const STATUS_LABEL: Record<Status, string> = { valid:"Valide", warning:"Expire bientôt", expired:"Expiré" };
const STATUS_ICON:  Record<Status, string> = { valid:"✓", warning:"⚠", expired:"✗" };

/* ════════════════════════════════════════════════ STEP 1 : Collecte ══════ */
function StepCollecte({ onNext }: { onNext: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (name: string) => setFile(name);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f.name); }}
        style={{
          border: `2px dashed ${dragging ? CYAN : file ? "#22c55e" : "rgba(0,200,240,0.22)"}`,
          borderRadius: "20px",
          padding: "56px 32px",
          textAlign: "center",
          cursor: file ? "default" : "pointer",
          background: dragging ? "rgba(0,200,240,0.05)" : file ? "rgba(34,197,94,0.04)" : "rgba(9,21,39,0.5)",
          transition: "all 0.25s",
        }}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.csv,.xls" style={{ display:"none" }}
          onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0].name)} />

        {file ? (
          <>
            <div style={{ fontSize:"38px", marginBottom:"12px" }}>✅</div>
            <p style={{ color:"#22c55e", fontWeight:600, fontSize:"15px" }}>{file}</p>
            <p style={{ color:"rgba(148,163,184,0.55)", fontSize:"13px", marginTop:"6px" }}>Fichier prêt pour l'analyse IA</p>
          </>
        ) : (
          <>
            <div style={{ fontSize:"40px", marginBottom:"16px" }}>📂</div>
            <p style={{ color:"#f1f5f9", fontSize:"16px", fontWeight:500, marginBottom:"8px" }}>Glissez votre fichier ici</p>
            <p style={{ color:"rgba(148,163,184,0.5)", fontSize:"13px", marginBottom:"22px" }}>ou cliquez pour sélectionner</p>
            <div style={{ display:"flex", gap:"8px", justifyContent:"center" }}>
              {[".xlsx",".csv",".xls"].map((ext) => (
                <span key={ext} style={{ background:"rgba(0,200,240,0.08)", border:"1px solid rgba(0,200,240,0.2)", color:CYAN, fontSize:"11px", fontWeight:700, padding:"4px 14px", borderRadius:"999px", fontFamily:"'Rajdhani', sans-serif", letterSpacing:"0.1em" }}>
                  {ext}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {!file && (
        <button
          onClick={() => pickFile("effectifs_gardiennage_Q2_2025.xlsx")}
          style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(148,163,184,0.55)", fontSize:"12px", cursor:"pointer", padding:"11px 20px", borderRadius:"10px", transition:"all 0.2s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(0,200,240,0.3)"; (e.currentTarget as HTMLButtonElement).style.color=CYAN; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.color="rgba(148,163,184,0.55)"; }}
        >
          → Utiliser le fichier de démonstration
        </button>
      )}

      {file && (
        <button
          onClick={onNext}
          style={{ background:`linear-gradient(135deg,#009BB8,${CYAN})`, border:"none", color:NAVY, fontFamily:"'Rajdhani', sans-serif", fontSize:"13px", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", padding:"16px 40px", borderRadius:"12px", cursor:"pointer", boxShadow:`0 0 40px rgba(0,200,240,0.35)`, alignSelf:"flex-start" }}
        >
          Analyser avec l'IA →
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════ STEP 2 : Parsing ═══════ */
const PARSED_ROWS = [
  ["MARTIN",  "Jean",   "APS-2021-047921", "15/08/2025"],
  ["DUBOIS",  "Sarah",  "APS-2023-112048", "30/01/2027"],
  ["BERNARD", "Karim",  "APS-2020-098734", "01/12/2024"],
  ["LEROY",   "Amélie", "APS-2022-034512", "22/09/2026"],
  ["MOREAU",  "Thomas", "APS-2021-076341", "04/07/2025"],
];
const PARSED_COLS = ["Nom", "Prénom", "N° Carte Pro", "Date Expir."];

function StepParsing({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
      <div className="parse-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>

        {/* Brut */}
        <div>
          <p style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(245,130,42,0.6)", marginBottom:"10px" }}>⚠ Données brutes</p>
          <div style={{ background:NAVY_2, border:"1px solid rgba(245,130,42,0.14)", borderRadius:"12px", overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <tbody>
                {RAW_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding:"8px 12px", fontSize:"11px", fontFamily:"monospace", color: cell ? "rgba(203,213,225,0.65)" : "rgba(245,130,42,0.45)" }}>
                        {cell || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Parsé */}
        <div>
          <p style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(34,197,94,0.7)", marginBottom:"10px" }}>✓ Après analyse IA</p>
          <div style={{ background:NAVY_2, border:"1px solid rgba(0,200,240,0.14)", borderRadius:"12px", overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(0,200,240,0.1)" }}>
                  {PARSED_COLS.map((c) => (
                    <th key={c} style={{ padding:"8px 12px", textAlign:"left", fontFamily:"'Rajdhani', sans-serif", fontSize:"9px", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(0,200,240,0.45)" }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PARSED_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding:"8px 12px", fontSize:"11px", fontFamily: j===2 ? "monospace" : "inherit", color:"#f1f5f9" }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Détections */}
      <div style={{ background:"rgba(0,200,240,0.04)", border:"1px solid rgba(0,200,240,0.12)", borderRadius:"14px", padding:"20px 24px" }}>
        <p style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:CYAN, marginBottom:"14px" }}>Détections automatiques</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
          {["5 doublons détectés","3 formats de date normalisés","2 numéros de carte reconstitués","1 prénom manquant complété","Noms mis en MAJUSCULES CNAPS"].map((t) => (
            <span key={t} style={{ background:"rgba(0,200,240,0.07)", border:"1px solid rgba(0,200,240,0.18)", color:"rgba(203,213,225,0.85)", fontSize:"12px", padding:"5px 14px", borderRadius:"999px" }}>✓ {t}</span>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        style={{ background:`linear-gradient(135deg,#009BB8,${CYAN})`, border:"none", color:NAVY, fontFamily:"'Rajdhani', sans-serif", fontSize:"13px", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", padding:"16px 40px", borderRadius:"12px", cursor:"pointer", boxShadow:`0 0 40px rgba(0,200,240,0.35)`, alignSelf:"flex-start" }}
      >
        Valider la conformité →
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════ STEP 3 : Validation ════ */
function StepValidation() {
  const valid   = AGENTS.filter((a) => a.status === "valid").length;
  const warning = AGENTS.filter((a) => a.status === "warning").length;
  const expired = AGENTS.filter((a) => a.status === "expired").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"22px" }}>

      {/* Summary */}
      <div className="val-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
        {([["Conformes",valid,"#22c55e"],["À renouveler",warning,ORANGE],["Expirés",expired,"#ef4444"]] as [string,number,string][]).map(([label,count,color]) => (
          <div key={label} style={{ background:NAVY_2, border:`1px solid ${color}22`, borderRadius:"14px", padding:"20px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"42px", fontWeight:700, color, lineHeight:1 }}>{count}</div>
            <div style={{ fontSize:"12px", color:"rgba(148,163,184,0.6)", marginTop:"6px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:NAVY_2, border:"1px solid rgba(0,200,240,0.1)", borderRadius:"16px", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(0,200,240,0.08)" }}>
              {["Agent","N° Carte Pro","Expiration","Délai","Statut"].map((h) => (
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontFamily:"'Rajdhani', sans-serif", fontSize:"9px", fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(0,200,240,0.4)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AGENTS.map((a, i) => {
              const c = STATUS_COLOR[a.status];
              return (
                <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding:"11px 16px" }}>
                    <div style={{ fontWeight:600, color:"#f1f5f9", fontSize:"13px" }}>{a.nom}</div>
                    <div style={{ color:"rgba(148,163,184,0.5)", fontSize:"11px" }}>{a.prenom}</div>
                  </td>
                  <td style={{ padding:"11px 16px", fontFamily:"monospace", fontSize:"11px", color:"rgba(203,213,225,0.65)" }}>{a.carte}</td>
                  <td style={{ padding:"11px 16px", fontSize:"13px", color: a.status==="expired" ? "#ef4444" : "rgba(203,213,225,0.8)" }}>{a.exp}</td>
                  <td style={{ padding:"11px 16px", fontSize:"12px", fontFamily:"'Rajdhani', sans-serif", fontWeight:700, color:c }}>
                    {a.jours > 0 ? `J−${a.jours}` : `+${Math.abs(a.jours)}j`}
                  </td>
                  <td style={{ padding:"11px 16px" }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", background:`${c}11`, border:`1px solid ${c}33`, color:c, fontSize:"10px", fontWeight:700, fontFamily:"'Rajdhani', sans-serif", letterSpacing:"0.1em", textTransform:"uppercase", padding:"3px 10px", borderRadius:"999px" }}>
                      {STATUS_ICON[a.status]} {STATUS_LABEL[a.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Export */}
      <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
        <button style={{ background:`linear-gradient(135deg,#009BB8,${CYAN})`, border:"none", color:NAVY, fontFamily:"'Rajdhani', sans-serif", fontSize:"12px", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", padding:"14px 30px", borderRadius:"12px", cursor:"pointer", boxShadow:`0 0 32px rgba(0,200,240,0.3)` }}>
          📄 Exporter rapport PDF CNAPS
        </button>
        <button style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontFamily:"'Rajdhani', sans-serif", fontSize:"12px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", padding:"14px 26px", borderRadius:"12px", cursor:"pointer" }}>
          📬 Envoyer alertes aux agents
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════ STEPPER CONTAINER ════ */
const STEPS = [
  { num:1, label:"Collecte",   sub:"Import du fichier"     },
  { num:2, label:"Parsing",    sub:"Analyse IA"            },
  { num:3, label:"Validation", sub:"Rapport conformité"    },
];

function ImportStepper() {
  const [step, setStep] = useState(0);

  return (
    <section style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 24px 96px" }}>
      <div style={{ textAlign:"center", marginBottom:"52px" }}>
        <p style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.42em", textTransform:"uppercase", color:"rgba(0,200,240,0.4)", marginBottom:"14px" }}>Tunnel d'importation</p>
        <h2 style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.03em", color:"#fff", margin:"0 0 14px" }}>
          De l'import brut à la conformité totale
        </h2>
        <p style={{ fontSize:"15px", color:"rgba(148,163,184,0.6)", maxWidth:"480px", margin:"0 auto", lineHeight:1.65 }}>
          Importez n'importe quel fichier — SecuPRO fait le reste en moins de 10 secondes.
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"center", marginBottom:"44px" }}>
        {STEPS.map((s, i) => (
          <div key={s.num} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length-1 ? 1 : "unset" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", cursor:"pointer", flexShrink:0 }} onClick={() => setStep(i)}>
              <div style={{ width:"46px", height:"46px", borderRadius:"50%", background: i < step ? "#22c55e" : i===step ? `linear-gradient(135deg,#009BB8,${CYAN})` : NAVY_2, border:`2px solid ${i < step ? "#22c55e" : i===step ? CYAN : "rgba(255,255,255,0.1)"}`, display:"flex", alignItems:"center", justifyContent:"center", color: i <= step ? NAVY : "rgba(255,255,255,0.3)", fontFamily:"'Rajdhani', sans-serif", fontSize:"16px", fontWeight:700, transition:"all 0.3s", boxShadow: i===step ? `0 0 24px rgba(0,200,240,0.4)` : "none" }}>
                {i < step ? "✓" : s.num}
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"12px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color: i===step ? CYAN : i < step ? "#22c55e" : "rgba(255,255,255,0.28)" }}>{s.label}</div>
                <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.38)", marginTop:"2px" }}>{s.sub}</div>
              </div>
            </div>
            {i < STEPS.length-1 && (
              <div style={{ flex:1, height:"2px", background: i < step ? "#22c55e" : "rgba(255,255,255,0.07)", margin:"0 10px", marginBottom:"28px", transition:"background 0.3s" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div style={{ background:`linear-gradient(145deg,${NAVY_2},${NAVY_3})`, border:"1px solid rgba(0,200,240,0.1)", borderRadius:"24px", padding:"40px 36px" }}>
        {step === 0 && <StepCollecte onNext={() => setStep(1)} />}
        {step === 1 && <StepParsing  onNext={() => setStep(2)} />}
        {step === 2 && <StepValidation />}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════ AI SECTION ═══════════ */
function AISection() {
  return (
    <section style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 24px 100px" }}>
      <div style={{ textAlign:"center", marginBottom:"52px" }}>
        <p style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.42em", textTransform:"uppercase", color:"rgba(0,200,240,0.4)", marginBottom:"14px" }}>Intelligence artificielle</p>
        <h2 style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.03em", color:"#fff", margin:0 }}>La magie de l'analyse IA</h2>
      </div>

      <div className="ai-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px" }}>

        {/* Card 1 : Nettoyage */}
        <div style={{ background:`linear-gradient(145deg,${NAVY_2},${NAVY_3})`, border:"1px solid rgba(255,255,255,0.06)", borderRadius:"20px", padding:"32px 26px", display:"flex", flexDirection:"column", gap:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <span style={{ fontSize:"26px" }}>🧹</span>
            <h3 style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"17px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#fff", margin:0 }}>Nettoyage Intelligent</h3>
          </div>
          <p style={{ fontSize:"13px", color:"rgba(148,163,184,0.65)", lineHeight:1.6, margin:0 }}>Correction automatique des fautes de frappe, normalisation des formats et détection des doublons.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"6px", marginBottom:"4px" }}>
              <span style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"9px", letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(245,130,42,0.5)" }}>Avant</span>
              <span />
              <span style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"9px", letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(34,197,94,0.5)" }}>Après</span>
            </div>
            {[
              { b:"martin jean",    a:"MARTIN Jean"       },
              { b:"APS2023112048",  a:"APS-2023-112048"   },
              { b:"30-01-2027",     a:"30/01/2027"        },
              { b:"(vide)",         a:"Détecté + alerté"  },
            ].map(({ b, a }) => (
              <div key={b} style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"6px", alignItems:"center" }}>
                <span style={{ background:"rgba(245,130,42,0.07)", border:"1px solid rgba(245,130,42,0.15)", borderRadius:"6px", padding:"5px 8px", fontSize:"10px", fontFamily:"monospace", color:"rgba(203,213,225,0.6)" }}>{b}</span>
                <span style={{ color:CYAN, fontSize:"13px" }}>→</span>
                <span style={{ background:"rgba(34,197,94,0.07)", border:"1px solid rgba(34,197,94,0.15)", borderRadius:"6px", padding:"5px 8px", fontSize:"10px", fontFamily:"monospace", color:"#86efac" }}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 : Veille */}
        <div style={{ background:`linear-gradient(145deg,${NAVY_2},${NAVY_3})`, border:"1px solid rgba(255,255,255,0.06)", borderRadius:"20px", padding:"32px 26px", display:"flex", flexDirection:"column", gap:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <span style={{ fontSize:"26px" }}>🔔</span>
            <h3 style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"17px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#fff", margin:0 }}>Veille Réglementaire</h3>
          </div>
          <p style={{ fontSize:"13px", color:"rgba(148,163,184,0.65)", lineHeight:1.6, margin:0 }}>L'IA calcule les délais de renouvellement et déclenche des alertes automatiques à J−60, J−30, J−7.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {([
              { label:"Carte expire dans 30 jours", n:2, color:ORANGE        },
              { label:"Carte expire dans 60 jours", n:1, color:"#facc15"     },
              { label:"Carte expirée",              n:2, color:"#ef4444"     },
              { label:"Renouvellement en cours",    n:1, color:CYAN          },
            ] as { label:string; n:number; color:string }[]).map(({ label, n, color }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:`${color}09`, border:`1px solid ${color}20`, borderRadius:"10px", padding:"10px 14px" }}>
                <span style={{ fontSize:"12px", color:"rgba(203,213,225,0.8)" }}>{label}</span>
                <span style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"22px", fontWeight:700, color }}>{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 : Rapport */}
        <div style={{ background:`linear-gradient(145deg,${NAVY_2},${NAVY_3})`, border:"1px solid rgba(255,255,255,0.06)", borderRadius:"20px", padding:"32px 26px", display:"flex", flexDirection:"column", gap:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <span style={{ fontSize:"26px" }}>📄</span>
            <h3 style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"17px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#fff", margin:0 }}>Rapport de Conformité</h3>
          </div>
          <p style={{ fontSize:"13px", color:"rgba(148,163,184,0.65)", lineHeight:1.6, margin:0 }}>Exportez en un clic un registre prêt pour un contrôle administratif CNAPS : effectifs, statuts, habilitations.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {["Registre CNAPS officiel","Rapport mensuel d'activité","Fiche individuelle agent","Export conforme audit"].map((doc) => (
              <div key={doc} style={{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(34,197,94,0.05)", border:"1px solid rgba(34,197,94,0.15)", borderRadius:"10px", padding:"11px 14px" }}>
                <span style={{ color:"#22c55e", fontSize:"14px" }}>↓</span>
                <span style={{ fontSize:"13px", color:"rgba(203,213,225,0.85)", flex:1 }}>{doc}</span>
                <span style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"9px", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", color:"#22c55e", padding:"3px 9px", borderRadius:"999px", flexShrink:0 }}>PDF</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════ MODULE LABELS ════════ */
const MODULE_LABELS: Record<string, { label:string; icon:string }> = {
  csv:    { label:"Effectifs CSV",    icon:"📊" },
  ia:     { label:"Plannings IA",     icon:"🤖" },
  live:   { label:"Dashboard Live",   icon:"📡" },
  pdf:    { label:"Rapports PDF",     icon:"📄" },
  cnaps:  { label:"Conformité CNAPS", icon:"🛡️" },
  alerts: { label:"Alertes Push",     icon:"🔔" },
};

/* ══════════════════════════════════════════════════ PAGE PRINCIPALE ══════ */
export default function EntrepriseModulePage() {
  const params = useParams();
  const slug   = params?.slug as string ?? "";
  const meta   = MODULE_LABELS[slug];

  /* ── Fallback pour les slugs non-CSV ─────────────────────────────────── */
  if (slug !== "csv") {
    const label = meta?.label ?? slug;
    const icon  = meta?.icon  ?? "📦";
    return (
      <div style={{ background:NAVY, minHeight:"100vh", color:"#f1f5f9", fontFamily:"'DM Sans', system-ui, sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"32px", padding:"40px 24px", textAlign:"center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,600&display=swap');`}</style>
        <div style={{ fontSize:"48px" }}>{icon}</div>
        <p style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.4em", textTransform:"uppercase", color:`rgba(0,200,240,0.5)` }}>Module · /entreprises/{slug}</p>
        <h1 style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"clamp(2rem,6vw,4rem)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", color:"#ffffff", margin:0 }}>{label}</h1>
        <p style={{ fontSize:"15px", color:"rgba(148,163,184,0.7)", maxWidth:"380px", lineHeight:1.7 }}>
          Page de détail du module <strong style={{ color:CYAN }}>{label}</strong> — contenu détaillé à venir.
        </p>
        <Link href="/entreprises" style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(0,200,240,0.08)", border:"1px solid rgba(0,200,240,0.25)", color:CYAN, fontFamily:"'Rajdhani', sans-serif", fontSize:"12px", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", padding:"12px 28px", borderRadius:"10px", textDecoration:"none" }}>
          ← Retour aux modules
        </Link>
      </div>
    );
  }

  /* ── Page CSV complète ────────────────────────────────────────────────── */
  return (
    <div style={{ background:NAVY, minHeight:"100vh", color:"#f1f5f9", fontFamily:"'DM Sans', system-ui, sans-serif", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        @media (max-width: 768px) {
          .ai-grid    { grid-template-columns: 1fr !important; }
          .parse-grid { grid-template-columns: 1fr !important; }
          .val-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Ambient */}
      <div aria-hidden style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(0,200,240,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,240,0.02) 1px,transparent 1px)", backgroundSize:"52px 52px", maskImage:"radial-gradient(ellipse 85% 70% at 50% 20%,black 0%,transparent 72%)" }} />

      {/* Nav */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(6,14,24,0.92)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:"1px solid rgba(0,200,240,0.07)", padding:"0 24px" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href="/entreprises" style={{ display:"inline-flex", alignItems:"center", gap:"6px", textDecoration:"none", color:"rgba(148,163,184,0.55)", fontFamily:"'Rajdhani', sans-serif", fontSize:"12px", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" }}>
            ← Modules
          </Link>
          <span style={{ fontFamily:"'Rajdhani', sans-serif", fontWeight:700, fontSize:"1.25rem", letterSpacing:"2px" }}>
            <span style={{ color:"#fff" }}>Secu</span><span style={{ color:CYAN }}>PRO</span>
          </span>
          <Link href="/espace-societe/activate" style={{ background:`linear-gradient(135deg,#c45e00,${ORANGE})`, color:"#fff", fontFamily:"'Rajdhani', sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", padding:"9px 20px", borderRadius:"10px", textDecoration:"none" }}>
            Essai gratuit →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position:"relative", zIndex:1, maxWidth:"1100px", margin:"0 auto", padding:"80px 24px 72px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:"32px" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"10px", background:"rgba(0,200,240,0.07)", border:"1px solid rgba(0,200,240,0.22)", borderRadius:"999px", padding:"7px 22px" }}>
          <span style={{ fontSize:"16px" }}>📊</span>
          <span style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.35em", textTransform:"uppercase", color:CYAN }}>Module · Effectifs CSV</span>
        </div>
        <h1 style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"clamp(2.4rem,6vw,4.2rem)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.02em", lineHeight:1.06, color:"#fff", margin:0 }}>
          De l'import brut<br />
          <span style={{ color:CYAN, textShadow:`0 0 30px rgba(0,200,240,0.5)` }}>à la décision assistée par l'IA</span>
        </h1>
        <p style={{ fontSize:"clamp(14px,1.8vw,17px)", color:"rgba(148,163,184,0.8)", lineHeight:1.72, maxWidth:"560px" }}>
          SecuPRO Tech importe et analyse vos fichiers d'effectifs — même mal structurés — pour vous livrer un rapport de conformité CNAPS prêt à l'emploi en moins de 10 secondes.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px", width:"100%", maxWidth:"680px" }}>
          {([["< 10s","Temps d'analyse",CYAN],["100%","Formats CSV/Excel",CYAN],["CNAPS","Registre conforme",ORANGE]] as [string,string,string][]).map(([v,l,c]) => (
            <div key={l} style={{ background:`linear-gradient(145deg,${NAVY_2},${NAVY_3})`, border:"1px solid rgba(0,200,240,0.1)", borderRadius:"16px", padding:"20px 14px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"2rem", fontWeight:700, color:c, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.55)", marginTop:"6px" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sections */}
      <div style={{ position:"relative", zIndex:1 }}>
        <ImportStepper />
        <AISection />
      </div>

      {/* CTA */}
      <section style={{ position:"relative", zIndex:1, maxWidth:"760px", margin:"0 auto", padding:"0 24px 100px", textAlign:"center" }}>
        <div style={{ background:`linear-gradient(135deg,rgba(0,200,240,0.07) 0%,${NAVY_2} 70%)`, border:"1px solid rgba(0,200,240,0.2)", borderRadius:"28px", padding:"56px 44px" }}>
          <h2 style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:"clamp(1.6rem,4vw,2.8rem)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", color:"#fff", margin:"0 0 16px" }}>
            Prêt à tester sur vos données ?
          </h2>
          <p style={{ fontSize:"15px", color:"rgba(148,163,184,0.7)", lineHeight:1.65, maxWidth:"420px", margin:"0 auto 36px" }}>
            1 mois d'essai gratuit. Aucune carte bancaire requise. Configuration en 5 minutes.
          </p>
          <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/espace-societe/activate" style={{ background:`linear-gradient(135deg,#009BB8,${CYAN})`, color:NAVY, fontFamily:"'Rajdhani', sans-serif", fontSize:"13px", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", padding:"16px 40px", borderRadius:"13px", textDecoration:"none", boxShadow:`0 0 44px rgba(0,200,240,0.35)` }}>
              Démarrer l'essai gratuit →
            </Link>
            <Link href="/entreprises" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontFamily:"'Rajdhani', sans-serif", fontSize:"13px", fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", padding:"16px 32px", borderRadius:"13px", textDecoration:"none" }}>
              ← Voir tous les modules
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
