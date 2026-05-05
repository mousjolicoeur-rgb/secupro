"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Shield, MapPin, Clock, AlertTriangle, CheckCircle2,
  Zap, ArrowLeft, FileText, Send, Radio, Phone,
  ChevronRight, Activity, RotateCcw, LogOut, Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ══════════════════════════════════════════════════════════════════════════════
// PALETTE — identique au Dashboard Exploitation
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  cyan:    "#00d1ff",
  green:   "#00FFCC",
  orange:  "#FF8C00",
  orangeL: "#FFCC00",
  red:     "#f87171",
  violet:  "#a78bfa",
  indigo:  "#818cf8",
  bg:      "#0B1426",
  muted:   "rgba(148,163,184,0.55)",
};

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

type Phase = "veille" | "alerte" | "mission" | "rapport" | "termine";
type Tab   = "accueil" | "intervention" | "rapport";

interface AlertData {
  site:      string;
  debut:     string;
  fin:       string;
  motif:     string;
  timestamp: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENT MOCK — données de session (sera remplacé par auth réelle)
// ══════════════════════════════════════════════════════════════════════════════

const AGENT = {
  prenom: "Karim", nom: "V.",
  poste: "Agent de sécurité APS",
  matricule: "SP-2026-0047",
  site: "Site Auchan", horaires: "06:00 – 14:00",
  nextSite: "Site Orange", nextHoraires: "14:00 – 22:00", nextJour: "Demain",
  tel: "0611223344",
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANTS UTILITAIRES
// ══════════════════════════════════════════════════════════════════════════════

function NeonBadge({ label, color, pulse = false }: { label: string; color: string; pulse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]"
      style={{
        background: `${color}14`, border: `1px solid ${color}45`,
        color, boxShadow: `0 0 10px ${color}30`,
      }}>
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
          style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
      )}
      {label}
    </span>
  );
}

function Card({ children, accent = C.cyan, className = "" }: {
  children: React.ReactNode; accent?: string; className?: string;
}) {
  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "rgba(10,20,44,0.85)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${accent}18`,
        boxShadow: `0 0 24px ${accent}08`,
      }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ONGLET 1 — ACCUEIL
// ══════════════════════════════════════════════════════════════════════════════

