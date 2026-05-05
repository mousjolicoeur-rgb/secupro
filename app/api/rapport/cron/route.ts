import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getRapportData } from "@/services/rapportMensuelService";
import { generateRapportPDF } from "@/lib/generateRapportPDF";

interface EntrepriseRow {
  id: string;
  nom: string;
}

interface CronResult {
  processed: number;
  errors: Array<{ societeId: string; societeName: string; error: string }>;
}

const safe = (a: string, b: string): boolean =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

function getPreviousMonth(): string {
  const now = new Date();
  const prevDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMois(mois: string): string {
  const [year, month] = mois.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (isNaN(date.getTime())) return mois;
  const label = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getServerClient(): ReturnType<typeof createClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * GET /api/rapport/cron
 * Déclenché par Vercel Cron le 1er de chaque mois à 06:00 UTC.
 * Sécurité : header `Authorization: Bearer {CRON_SECRET}` requis.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Cron not configured (missing CRON_SECRET)" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!safe(token, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mois = getPreviousMonth();
  const moisFormate = formatMois(mois);
  const adminEmail = process.env.ADMIN_EMAIL ?? "contact@secupro.app";

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { error: "Cron not configured (missing RESEND_API_KEY)" },
      { status: 500 }
    );
  }
  const resend = new Resend(resendApiKey);

  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = getServerClient();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { data: societes, error: societeError } = await supabase
    .from("entreprises")
    .select("id, nom")
    .returns<EntrepriseRow[]>();

  if (societeError) {
    return NextResponse.json({ error: societeError.message }, { status: 500 });
  }

  if (!societes || societes.length === 0) {
    return NextResponse.json({ processed: 0, errors: [] });
  }

  const result: CronResult = { processed: 0, errors: [] };

  for (const societe of societes) {
    const { id: societeId, nom: societeName } = societe;

    try {
      const rapportData = await getRapportData(societeId, mois);

      const pdfDataUri = generateRapportPDF(rapportData);
      const raw = pdfDataUri.includes(",") ? pdfDataUri.split(",")[1] : pdfDataUri;
      const pdfBuffer = Buffer.from(raw, "base64");

      const destinataire = rapportData.donneurOrdreEmail ?? adminEmail;

      const { error: resendError } = await resend.emails.send({
        from: "SECUPRO <noreply@secupro.app>",
        to: destinataire,
        subject: `[Cron] Rapport mensuel SecuPRO — ${rapportData.societeName} — ${moisFormate}`,
        html: `<p>Bonjour,</p><p>Rapport mensuel SecuPRO pour <strong>${rapportData.societeName}</strong> — <strong>${moisFormate}</strong>.</p><p>L'équipe SecuPRO</p>`,
        attachments: [
          {
            filename: `rapport-secupro-${societeId}-${mois}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      if (resendError) {
        throw new Error(`Resend error: ${resendError.message}`);
      }

      result.processed++;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      result.errors.push({ societeId, societeName, error: errorMsg });
    }
  }

  return NextResponse.json(result, { status: 200 });
}
