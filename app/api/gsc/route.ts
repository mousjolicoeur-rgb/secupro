import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { google } from "googleapis";

const COOKIE = "boss_admin_auth";

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  // --- Auth check (même cookie que /api/admin/login) ---
  const cookieStore = await cookies();
  if (cookieStore.get(COOKIE)?.value !== "1") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey  = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const siteUrl     = process.env.GSC_SITE_URL ?? "https://secupro.app/";

  if (!clientEmail || !privateKey) {
    return NextResponse.json(
      { error: "Variables GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY manquantes" },
      { status: 500 }
    );
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });

    const sc = google.searchconsole({ version: "v1", auth });

    // 28 derniers jours, groupé par date (7 points = 1 par semaine, 28 = quotidien)
    const { data } = await sc.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: dateOffset(28),
        endDate:   dateOffset(1),
        dimensions: ["date"],
        rowLimit: 28,
      },
    });

    const rows = data.rows ?? [];

    const totalClicks      = rows.reduce((s, r) => s + (r.clicks      ?? 0), 0);
    const totalImpressions = rows.reduce((s, r) => s + (r.impressions ?? 0), 0);

    // Sparkline : on garde les 7 derniers points (1 par 4 jours pour lisser)
    const sparkClicks      = rows.slice(-7).map((r) => r.clicks      ?? 0);
    const sparkImpressions = rows.slice(-7).map((r) => r.impressions ?? 0);

    return NextResponse.json({
      clicks:             totalClicks,
      impressions:        totalImpressions,
      sparkClicks,
      sparkImpressions,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur GSC inconnue";
    console.error("[GSC]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