function TabAccueil({ alert }: { alert: AlertData | null }) {
  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* Carte identité agent */}
      <Card accent={C.cyan}>
        <div className="flex items-center gap-4 p-4"
          style={{ borderBottom: "1px solid rgba(0,209,255,0.08)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-[15px] font-black"
            style={{ background:"rgba(0,209,255,0.1)", border:"1px solid rgba(0,209,255,0.3)", color: C.cyan,
              boxShadow:"0 0 16px rgba(0,209,255,0.2)" }}>
            {AGENT.prenom[0]}{AGENT.nom[0]}
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-[16px] font-black" style={{ color:"#fff" }}>
              {AGENT.prenom} {AGENT.nom}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: C.muted }}>
              {AGENT.poste} · {AGENT.matricule}
            </span>
          </div>
          <NeonBadge label="En poste" color={C.green} pulse />
        </div>

        {/* Vacation en cours */}
        <div className="p-4 flex flex-col gap-3">
          <p className="text-[8px] font-black uppercase tracking-[0.35em]"
            style={{ color:"rgba(0,209,255,0.45)" }}>
            Vacation en cours
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={13} style={{ color: C.cyan }} />
              <span className="text-[15px] font-black" style={{ color:"#fff" }}>{AGENT.site}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background:"rgba(0,209,255,0.07)", border:"1px solid rgba(0,209,255,0.18)" }}>
              <Clock size={10} style={{ color: C.cyan }} />
              <span className="text-[11px] font-black font-mono" style={{ color: C.cyan }}>
                {AGENT.horaires}
              </span>
            </div>
          </div>

          {/* Barre de progression de la vacation */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[8px]" style={{ color:"rgba(148,163,184,0.4)" }}>Progression</span>
              <span className="text-[8px] font-black" style={{ color: C.green }}>62%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width:"62%", background:`linear-gradient(90deg, ${C.cyan}, ${C.green})`,
                  boxShadow:`0 0 8px ${C.green}60` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Prochaine vacation */}
      <Card accent={C.violet}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[8px] font-black uppercase tracking-[0.3em]"
              style={{ color:"rgba(167,139,250,0.5)" }}>
              Prochaine vacation
            </p>
            <div className="flex items-center gap-2">
              <MapPin size={11} style={{ color: C.violet }} />
              <span className="text-[14px] font-black" style={{ color:"#fff" }}>{AGENT.nextSite}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={9} style={{ color: C.muted }} />
              <span className="text-[10px] font-mono" style={{ color: C.muted }}>
                {AGENT.nextJour} · {AGENT.nextHoraires}
              </span>
            </div>
          </div>
          <ChevronRight size={18} style={{ color:"rgba(167,139,250,0.3)" }} />
        </div>
      </Card>

      {/* Alerte active si présente */}
      {alert && (
        <div className="rounded-2xl p-4 flex flex-col gap-2"
          style={{ background:"rgba(255,140,0,0.08)", border:"1px solid rgba(255,140,0,0.4)",
            boxShadow:"0 0 20px rgba(255,140,0,0.15)" }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: C.orange }} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: C.orange }}>
              Alerte mission reçue
            </span>
          </div>
          <p className="text-[11px]" style={{ color:"rgba(255,140,0,0.75)" }}>
            {alert.site} · {alert.debut}–{alert.fin} · {alert.motif}
          </p>
        </div>
      )}

      {/* Contacts rapides */}
      <Card accent="rgba(148,163,184,0.15)">
        <div className="p-4">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-3"
            style={{ color:"rgba(148,163,184,0.35)" }}>
            Contacts rapides
          </p>
          {[
            { label:"Responsable opérationnel", tel:"0612345678", color: C.cyan },
            { label:"Astreinte sécurité",        tel:"0698765432", color: C.violet },
          ].map((c, i) => (
            <a key={i} href={`tel:${c.tel}`}
              className="flex items-center justify-between py-2.5 transition-all duration-150"
              style={{ borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div className="flex items-center gap-2">
                <Phone size={11} style={{ color: c.color }} />
                <span className="text-[11px] font-semibold" style={{ color:"rgba(241,245,249,0.8)" }}>
                  {c.label}
                </span>
              </div>
              <span className="text-[10px] font-mono" style={{ color: c.color }}>{c.tel}</span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ONGLET 2 — INTERVENTION
// ══════════════════════════════════════════════════════════════════════════════

function TabIntervention({
  phase, alert,
  onAccept, onRefuse,
}: {
  phase: Phase;
  alert: AlertData | null;
  onAccept: () => void;
  onRefuse: () => void;
}) {
  const isAlerte  = phase === "alerte";
  const isMission = phase === "mission";

  if (phase === "veille") {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <Card accent={C.indigo}>
          <div className="p-6 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background:"rgba(129,140,248,0.08)", border:"1px solid rgba(129,140,248,0.2)" }}>
              <Radio size={26} style={{ color: C.indigo }} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-black" style={{ color:"#fff" }}>En veille</span>
              <p className="text-[11px]" style={{ color: C.muted }}>
                En attente d'une alerte mission du Dashboard
              </p>
            </div>
            <NeonBadge label="Système connecté" color={C.indigo} pulse />
          </div>
        </Card>

        {/* Bouton demo — simule une alerte entrante */}
        <button
          onClick={() => {
            const data: AlertData = {
              site: "Site Auchan", debut: "06:00", fin: "14:00",
              motif: "Remplacement urgent — IA SecuPRO",
              timestamp: Date.now(),
            };
            try { localStorage.setItem("sp_alert", JSON.stringify(data)); } catch {}
            // Déclenche l'event storage manuellement (même onglet)
            window.dispatchEvent(new StorageEvent("storage", { key:"sp_alert", newValue: JSON.stringify(data) }));
          }}
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] transition-all duration-150"
          style={{ background:"rgba(129,140,248,0.06)", border:"1px dashed rgba(129,140,248,0.25)", color:"rgba(129,140,248,0.5)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.indigo; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(129,140,248,0.5)"; }}>
          <Zap size={11} /> Simuler une alerte (démo)
        </button>
      </div>
    );
  }

  if (isAlerte && alert) {
    return (
      <div className="flex flex-col gap-4 pb-4">
        {/* Carte alerte — fond orange */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background:"linear-gradient(135deg, rgba(255,140,0,0.12), rgba(10,20,44,0.95))",
            border:"1px solid rgba(255,140,0,0.5)",
            boxShadow:"0 0 40px rgba(255,140,0,0.2)",
          }}>
          {/* Barre de progression pulsante */}
          <div className="h-1 alerte-bar" style={{ background:`linear-gradient(90deg, ${C.orange}, ${C.orangeL})` }} />

          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:"rgba(255,140,0,0.15)", border:"1px solid rgba(255,140,0,0.4)" }}>
                <AlertTriangle size={18} style={{ color: C.orange }} className="animate-bounce" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.35em]"
                  style={{ color:"rgba(255,140,0,0.6)" }}>
                  Alerte mission entrante
                </p>
                <span className="text-[15px] font-black" style={{ color:"#fff" }}>
                  Intervention requise
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl p-3"
              style={{ background:"rgba(255,140,0,0.07)", border:"1px solid rgba(255,140,0,0.2)" }}>
              {[
                { label:"Site",    value: alert.site,   Icon: MapPin  },
                { label:"Créneau", value: `${alert.debut} – ${alert.fin}`, Icon: Clock },
                { label:"Motif",   value: alert.motif,  Icon: AlertTriangle },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <r.Icon size={11} style={{ color: C.orange, flexShrink:0 }} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] w-14 shrink-0"
                    style={{ color:"rgba(255,140,0,0.55)" }}>
                    {r.label}
                  </span>
                  <span className="text-[12px] font-bold" style={{ color:"rgba(241,245,249,0.9)" }}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA ACCEPTER */}
            <button
              onClick={onAccept}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] transition-all duration-200 active:scale-[0.97]"
              style={{
                background:"linear-gradient(135deg, #cc5500, #FF8C00, #FFCC00)",
                color:"#fff",
                boxShadow:"0 0 32px rgba(255,140,0,0.5), 0 4px 20px rgba(0,0,0,0.4)",
                border:"1px solid rgba(255,204,0,0.4)",
                textShadow:"0 1px 3px rgba(0,0,0,0.4)",
              }}>
              <Shield size={16} /> ACCEPTER LA MISSION
            </button>

            <button
              onClick={onRefuse}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-150"
              style={{ color:"rgba(248,113,113,0.5)", border:"1px solid rgba(248,113,113,0.12)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.5)"; }}>
              Refuser / Indisponible
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isMission && alert) {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <Card accent={C.green}>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} style={{ color: C.green }} />
              <span className="text-[13px] font-black" style={{ color: C.green }}>
                Mission acceptée
              </span>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-3"
              style={{ background:"rgba(0,255,204,0.05)", border:"1px solid rgba(0,255,204,0.18)" }}>
              {[
                { label:"Site",    value: alert.site },
                { label:"Créneau", value: `${alert.debut} – ${alert.fin}` },
                { label:"Motif",   value: alert.motif },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] w-14 shrink-0"
                    style={{ color:"rgba(0,255,204,0.4)" }}>
                    {r.label}
                  </span>
                  <span className="text-[12px] font-bold" style={{ color:"rgba(241,245,249,0.9)" }}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background:"rgba(0,255,204,0.06)", border:"1px solid rgba(0,255,204,0.15)" }}>
              <Activity size={11} style={{ color: C.green }} className="animate-pulse" />
              <span className="text-[10px] font-bold" style={{ color:"rgba(0,255,204,0.7)" }}>
                Mission en cours · Durée calculée automatiquement
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// ONGLET 3 — RAPPORT FLASH
// ══════════════════════════════════════════════════════════════════════════════

