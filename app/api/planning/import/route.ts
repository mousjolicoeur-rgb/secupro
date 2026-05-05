import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY!,
);

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

export type PlanningImportRow = {
  date: string;     // YYYY-MM-DD
  site: string;
  horaires: string;
};

export type PlanningImportResult = {
  ok: boolean;
  rows: PlanningImportRow[];
  raw_text?: string;
  warning?: string;
  error?: string;
};

// ── Prompt SecuAI ─────────────────────────────────────────────────────────
const PROMPT = `Tu es SecuAI, l'assistant IA de SecuPRO spécialisé dans la sécurité privée en France.
Analyse ce document et extrais les vacations (shifts) d'un agent de sécurité.

Réponds UNIQUEMENT avec un tableau JSON valide (pas de markdown, pas de commentaires) :
[
  { "date": "YYYY-MM-DD", "site": "Nom du site ou lieu", "horaires": "HH:MM-HH:MM" },
  ...
]

Règles :
- "date" : format ISO YYYY-MM-DD obligatoire (ex: 2026-04-14)
- "site" : nom du site ou "Non précisé" si absent
- "horaires" : HH:MM-HH:MM (ex: "06:00-14:00"), ou "Journée" / "Nuit" si heures absentes
- Ne pas inclure les jours de repos ou congés
- Si le document ne contient aucun planning, retourne []
- Retourne SEULEMENT le tableau JSON, rien d'autre`;

// ── 1. Détection MIME robuste (type + extension + magic bytes) ────────────
// ImageMime : uniquement les 4 valeurs acceptées par le SDK Anthropic
type ImageMime = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
type SupportedMime = "application/pdf" | ImageMime;

const EXT_TO_MIME: Record<string, SupportedMime> = {
  pdf:  "application/pdf",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
  gif:  "image/gif",
  webp: "image/webp",
};

const MAGIC: Record<string, SupportedMime> = {
  "25504446": "application/pdf", // %PDF  (hex)
  "ffd8ff":   "image/jpeg",      // JPEG SOI marker
  "89504e47": "image/png",       // PNG signature
  "47494638": "image/gif",       // GIF8
  "52494646": "image/webp",      // RIFF (WebP)
};

function detectMime(file: File, buf: Buffer): SupportedMime | null {
  // a) Magic bytes — source la plus fiable
  const hex4 = buf.slice(0, 4).toString("hex").toLowerCase();
  const hex3 = hex4.slice(0, 6);
  if (MAGIC[hex4]) return MAGIC[hex4];
  if (MAGIC[hex3]) return MAGIC[hex3];

  // b) Extension du nom de fichier
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];

  // c) MIME déclaré par le navigateur (le moins fiable, souvent vide sur iOS)
  const clean = (file.type || "").trim().toLowerCase();
  if (clean === "application/pdf") return "application/pdf";
  if (clean === "image/jpeg" || clean === "image/jpg") return "image/jpeg";
  if (clean === "image/png")  return "image/png";
  if (clean === "image/gif")  return "image/gif";
  if (clean === "image/webp") return "image/webp";

  return null;
}

// ── 2. Validation structurelle PDF ───────────────────────────────────────
function assertValidPDF(buf: Buffer): void {
  if (buf.length < 5) throw new Error("Fichier PDF vide ou tronqué.");
  if (buf.slice(0, 4).toString("ascii") !== "%PDF") {
    throw new Error("Ce fichier ne commence pas par la signature PDF (%PDF). Il est peut-être corrompu.");
  }
}

