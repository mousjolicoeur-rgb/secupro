"use client";
import { useState, useCallback, useRef } from "react";
import { Bot, Zap, CheckCircle2, ScanLine, Phone, AlertTriangle } from "lucide-react";

type AgentStatus = string;
interface Agent    { id: string; prenom: string; nom: string; tel: string; status: AgentStatus; site?: string }
interface Anomalie { id: string; site: string; nom: string; prenom: string; tel: string; motif: string }
interface IASuggestion {
  anomalieId: string;
  agentDisponible: Agent;
  site: string;
  agentAbsent: string;
  raison: string;
}

interface Props {
  suggestion:   IASuggestion | null;
  anomalies:    Anomalie[];
  onResolve:    (anomalieId: string, agentId: string, site: string) => void;
  onCall:       (name: string, tel: string) => void;
  onScanClick:  () => void;
}

export function AIPanel({ suggestion, anomalies, onResolve, onCall, onScanClick }: Props) {
  const [phase, setPhase] = useState<"idle"|"confirming"|"done">("idle");
  const trackedId = suggestion?.anomalieId;
  const prevId    = useRef(trackedId);
  if (trackedId !== prevId.current) { prevId.current = trackedId; setPhase("idle"); }

  const handleTransfert = useCallback(() => {
    if (!suggestion) return;
    setPhase("confirming");
    setTimeout(() => {
      onResolve(suggestion.anomalieId, suggestion.agentDisponible.id, suggestion.site);
      setPhase("done");
    }, 900);
  }, [suggestion, onResolve]);

  const resolved  = phase === "done";
  const noAnomaly = suggestion === null;
  const isBusy    = phase === "confirming";

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full"
      style={{
        background:"rgba(10,20,44,0.88)",
        border:"1px solid rgba(129,140,248,0.15)",
        backdropFilter:"blur(16px)",
        boxShadow:"0 0 40px rgba(129,140,248,0.06)",
      }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom:"1px solid rgba(129,140,248,0.1)" }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full"
            style={{ background:"linear-gradient(180deg, #818cf8, #a78bfa)" }} />
          <span className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color:"#f1f5f9" }}>
            SecuAI
          </span>
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full"
            style={{ background:"rgba(0,255,204,0.08)", border:"1px solid rgba(0,255,204,0.2)", color:"#00FFCC" }}>
            ACTIF
          </span>
        </div>

        <button onClick={onScanClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-150"
          style={{ background:"rgba(129,140,248,0.08)", border:"1px solid rgba(129,140,248,0.25)", color:"#818cf8" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(129,140,248,0.15)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(129,140,248,0.08)"; }}>
          <ScanLine size={9} /> Scanner IA
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto">

        {/* Bulle IA */}
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
          style={{ background:"rgba(129,140,248,0.06)", border:"1px solid rgba(129,140,248,0.14)" }}>
          <Bot size={12} className="mt-0.5 shrink-0" style={{ color:"#818cf8" }} />
          <p className="text-[10px] leading-relaxed" style={{ color:"rgba(148,163,184,0.7)" }}>
            {isBusy
              ? "Transfert en cours · Notification envoyée à l'agent…"
              : resolved || noAnomaly
              ? "Analyse complète · Tous les postes couverts · Aucune intervention requise."
              : `Analyse en cours · ${anomalies.length} anomalie${anomalies.length > 1 ? "s" : ""} détectée${anomalies.length > 1 ? "s" : ""} · Solution identifiée.`}
          </p>
        </div>

        {/* État nominal */}
        {(resolved || noAnomaly) && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{ background:"rgba(0,255,204,0.06)", border:"1px solid rgba(0,255,204,0.2)" }}>
            <CheckCircle2 size={14} style={{ color:"#00FFCC" }} />
            <span className="text-[11px] font-semibold" style={{ color:"#00FFCC" }}>
              {resolved && suggestion
                ? `Transfert confirmé · ${suggestion.agentDisponible.prenom} ${suggestion.agentDisponible.nom} est en poste.`
                : "Effectifs nominaux · Aucune action requise"}
            </span>
          </div>
        )}

        {/* Anomalie active */}
        {!noAnomaly && !resolved && suggestion && (
          <div className="flex flex-col gap-3 rounded-xl p-4"
            style={{ background:"rgba(129,140,248,0.05)", border:"1px solid rgba(129,140,248,0.18)" }}>

            {/* Anomalie */}
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.35em] mb-1"
                style={{ color:"rgba(248,113,113,0.6)" }}>
                <AlertTriangle size={9} className="inline mr-1" />
                Situation détectée — {suggestion.site}
              </p>
              <p className="text-[12px] font-semibold" style={{ color:"rgba(248,113,113,0.85)" }}>
                {suggestion.agentAbsent} — absent / en retard
              </p>
            </div>

            <div className="h-px" style={{ background:"rgba(129,140,248,0.12)" }} />

            {/* Solution IA */}
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.32em] mb-1"
                style={{ color:"rgba(0,255,204,0.55)" }}>
                Solution IA
              </p>
              <p className="text-[11px] leading-snug" style={{ color:"rgba(241,245,249,0.85)" }}>
                {suggestion.raison}
              </p>
            </div>

            {/* Agent dispo */}
            <div className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{ background:"rgba(0,255,204,0.05)", border:"1px solid rgba(0,255,204,0.15)" }}>
              <div className="flex items-center gap-2">
                <Zap size={11} style={{ color:"#00FFCC" }} />
                <span className="text-[12px] font-black" style={{ color:"#00FFCC" }}>
                  {suggestion.agentDisponible.prenom} {suggestion.agentDisponible.nom}
                </span>
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background:"rgba(0,255,204,0.1)", color:"rgba(0,255,204,0.8)", border:"1px solid rgba(0,255,204,0.2)" }}>
                  Disponible
                </span>
              </div>
              <button
                onClick={() => onCall(`${suggestion.agentDisponible.prenom} ${suggestion.agentDisponible.nom}`, suggestion.agentDisponible.tel)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-mono transition-all duration-150"
                style={{ color:"#00d1ff", background:"rgba(0,209,255,0.06)", border:"1px solid rgba(0,209,255,0.15)" }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color="#00FFCC"; b.style.borderColor="rgba(0,255,204,0.3)"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color="#00d1ff"; b.style.borderColor="rgba(0,209,255,0.15)"; }}>
                <Phone size={8} /> {suggestion.agentDisponible.tel}
              </button>
            </div>

            {/* CTA */}
            <div className="flex gap-2">
              <button
                onClick={handleTransfert}
                disabled={isBusy}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
                style={{
                  background:"linear-gradient(135deg, #005c3f, #00cc88, #00FFCC)",
                  color:"#0B1426",
                  border:"1px solid rgba(0,255,204,0.4)",
                  boxShadow:"0 0 24px rgba(0,255,204,0.3)",
                  fontWeight:900,
                }}>
                {isBusy ? (
                  <><svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Transfert…</>
                ) : (
                  <><Zap size={11} /> OUI, TRANSFÉRER</>
                )}
              </button>
              <button
                onClick={() => { if (suggestion) onResolve(suggestion.anomalieId, "", ""); setPhase("done"); }}
                className="px-3 py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.15em] transition-all duration-150"
                style={{ color:"rgba(248,113,113,0.4)", border:"1px solid rgba(248,113,113,0.1)" }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color="#f87171"; b.style.borderColor="rgba(248,113,113,0.3)"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color="rgba(248,113,113,0.4)"; b.style.borderColor="rgba(248,113,113,0.1)"; }}>
                Ignorer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