function TabRapport({
  phase, alert,
  onTerminer, onReset,
}: {
  phase: Phase;
  alert: AlertData | null;
  onTerminer: (obs: string) => void;
  onReset: () => void;
}) {
  const [obs,      setObs]      = useState("");
  const [sending,  setSending]  = useState(false);

  if (phase === "veille" || phase === "alerte") {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <Card accent={C.violet}>
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.18)" }}>
              <FileText size={22} style={{ color: C.violet }} />
            </div>
            <div>
              <span className="text-[13px] font-black" style={{ color:"#fff" }}>Rapport Flash</span>
              <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                Disponible après acceptation d'une mission
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "termine") {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <Card accent={C.green}>
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background:"rgba(0,255,204,0.1)", border:"1px solid rgba(0,255,204,0.3)",
                boxShadow:"0 0 24px rgba(0,255,204,0.2)" }}>
              <CheckCircle2 size={28} style={{ color: C.green }} />
            </div>
            <div>
              <span className="text-[16px] font-black" style={{ color: C.green }}>
                Rapport envoyé ✓
              </span>
              <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                Mission terminée · Données transmises au Dashboard
              </p>
            </div>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.22em] transition-all duration-150"
              style={{ background:"rgba(0,255,204,0.07)", border:"1px solid rgba(0,255,204,0.2)", color:"rgba(0,255,204,0.6)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.green; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,255,204,0.6)"; }}>
              <RotateCcw size={10} /> Nouvelle mission
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Phase mission ou rapport
  return (
    <div className="flex flex-col gap-4 pb-4">
      {alert && (
        <Card accent={C.violet}>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <FileText size={13} style={{ color: C.violet }} />
              <span className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: C.violet }}>
                Rapport de mission
              </span>
            </div>

            {/* Infos auto-remplies */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:"Site",   value: alert.site },
                { label:"Durée",  value: "8h" },
                { label:"Début",  value: alert.debut },
                { label:"Fin",    value: alert.fin },
              ].map((r, i) => (
                <div key={i} className="flex flex-col gap-0.5 px-3 py-2 rounded-lg"
                  style={{ background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.14)" }}>
                  <span className="text-[7px] font-black uppercase tracking-[0.25em]"
                    style={{ color:"rgba(167,139,250,0.45)" }}>{r.label}</span>
                  <span className="text-[12px] font-bold" style={{ color:"rgba(241,245,249,0.9)" }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Observations (champ libre) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.25em]"
                style={{ color:"rgba(167,139,250,0.5)" }}>
                Observations / Incidents
              </label>
              <textarea
                value={obs}
                onChange={e => setObs(e.target.value)}
                placeholder="RAS — Vacation déroulée normalement. Aucun incident signalé."
                rows={4}
                className="resize-none rounded-xl px-3 py-2.5 text-[11px] font-medium leading-relaxed outline-none transition-all duration-150"
                style={{
                  background:"rgba(167,139,250,0.05)",
                  border:"1px solid rgba(167,139,250,0.2)",
                  color:"rgba(241,245,249,0.85)",
                  caretColor: C.violet,
                }}
                onFocus={e => { (e.target as HTMLTextAreaElement).style.border = `1px solid rgba(167,139,250,0.5)`; }}
                onBlur={e  => { (e.target as HTMLTextAreaElement).style.border = `1px solid rgba(167,139,250,0.2)`; }}
              />
            </div>

            {/* Note qualité */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.25em]"
                style={{ color:"rgba(167,139,250,0.5)" }}>
                Évaluation de la vacation
              </span>
              <div className="flex gap-2">
                {["😤 Difficile","😐 Normale","😊 Fluide","🌟 Excellente"].map((q, i) => (
                  <button key={i}
                    className="flex-1 py-2 rounded-xl text-[9px] font-bold transition-all duration-150"
                    style={{ background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.15)", color:"rgba(148,163,184,0.6)" }}
                    onMouseEnter={e => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = "rgba(167,139,250,0.1)";
                      b.style.color = C.violet;
                    }}
                    onMouseLeave={e => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = "rgba(167,139,250,0.05)";
                      b.style.color = "rgba(148,163,184,0.6)";
                    }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA TERMINER */}
            <button
              onClick={() => {
                setSending(true);
                setTimeout(() => { setSending(false); onTerminer(obs); }, 1500);
              }}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-200 active:scale-[0.97] disabled:opacity-70"
              style={{
                background:"linear-gradient(135deg, #004e9a, #0077cc, #00a8e8)",
                color:"#fff",
                border:"1px solid rgba(0,209,255,0.4)",
                boxShadow:"0 0 28px rgba(0,119,204,0.4)",
              }}>
              {sending ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Envoi en cours…
                </>
              ) : (
                <><Send size={14} /> TERMINER &amp; ENVOYER RAPPORT</>
              )}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH — SESSION HELPERS
// ══════════════════════════════════════════════════════════════════════════════

const LIAISON_CODE      = "724839";          // Code Société 6 chiffres affiché sur le Dashboard
const SESSION_DURATION  = 8 * 60 * 60 * 1000; // 8 h (une vacation)
const SESSION_KEY       = "sp_auth_session";

interface AuthSession {
  email:       string;   // email Supabase — lie la session à cet utilisateur
  identifiant: string;
  expiry:      number;
}

/** Vérifie que la session est valide ET appartient à l'email courant */
function isSessionValid(currentEmail: string): boolean {
  if (typeof window === "undefined" || !currentEmail) return false;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const sess = JSON.parse(raw) as AuthSession;
    // Expirée ?
    if (Date.now() >= sess.expiry) { localStorage.removeItem(SESSION_KEY); return false; }
    // Email différent → fuite de session → on purge
    if (sess.email.toLowerCase() !== currentEmail.toLowerCase()) {
      clearSession();
      return false;
    }
    return true;
  } catch { return false; }
}

function saveSession(email: string, identifiant: string) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      email,
      identifiant,
      expiry: Date.now() + SESSION_DURATION,
    } satisfies AuthSession));
  } catch {}
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch { return null; }
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH — COMPOSANTS
// ══════════════════════════════════════════════════════════════════════════════

