import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { RapportData } from "@/services/rapportMensuelService";

const CYAN = "#00d1ff";
const NAVY = "#0B1426";
const NAVY_ALT = "#0d1a2e";
const TEXT_DARK = "#1a1a2e";
const WHITE = "#ffffff";

function formatMois(mois: string): string {
  const [year, month] = mois.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function generateRapportPDF(data: RapportData): string {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const headerHeight = 28;
  const margin = 15;

  doc.setFillColor(CYAN);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(WHITE);
  doc.text("SECUPRO", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Rapport Mensuel d'Activité", margin, 20);

  const moisLabel = formatMois(data.mois);
  const headerRight = `${data.societeName} — ${moisLabel.charAt(0).toUpperCase() + moisLabel.slice(1)}`;
  doc.setFontSize(10);
  doc.text(headerRight, pageWidth - margin, 12, { align: "right" });

  const tableBody: [string, string][] = [
    ["Agents actifs", `${data.agentsActifs} agent${data.agentsActifs !== 1 ? "s" : ""}`],
    ["Heures travaillées", `${data.heuresTravaillees} h`],
    ["Missions réalisées", `${data.missionsRealisees} mission${data.missionsRealisees !== 1 ? "s" : ""}`],
    ["Incidents signalés", `${data.incidentsSignales}`],
    ["Taux de présence", `${data.tauxPresence}%`],
  ];

  autoTable(doc, {
    startY: headerHeight + 10,
    head: [["Indicateur", "Valeur"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: CYAN,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 11,
    },
    alternateRowStyles: {
      fillColor: NAVY_ALT,
    },
    bodyStyles: {
      textColor: TEXT_DARK,
      fontSize: 10,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 90 },
      1: { cellWidth: "auto" },
    },
    tableLineColor: CYAN,
    tableLineWidth: 0.2,
  });

  const totalPages: number = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(CYAN);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(NAVY);
    doc.text(
      `Généré par SecuPRO — secupro.app     |     ${dateStr}`,
      pageWidth / 2,
      pageHeight - 9,
      { align: "center" }
    );

    doc.text(`${i} / ${totalPages}`, pageWidth - margin, pageHeight - 9, {
      align: "right",
    });
  }

  return doc.output("datauristring");
}
