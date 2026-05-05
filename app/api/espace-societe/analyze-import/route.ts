import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACTION_PROMPT = `Tu es un extracteur de données RH pour la sécurité privée française.
Analyse le contenu ci-dessous et extrais la liste des agents sous forme de tableau JSON.

Pour chaque agent, retourne un objet avec ces champs (laisse vide "" si absent) :
- nom (string)
- prenom (string)
- date_recrutement (string, format YYYY-MM-DD ou "")
- carte_pro (string, numéro CNAPS ex: AUT-XXX-XXXX-20240101-X-XXXXX-XXXXX-X ou "")
- carte_pro_expiration (string, format YYYY-MM-DD ou "")
- sst (boolean, true si SST/Sauveteur Secouriste mentionné)
- sst_expiration (string, format YYYY-MM-DD ou "")
- adresse (string ou "")
- telephone (string ou "")
- site_actuel (string, lieu/site d'affectation ou "")

Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown, sans commentaire. Exemple :
[{"nom":"DUPONT","prenom":"Jean","carte_pro":"AUT-XXX-XXXX-20240101-X-XXXXX-XXXXX-X","carte_pro_expiration":"2027-01-01","sst":true,"sst_expiration":"2026-06-01","date_recrutement":"2024-03-15","adresse":"12 rue de la Paix, 69001 Lyon","telephone":"0600000001","site_actuel":"Site Lyon Centre"}]`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();

    // ── PDF → envoi direct via l'API Claude (document support) ───────────────
    if (fileName.endsWith(".pdf")) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      const response = await anthropic.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64 },
              } as Parameters<typeof anthropic.messages.create>[0]["messages"][0]["content"][0],
              { type: "text", text: EXTRACTION_PROMPT },
            ],
          },
        ],
      });

      const raw = response.content[0]?.type === "text" ? response.content[0].text : "[]";
      return NextResponse.json({ agents: safeParseJSON(raw) });
    }

    // ── Excel (.xlsx / .xls) → conversion CSV via xlsx ───────────────────────
    let textContent = "";
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      try {
        // Dynamic import so Next.js doesn't bundle xlsx on the client
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const XLSX = require("xlsx") as typeof import("xlsx");
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "buffer" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        textContent = XLSX.utils.sheet_to_csv(ws);
      } catch {
        textContent = await file.text();
      }
    } else {
      // CSV / TXT
      textContent = await file.text();
    }

    // Limite de sécurité : 12 000 caractères max envoyés à Claude
    const truncated = textContent.slice(0, 12_000);

    const response = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `${EXTRACTION_PROMPT}\n\nContenu du fichier :\n\n${truncated}`,
        },
      ],
    });

    const raw = response.content[0]?.type === "text" ? response.content[0].text : "[]";
    return NextResponse.json({ agents: safeParseJSON(raw) });
  } catch (err: unknown) {
    console.error("[analyze-import]", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: `Erreur analyse IA : ${msg}` }, { status: 500 });
  }
}

function safeParseJSON(text: string): object[] {
  try {
    // Extrait le premier tableau JSON trouvé dans la réponse
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]) as object[];
  } catch {
    return [];
  }
}