type AuthStep = "idle" | "scanning" | "success" | "error";

function FingerprintIcon({ step }: { step: AuthStep }) {
  const color =
    step === "success" ? C.green :
    step === "error"   ? C.red   : C.cyan;

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      {/* Anneaux de pulse externes */}
      {(step === "scanning" || step === "success") && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ border:`1px solid ${color}28`, animationDuration:"1.2s" }} />
          <div className="absolute -inset-4 rounded-full animate-ping"
            style={{ border:`1px solid ${color}14`, animationDuration:"1.8s", animationDelay:"0.4s" }} />
        </>
      )}

      {/* Cercle principal */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
        style={{
          background: `${color}08`,
          border: `1.5px solid ${color}${step === "idle" ? "22" : "45"}`,
          boxShadow: step !== "idle" ? `0 0 32px ${color}30, inset 0 0 16px ${color}08` : "none",
          transition: "all 500ms ease",
        }}>

        {/* Ligne de scan horizontale */}
        {step === "scanning" && (
          <div className="scanline absolute inset-x-0 h-0.5 top-0 z-20 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}, ${color}, transparent)`,
              boxShadow: `0 0 10px ${color}, 0 0 4px ${color}`,
            }} />
        )}

        {/* SVG empreinte digitale */}
        <svg width="52" height="52" viewBox="0 0 100 110" fill="none"
          style={{
            color,
            filter: step !== "idle" ? `drop-shadow(0 0 7px ${color})` : "none",
            opacity: step === "idle" ? 0.45 : 1,
            transition: "all 400ms ease",
          }}>

          {/* Arcs concentriques — empreinte */}
          <path d="M50 12 C26 12 8 30 8 54 C8 74 18 88 32 96" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M50 12 C74 12 92 30 92 54 C92 74 82 88 68 96" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M32 28 C32 21 40 16 50 16 C60 16 68 21 68 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>

          <path d="M22 45 C22 27 34 18 50 18 C66 18 78 27 78 45 C78 63 68 76 58 83" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <path d="M30 50 C30 35 38 26 50 26 C62 26 70 35 70 50 C70 63 63 73 55 79" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <path d="M38 54 C38 42 43 36 50 36 C57 36 62 42 62 54 C62 63 58 69 52 73" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M46 58 C46 50 47 45 50 45 C53 45 54 49 54 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>

          {/* Coche succès */}
          {step === "success" && (
            <path d="M26 54 L42 70 L74 38" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          )}
        </svg>
      </div>
    </div>
  );
}