// ── Handler principal ─────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file   = formData.get("file")   as File   | null;
    const userId = (formData.get("userId") as string) || "unknown";

    if (!file) {
      return NextResponse.json<PlanningImportResult>(
        { ok: false, rows: [], error: "Aucun fichier reçu." },
        { status: 400 },
      );
    }

    // ── Taille ───────────────────────────────────────────────────────────
    if (file.size > MAX_SIZE) {
      return NextResponse.json<PlanningImportResult>({
        ok: false,
        rows: [],
        warning: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum 5 Mo.`,
      });
    }

    // ── Formats xlsx non supportés ────────────────────────────────────────
    const fileExt = file.name.toLowerCase().split(".").pop() ?? "";
    if (fileExt === "xlsx" || file.type.includes("spreadsheet")) {
      return NextResponse.json<PlanningImportResult>({
        ok: false,
        rows: [],
        warning:
          "Format .xlsx non pris en charge. " +
          "Exportez votre planning en PDF ou envoyez une capture d'écran (JPG/PNG).",
      });
    }

    // ── Lecture complète du buffer ────────────────────────────────────────
    // arrayBuffer() lit l'intégralité du fichier en mémoire.
    // Le await garantit que le stream est entièrement lu avant de continuer.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json<PlanningImportResult>({
        ok: false,
        rows: [],
        error: "Le fichier reçu est vide.",
      });
    }

    // ── Détection MIME via magic bytes + extension + déclaration ─────────
    const mime = detectMime(file, buffer);

    if (!mime) {
      return NextResponse.json<PlanningImportResult>({
        ok: false,
        rows: [],
        error:
          `Format non reconnu (type: "${file.type || "vide"}", extension: ".${fileExt}"). ` +
          "Utilisez un fichier PDF, JPG ou PNG.",
      });
    }

    const isPdf  = mime === "application/pdf";
    const isImage = !isPdf;

    // ── Validation structurelle PDF ───────────────────────────────────────
    if (isPdf) {
      try {
        assertValidPDF(buffer);
      } catch (validErr) {
        return NextResponse.json<PlanningImportResult>({
          ok: false,
          rows: [],
          error: `PDF invalide : ${(validErr as Error).message}`,
        });
      }
    }

    // ── Encodage base64 propre (sans préfixe data URI) ────────────────────
    // Buffer.toString("base64") produit une chaîne pure sans préfixe.
    // Le split(',')[1] est un filet de sécurité au cas où un préfixe
    // "data:application/pdf;base64,XXXXX" serait présent (ex: FileReader côté client).
    const base64Raw = buffer.toString("base64");
    const base64 = base64Raw.includes(",") ? base64Raw.split(",")[1] : base64Raw;

    console.log(
      `[planning/import] base64 : ${base64.slice(0, 12)}… (${base64.length} chars) | mime=${mime} isPdf=${isPdf}`,
    );

    // ── Construction du contenu pour l'API Anthropic ─────────────────────
    // On force le type en `any[]` pour contourner les versions du SDK
    // qui ne déclarent pas encore le bloc "document" dans leurs types TS.
    // La structure envoyée à l'API est strictement conforme à la doc Anthropic.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userContent: any[] = isPdf
      ? [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          {
            type: "text",
            text: PROMPT,
          },
        ]
      : [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mime as ImageMime,
              data: base64,
            },
          },
          {
            type: "text",
            text: PROMPT,
          },
        ];

    // ── Appel Claude Vision / PDF ─────────────────────────────────────────
    console.log(`[planning/import] appel Anthropic | model=claude-sonnet-4-6 size=${buffer.length}B`);

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const raw   = msg.content[0].type === "text" ? msg.content[0].text : "[]";
    const clean = raw.replace(/```json\s*|\s*```/g, "").trim();

    // ── Parsing JSON ──────────────────────────────────────────────────────
    let rows: PlanningImportRow[] = [];
    try {
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) {
        rows = parsed
          .filter((r) => typeof r.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.date))
          .map((r) => ({
            date:     r.date,
            site:     typeof r.site === "string" && r.site.trim() ? r.site.trim() : "Non précisé",
            horaires: typeof r.horaires === "string" && r.horaires.trim() ? r.horaires.trim() : "—",
          }));
      }
    } catch {
      return NextResponse.json<PlanningImportResult>({
        ok: false,
        rows: [],
        raw_text: clean,
        warning: "SecuAI n'a pas pu interpréter ce document. Vérifiez que le planning est lisible.",
      });
    }

    if (rows.length === 0) {
      return NextResponse.json<PlanningImportResult>({
        ok: true,
        rows: [],
        warning:
          "Aucune vacation détectée. Vérifiez que le fichier contient bien un planning d'agent de sécurité.",
      });
    }

    // ── Upsert Supabase ───────────────────────────────────────────────────
    const records = rows.map((r) => ({
      user_id:  userId,
      date:     r.date,
      site:     r.site,
      horaires: r.horaires,
    }));

    const { error: upsertError } = await supabaseAdmin
      .from("plannings")
      .upsert(records, { onConflict: "user_id,date", ignoreDuplicates: false });

    if (upsertError) {
      console.error("[planning/import] upsert:", upsertError.message);
      return NextResponse.json<PlanningImportResult>({
        ok: true,
        rows,
        warning: `Planning extrait (${rows.length} vacations) mais la sauvegarde a échoué : ${upsertError.message}`,
      });
    }

    return NextResponse.json<PlanningImportResult>({ ok: true, rows });

  } catch (err) {
    console.error("[planning/import] fatal:", err);
    return NextResponse.json<PlanningImportResult>(
      {
        ok: false,
        rows: [],
        error: err instanceof Error ? err.message : "Erreur interne du serveur.",
      },
      { status: 500 },
    );
  }
}
