import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createComplianceClient } from "@/lib/supabase/compliance-client";
import { getServerUser } from "@/lib/supabase/server-session";

interface AnalysisResult {
  score: number;
  risques: string[];
  actions: string[];
  type: string;
  statut: string;
}

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || file.type === "text/plain") {
    return buffer.toString("utf-8").slice(0, 50000);
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    try {
      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
      // Disable worker for server-side usage
      GlobalWorkerOptions.workerSrc = "";
      const task = getDocument({
        data: new Uint8Array(buffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });
      const pdf = await task.promise;
      const parts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        parts.push(
          content.items
            .map((item) => ("str" in item ? (item as { str: string }).str : ""))
            .join(" ")
        );
      }
      return parts.join("\n").slice(0, 50000);
    } catch {
      // Fallback: raw buffer as latin1 text
      return buffer.toString("latin1").replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, 50000);
    }
  }

  if (name.endsWith(".docx")) {
    // DOCX is a ZIP; extract text from embedded XML
    const raw = buffer.toString("latin1");
    const body = raw.match(/<w:body>([\s\S]{0,500000}?)<\/w:body>/)?.[1] ?? raw;
    return body
      .replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g, "$1 ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 50000);
  }

  return buffer.toString("utf-8", 0, Math.min(buffer.length, 50000));
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });

  const allowed = ["application/pdf", "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const name = file.name.toLowerCase();
  const okExt = name.endsWith(".pdf") || name.endsWith(".txt") || name.endsWith(".docx");
  if (!allowed.includes(file.type) && !okExt) {
    return NextResponse.json({ error: "Format non supporté (PDF, DOCX, TXT)" }, { status: 415 });
  }

  const text = await extractText(file);
  if (text.trim().length < 20) {
    return NextResponse.json({ error: "Impossible d'extraire le texte du document" }, { status: 422 });
  }

  // ── Analyse RGPD via Anthropic ───────────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  let analysis: AnalysisResult;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `Tu es un expert RGPD et protection des données. Analyse le document fourni et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans explication) avec exactement ces champs :
{
  "score": <entier 0-100 représentant le niveau de conformité RGPD>,
  "risques": [<liste de risques RGPD identifiés, en français>],
  "actions": [<liste d'actions correctives recommandées, en français>],
  "type": <type du document : "CONTRAT"|"POLITIQUE_CONFIDENTIALITE"|"FORMULAIRE"|"RAPPORT"|"DOC">,
  "statut": <"conforme"|"risque_faible"|"risque_eleve">
}`,
      messages: [{ role: "user", content: text.slice(0, 10000) }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
    const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw;
    analysis = JSON.parse(jsonStr) as AnalysisResult;
  } catch {
    return NextResponse.json({ error: "L'analyse IA a échoué, réessayez." }, { status: 500 });
  }

  // Normalise statut
  const validStatuts = ["conforme", "risque_faible", "risque_eleve"];
  if (!validStatuts.includes(analysis.statut)) analysis.statut = "risque_faible";
  if (typeof analysis.score !== "number") analysis.score = 50;
  if (!Array.isArray(analysis.risques)) analysis.risques = [];
  if (!Array.isArray(analysis.actions)) analysis.actions = [];

  // ── Sauvegarde dans compliance-rgpd ─────────────────────────────────────────
  const compliance = createComplianceClient();
  const { data: insertedId, error: dbErr } = await compliance.rpc("insert_analyse", {
    p_nom_document:    file.name,
    p_contenu_analyse: text.slice(0, 5000),
    p_score:           analysis.score,
    p_risques:         analysis.risques,
    p_actions:         analysis.actions,
    p_type:            analysis.type ?? "DOC",
    p_statut:          analysis.statut,
  });

  if (dbErr) {
    return NextResponse.json({ error: `Sauvegarde échouée: ${dbErr.message}` }, { status: 500 });
  }

  return NextResponse.json({
    id:           insertedId as string,
    nom_document: file.name,
    score:        analysis.score,
    risques:      analysis.risques,
    actions:      analysis.actions,
    type:         analysis.type ?? "DOC",
    statut:       analysis.statut,
    created_at:   new Date().toISOString(),
  });
}