function AuthInput({
  label, placeholder, value, onChange, disabled, icon, mono = false, onEnter,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; disabled: boolean;
  icon: React.ReactNode; mono?: boolean; onEnter: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[8px] font-black uppercase tracking-[0.35em]"
        style={{ color:"rgba(0,209,255,0.4)" }}>
        {label}
      </label>
      <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-all duration-200"
        style={{ background:"rgba(0,209,255,0.04)", border:"1px solid rgba(0,209,255,0.14)" }}
        onFocusCapture={e => { (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(0,209,255,0.35)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(0,209,255,0.07)"; }}
        onBlurCapture={e => { (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(0,209,255,0.14)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(0,209,255,0.04)"; }}>
        {icon}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoCapitalize="none"
          className="flex-1 bg-transparent outline-none text-[13px] font-semibold disabled:opacity-40"
          style={{
            color:"#f1f5f9",
            caretColor: C.cyan,
            fontFamily: mono ? "var(--font-geist-mono), monospace" : undefined,
          }}
          onKeyDown={e => { if (e.key === "Enter" && !disabled) onEnter(); }}
        />
      </div>
    </div>
  );
}

function LockScreen({ userEmail, onUnlock }: { userEmail: string; onUnlock: () => void }) {
  const [identifiant, setIdentifiant] = useState("");
  const [code,        setCode]        = useState("");
  const [step,        setStep]        = useState<AuthStep>("idle");
  const [errMsg,      setErrMsg]      = useState("");

  const handleConnect = useCallback(() => {
    if (!identifiant.trim()) {
      setErrMsg("Veuillez saisir votre Identifiant Agent.");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setErrMsg("Le Code Société doit contenir exactement 6 chiffres.");
      return;
    }
    if (code.trim() !== LIAISON_CODE) {
      setErrMsg("Code Société invalide. Consultez votre responsable opérationnel.");
      setStep("error");
      setTimeout(() => setStep("idle"), 2200);
      return;
    }
    setErrMsg("");
    setStep("scanning");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        saveSession(userEmail, identifiant.trim());
        onUnlock();
      }, 900);
    }, 2400);
  }, [identifiant, code, userEmail, onUnlock]);

  const accentColor =
    step === "success" ? C.green :
    step === "error"   ? C.red   : C.cyan;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 160% 70% at 50% -10%, rgba(0,40,110,0.55) 0%, #050D1E 55%)",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        color: "#f1f5f9",
      }}>

      {/* Grille */}
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,209,255,0.018) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,209,255,0.018) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      {/* Orbe lumineux haut */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-96 h-48"
        style={{ background:"radial-gradient(ellipse, rgba(0,100,255,0.18), transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">

        {/* Branding */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background:"rgba(0,209,255,0.06)",
              border:"1px solid rgba(0,209,255,0.2)",
              boxShadow:"0 0 40px rgba(0,120,255,0.2)",
            }}>
            <Image src="/secupro-logo-official.png" alt="SecuPRO" width={36} height={36}
              style={{ filter:"drop-shadow(0 0 8px rgba(0,209,255,0.6))" }} />
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.5em]"
            style={{ color:"rgba(0,209,255,0.4)" }}>
            Zone Sécurisée · Accès Restreint
          </p>
          <h1 className="text-[22px] font-black text-white leading-none">Espace PRO</h1>
        </div>

        {/* Scanneur empreinte */}
        <FingerprintIcon step={step} />

        {/* Texte de statut sous l'empreinte */}
        <p className="text-[9px] font-black uppercase tracking-[0.35em] -mt-2 h-4"
          style={{
            color: step === "scanning" ? C.cyan :
                   step === "success"  ? C.green :
                   step === "error"    ? C.red : "rgba(148,163,184,0.3)",
            transition: "color 300ms ease",
          }}>
          {step === "idle"     && "En attente d'authentification"}
          {step === "scanning" && "Analyse en cours…"}
          {step === "success"  && "Identité confirmée ✓"}
          {step === "error"    && "Code refusé — Accès bloqué"}
        </p>

        {/* Formulaire */}
        <div className="w-full rounded-2xl overflow-hidden"
          style={{
            background:"rgba(10,20,44,0.92)",
            backdropFilter:"blur(28px)",
            border:`1px solid ${accentColor}${step === "idle" ? "14" : "35"}`,
            boxShadow:`0 0 60px rgba(0,0,0,0.5), 0 0 ${step !== "idle" ? "40px" : "0px"} ${accentColor}12`,
            transition:"border 400ms ease, box-shadow 400ms ease",
          }}>
          <div className="p-5 flex flex-col gap-4">

            <AuthInput
              label="Identifiant Agent"
              placeholder="SP-2026-XXXX"
              value={identifiant}
              onChange={setIdentifiant}
              disabled={step === "scanning" || step === "success"}
              icon={<Shield size={13} style={{ color: C.cyan }} />}
              onEnter={handleConnect}
            />

            <AuthInput
              label="Code Société (6 chiffres)"
              placeholder="• • • • • •"
              value={code}
              onChange={v => setCode(v.replace(/\D/g, "").slice(0, 6))}
              disabled={step === "scanning" || step === "success"}
              icon={<Zap size={13} style={{ color: C.cyan }} />}
              mono
              onEnter={handleConnect}
            />

            {errMsg && (
              <p className="text-[10px] font-bold text-center leading-snug"
                style={{ color:"rgba(248,113,113,0.85)" }}>
                {errMsg}
              </p>
            )}

            <button
              id="connect-btn"
              onClick={handleConnect}
              disabled={step === "scanning" || step === "success"}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.97] disabled:opacity-60"
              style={{
                background: step === "success"
                  ? "linear-gradient(135deg, #005c3f, #00cc88, #00FFCC)"
                  : "linear-gradient(135deg, #003878, #0066cc, #00a0e8)",
                color:"#fff",
                border:`1px solid ${step === "success" ? "rgba(0,255,204,0.45)" : "rgba(0,209,255,0.35)"}`,
                boxShadow: step === "success"
                  ? "0 0 36px rgba(0,255,204,0.4), 0 4px 20px rgba(0,0,0,0.4)"
                  : "0 0 28px rgba(0,119,204,0.35), 0 4px 20px rgba(0,0,0,0.4)",
                textShadow:"0 1px 3px rgba(0,0,0,0.3)",
              }}>
              {step === "scanning" ? (
                <>
                  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Analyse biométrique…
                </>
              ) : step === "success" ? (
                <><CheckCircle2 size={14} /> Accès autorisé</>
              ) : (
                <><Shield size={14} /> ÉTABLIR LA CONNEXION SÉCURISÉE</>
              )}
            </button>
          </div>
        </div>

        <p className="text-[7px] text-center font-semibold tracking-[0.18em]"
          style={{ color:"rgba(148,163,184,0.2)" }}>
          CONNEXION CHIFFRÉE · SESSION 8H · USAGE EXCLUSIF AGENTS ACCRÉDITÉS
        </p>
      </div>

      <style>{`
        @keyframes scanline-anim {
          0%   { top: -4px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scanline { position: absolute; animation: scanline-anim 2.4s linear infinite; }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════

export default function EspaceProPage() {
  const router = useRouter();

  // ══════════════════════════════════════════════════════════════
  // TOUS LES HOOKS EN HAUT — règle absolue React
  // ══════════════════════════════════════════════════════════════

  // ── Auth ──────────────────────────────────────────────────────
  const [userEmail,     setUserEmail]     = useState<string>("");
  const [emailReady,    setEmailReady]    = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  // ── Cockpit ───────────────────────────────────────────────────
  const [tab,   setTab]   = useState<Tab>("accueil");
  const [phase, setPhase] = useState<Phase>("veille");
  const [alert, setAlert] = useState<AlertData | null>(null);

  // ── Charge l'email Supabase + valide session ──────────────────
  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data }) => {
        const email = data?.user?.email ?? "";
        setUserEmail(email);
        setAuthenticated(isSessionValid(email));
        setEmailReady(true);
      })
      .catch(() => {
        setUserEmail("");
        setAuthenticated(false);
        setEmailReady(true);
      });
  }, []);

  // ── Écoute changement de compte Supabase ─────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newEmail = session?.user?.email ?? "";
      setUserEmail(newEmail);
      if (!isSessionValid(newEmail)) {
        clearSession();
        setAuthenticated(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Alerte déjà présente au montage ──────────────────────────
  useEffect(() => {
    if (!authenticated) return;
    try {
      const raw = localStorage.getItem("sp_alert");
      if (raw) {
        const data: AlertData = JSON.parse(raw);
        setAlert(data);
        setPhase("alerte");
        setTab("intervention");
      }
    } catch {}
  }, [authenticated]);

  // ── Écoute nouvelles alertes (StorageEvent cross-tab) ─────────
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "sp_alert") return;
      if (!e.newValue) { setAlert(null); return; }
      try {
        const data: AlertData = JSON.parse(e.newValue);
        setAlert(data);
        setPhase("alerte");
        setTab("intervention");
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ── Callbacks ────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    clearSession();
    setAuthenticated(false);
    setPhase("veille");
    setTab("accueil");
    setAlert(null);
  }, []);

  const handleAccept = useCallback(() => {
    setPhase("mission");
    setTab("rapport");
  }, []);

  const handleRefuse = useCallback(() => {
    setPhase("veille");
    setAlert(null);
    try { localStorage.removeItem("sp_alert"); } catch {}
  }, []);

  const handleTerminer = useCallback((_obs: string) => {
    setPhase("termine");
    try { localStorage.removeItem("sp_alert"); } catch {}
  }, []);

  const handleReset = useCallback(() => {
    setPhase("veille");
    setAlert(null);
    setTab("accueil");
  }, []);

  // ══════════════════════════════════════════════════════════════
  // RENDU CONDITIONNEL — après tous les hooks, jamais avant
  // ══════════════════════════════════════════════════════════════

  // Attente résolution email (spinner discret)
  if (!emailReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background:"#050D1E" }}>
        <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24"
          fill="none" stroke="rgba(0,209,255,0.4)" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
    );
  }

  // Pas connecté → lock screen
  if (!authenticated) {
    return <LockScreen userEmail={userEmail} onUnlock={() => setAuthenticated(true)} />;
  }

  // ── Dérivé ───────────────────────────────────────────────────
  const hasAlert = phase === "alerte";

  return (
    <div className="min-h-screen flex flex-col"
      style={{
        background: phase === "alerte"
          ? "radial-gradient(ellipse 120% 50% at 50% 0%, rgba(255,100,0,0.25) 0%, #0B1426 55%)"
          : "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(0,35,90,0.38) 0%, #0B1426 50%)",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        color: "#f1f5f9",
        transition: "background 600ms ease",
      }}>

      {/* Grille de fond */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,209,255,0.015) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,209,255,0.015) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 100% 70% at 50% 0%, black, transparent 70%)",
        }} />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: phase === "alerte" ? "rgba(30,10,0,0.93)" : "rgba(11,20,38,0.93)",
          backdropFilter: "blur(18px)",
          borderBottom: `1px solid ${phase === "alerte" ? "rgba(255,140,0,0.2)" : "rgba(0,209,255,0.09)"}`,
          transition: "all 500ms ease",
        }}>

        <button onClick={() => router.push("/agent/hub")}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] transition-colors duration-150"
          style={{ color:"rgba(148,163,184,0.5)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.cyan; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.5)"; }}>
          <ArrowLeft size={11} /> Hub
        </button>

        <div className="flex items-center gap-2">
          <Image src="/secupro-logo-official.png" alt="SecuPRO" width={22} height={22}
            style={{ filter:`drop-shadow(0 0 6px ${phase === "alerte" ? "rgba(255,140,0,0.5)" : "rgba(0,209,255,0.4)"})`}} />
          <div>
            <p className="text-[7px] font-black uppercase tracking-[0.4em]"
              style={{ color: phase === "alerte" ? "rgba(255,140,0,0.55)" : "rgba(0,209,255,0.4)" }}>
              SecuPRO Agent
            </p>
            <p className="text-[11px] font-black leading-none text-white">
              {AGENT.prenom} {AGENT.nom}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {phase === "alerte" ? (
            <NeonBadge label="ALERTE" color={C.orange} pulse />
          ) : phase === "mission" ? (
            <NeonBadge label="En mission" color={C.green} pulse />
          ) : phase === "termine" ? (
            <NeonBadge label="Terminé" color={C.green} />
          ) : (
            <NeonBadge label="En poste" color={C.green} pulse />
          )}

          {/* Bouton DÉCONNEXION */}
          <button
            onClick={handleLogout}
            title="Se déconnecter de l'Espace PRO"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-150"
            style={{
              background:"rgba(248,113,113,0.06)",
              border:"1px solid rgba(248,113,113,0.18)",
              color:"rgba(248,113,113,0.5)",
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.color = "#f87171";
              b.style.background = "rgba(248,113,113,0.12)";
              b.style.borderColor = "rgba(248,113,113,0.4)";
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.color = "rgba(248,113,113,0.5)";
              b.style.background = "rgba(248,113,113,0.06)";
              b.style.borderColor = "rgba(248,113,113,0.18)";
            }}>
            <LogOut size={11} />
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">Sortir</span>
          </button>
        </div>
      </header>

      {/* ── CONTENU ── */}
      <main className="flex-1 px-4 pt-4 pb-24 max-w-lg mx-auto w-full">
        {tab === "accueil"      && <TabAccueil alert={alert} />}
        {tab === "intervention" && (
          <TabIntervention phase={phase} alert={alert}
            onAccept={handleAccept} onRefuse={handleRefuse} />
        )}
        {tab === "rapport"      && (
          <TabRapport phase={phase} alert={alert}
            onTerminer={handleTerminer} onReset={handleReset} />
        )}
      </main>

      {/* ── NAV BAS — style mobile tactique ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-end pb-safe"
        style={{
          background: phase === "alerte" ? "rgba(20,8,0,0.97)" : "rgba(11,20,38,0.97)",
          backdropFilter: "blur(24px)",
          borderTop: `1px solid ${phase === "alerte" ? "rgba(255,140,0,0.15)" : "rgba(0,209,255,0.09)"}`,
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
          paddingTop: "8px",
        }}>
        {(
          [
            { id:"accueil",      label:"Accueil",       Icon: Shield   },
            { id:"intervention", label:"Intervention",  Icon: AlertTriangle },
            { id:"rapport",      label:"Rapport",       Icon: FileText },
          ] as { id: Tab; label: string; Icon: React.ElementType }[]
        ).map(({ id, label, Icon }) => {
          const active = tab === id;
          const accent =
            id === "intervention" && hasAlert ? C.orange :
            id === "rapport" && phase === "mission" ? C.violet :
            C.cyan;
          return (
            <button key={id}
              onClick={() => setTab(id)}
              className="relative flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-200"
              style={{
                color: active ? accent : "rgba(148,163,184,0.4)",
                background: active ? `${accent}0e` : "transparent",
              }}>
              {/* Indicateur alerte */}
              {id === "intervention" && hasAlert && (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full animate-ping"
                  style={{ background: C.orange }} />
              )}
              {id === "intervention" && hasAlert && (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full"
                  style={{ background: C.orange }} />
              )}
              <Icon size={20} style={{ filter: active ? `drop-shadow(0 0 6px ${accent})` : "none" }} />
              <span className="text-[8px] font-black uppercase tracking-[0.18em]">{label}</span>
              {active && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: accent, boxShadow:`0 0 6px ${accent}` }} />
              )}
            </button>
          );
        })}
      </nav>

      <style>{`
        .alerte-bar { animation: alerteShift 1.5s ease-in-out infinite alternate; }
        @keyframes alerteShift {
          from { opacity: 0.7; }
          to   { opacity: 1; box-shadow: 0 0 12px rgba(255,140,0,0.8); }
        }
        @media (max-width: 480px) {
          main { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>
    </div>
  );
}
