"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { generateRapportPDF } from "@/lib/generateRapportPDF";
import type { RapportData } from "@/services/rapportMensuelService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoutonRapportMensuelProps {
  societeId: string;
  societeName: string;
  donneurOrdreEmail?: string | null;
}

type Etat = "idle" | "loading" | "ready" | "sending" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMoisPrecedent(): string {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
}

function formatMoisLabel(mois: string): string {
  const [year, month] = mois.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const label = date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

type PerfRow = {
  agent_id: string;
  heures_travaillees: number | null;
  missions_effectuees: number | null;
  ponctualite: number | null;
};

type AgentRow = {
  id: string;
  statut: string;
};

async function fetchRapportData(
  societeId: string,
  mois: string,
  societeName: string
): Promise<RapportData> {
  const { data: agentsData, error: agentsError } = await supabase
    .from("agents")
    .select("id, statut")
    .eq("societe_id", societeId)
    .eq("statut", "actif")
    .returns<AgentRow[]>();

  if (agentsError) {
    throw new Error(`Erreur agents : ${agentsError.message}`);
  }

  const agents = agentsData ?? [];
  const agentIds = agents.map((a) => a.id);

  const monthStart = `${mois}-01`;
  const [year, month] = mois.split("-").map(Number);
  const nextMonth =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  let heuresTravaillees = 0;
  let missionsRealisees = 0;
  let tauxPresence = 0;

  if (agentIds.length > 0) {
    const { data: perfRows, error: perfError } = await supabase
      .from("performances")
      .select(
        "agent_id, heures_travaillees, missions_effectuees, ponctualite"
      )
      .in("agent_id", agentIds)
      .gte("mois", monthStart)
      .lt("mois", nextMonth)
      .returns<PerfRow[]>();

    if (perfError) {
      throw new Error(`Erreur performances : ${perfError.message}`);
    }

    const rows = perfRows ?? [];

    heuresTravaillees = rows.reduce(
      (sum, r) => sum + (r.heures_travaillees ?? 0),
      0
    );
    missionsRealisees = rows.reduce(
      (sum, r) => sum + (r.missions_effectuees ?? 0),
      0
    );

    if (rows.length > 0) {
      const totalPonctualite = rows.reduce(
        (sum, r) => sum + (r.ponctualite ?? 0),
        0
      );
      tauxPresence = Math.round(totalPonctualite / rows.length);
    }
  }

  return {
    societeId,
    mois,
    agentsActifs: agents.length,
    heuresTravaillees: Math.round(heuresTravaillees * 100) / 100,
    missionsRealisees,
    incidentsSignales: 0,
    tauxPresence,
    societeName,
    donneurOrdreEmail: null,
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "rgba(0,209,255,0.05)",
  border: "1px solid rgba(0,209,255,0.15)",
  borderRadius: 12,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#00d1ff",
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
};

const subheadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "rgba(241,245,249,0.65)",
};

const btnPrimaryStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: "#00d1ff",
  color: "#0B1426",
  fontWeight: 700,
  fontSize: 14,
  border: "none",
  borderRadius: 8,
  padding: "10px 20px",
  cursor: "pointer",
  width: "100%",
};

const btnSecondaryStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: "transparent",
  color: "#00d1ff",
  fontWeight: 600,
  fontSize: 14,
  border: "1px solid rgba(0,209,255,0.50)",
  borderRadius: 8,
  padding: "10px 20px",
  cursor: "pointer",
  flex: 1,
};

const btnDisabledStyle: React.CSSProperties = {
  opacity: 0.55,
  cursor: "not-allowed",
};

const errorStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#ff6b6b",
  background: "rgba(255,107,107,0.08)",
  border: "1px solid rgba(255,107,107,0.25)",
  borderRadius: 8,
  padding: "10px 14px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "rgba(0,209,255,0.06)",
  border: "1px solid rgba(0,209,255,0.25)",
  borderRadius: 8,
  padding: "9px 13px",
  color: "#f1f5f9",
  fontSize: 14,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(241,245,249,0.55)",
  marginBottom: 4,
  display: "block",
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner(): React.ReactElement {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        border: "2px solid rgba(11,20,38,0.3)",
        borderTopColor: "#0B1426",
        borderRadius: "50%",
        animation: "secupro-spin 0.7s linear infinite",
      }}
    />
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function BoutonRapportMensuel({
  societeId,
  societeName,
  donneurOrdreEmail,
}: BoutonRapportMensuelProps): React.ReactElement {
  const mois = getMoisPrecedent();
  const moisLabel = formatMoisLabel(mois);

  const [etat, setEtat] = useState<Etat>("idle");
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [erreurMessage, setErreurMessage] = useState<string>("");
  const [emailSaisi, setEmailSaisi] = useState<string>("");
  const [emailEnvoye, setEmailEnvoye] = useState<boolean>(false);

  const handleGenerer = useCallback(async (): Promise<void> => {
    setEtat("loading");
    setErreurMessage("");
    setPdfDataUri(null);
    setEmailEnvoye(false);

    try {
      const data = await fetchRapportData(societeId, mois, societeName);
      const uri = generateRapportPDF(data);
      setPdfDataUri(uri);
      setEtat("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur inconnue lors de la génération.";
      setErreurMessage(message);
      setEtat("error");
    }
  }, [societeId, mois, societeName]);

  const handleTelecharger = useCallback((): void => {
    if (!pdfDataUri) return;
    const link = document.createElement("a");
    link.href = pdfDataUri;
    link.download = `rapport-${societeName}-${mois}.pdf`;
    link.click();
  }, [pdfDataUri, societeName, mois]);

  const handleEnvoyer = useCallback(async (): Promise<void> => {
    if (!pdfDataUri) return;

    const dest = donneurOrdreEmail ?? emailSaisi.trim();
    if (!dest) {
      setErreurMessage("Veuillez saisir l'adresse email du destinataire.");
      return;
    }

    setEtat("sending");
    setErreurMessage("");

    try {
      const res = await fetch("/api/rapport/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfBase64: pdfDataUri,
          destinataire: dest,
          mois,
          societeName,
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? `Erreur HTTP ${res.status}`);
      }

      setEmailEnvoye(true);
      setEtat("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'envoi email.";
      setErreurMessage(message);
      setEtat("ready");
    }
  }, [pdfDataUri, donneurOrdreEmail, emailSaisi, mois, societeName]);

  return (
    <>
      <style>{`@keyframes secupro-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={cardStyle}>
        <div>
          <p style={headingStyle}>Rapport Mensuel</p>
          <p style={subheadingStyle}>
            {societeName} — {moisLabel}
          </p>
        </div>

        {etat === "idle" && (
          <button style={btnPrimaryStyle} onClick={() => void handleGenerer()}>
            Générer rapport mensuel
          </button>
        )}

        {etat === "loading" && (
          <button style={{ ...btnPrimaryStyle, ...btnDisabledStyle }} disabled>
            <Spinner />
            Génération en cours...
          </button>
        )}

        {etat === "ready" && pdfDataUri && (
          <>
            {!donneurOrdreEmail && (
              <div>
                <label htmlFor="rapport-email" style={labelStyle}>
                  Email destinataire
                </label>
                <input
                  id="rapport-email"
                  type="email"
                  value={emailSaisi}
                  onChange={(e) => setEmailSaisi(e.target.value)}
                  placeholder="ex : direction@societe.fr"
                  style={inputStyle}
                />
              </div>
            )}

            {emailEnvoye && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#00d1ff",
                  background: "rgba(0,209,255,0.07)",
                  border: "1px solid rgba(0,209,255,0.20)",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                Email envoyé avec succès.
              </p>
            )}

            {erreurMessage && (
              <p style={errorStyle}>{erreurMessage}</p>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
              <button style={btnSecondaryStyle} onClick={handleTelecharger}>
                Télécharger PDF
              </button>
              <button
                style={btnSecondaryStyle}
                onClick={() => void handleEnvoyer()}
              >
                Envoyer par email
              </button>
            </div>

            <button
              style={{
                background: "none",
                border: "none",
                color: "rgba(241,245,249,0.40)",
                fontSize: 12,
                cursor: "pointer",
                textAlign: "left" as const,
                padding: 0,
              }}
              onClick={() => {
                setEtat("idle");
                setPdfDataUri(null);
                setEmailEnvoye(false);
                setErreurMessage("");
              }}
            >
              Générer à nouveau
            </button>
          </>
        )}

        {etat === "sending" && (
          <button style={{ ...btnPrimaryStyle, ...btnDisabledStyle }} disabled>
            <Spinner />
            Envoi en cours...
          </button>
        )}

        {etat === "error" && (
          <>
            <p style={errorStyle}>{erreurMessage}</p>
            <button style={btnPrimaryStyle} onClick={() => void handleGenerer()}>
              Réessayer
            </button>
          </>
        )}
      </div>
    </>
  );
}
