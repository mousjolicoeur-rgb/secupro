import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend    = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL   ?? "contact@secupro.app";
const FROM_EMAIL  = process.env.FROM_EMAIL    ?? "SECUPRO <noreply@secupro.app>";

export async function POST(req: NextRequest) {
  // ── 1. Vérification du secret (header x-webhook-secret) ──────────────────
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const incoming = req.headers.get("x-webhook-secret") ?? "";
    if (incoming !== secret) {
      console.warn("[webhook] secret invalide");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── 2. Lecture du payload Supabase ────────────────────────────────────────
  // Format Supabase : { type, table, schema, record: { ... }, old_record }
  let body: { record?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = body.record ?? {};
  const prenom    = String(record.prenom    ?? "");
  const nom       = String(record.nom       ?? "");
  const email     = String(record.email     ?? "");
  const telephone = String(record.telephone ?? "");
  const societe   = String(record.societe   ?? "");

  console.log("[webhook] nouveau profil →", { prenom, nom, email, telephone });

  // ── 3. Envoi des emails via Resend ────────────────────────────────────────
  if (!process.env.RESEND_API_KEY) {
    console.warn("[webhook] RESEND_API_KEY manquant — emails ignorés");
    return NextResponse.json({ ok: true, skipped: "no resend key" });
  }

  try {
    // Email alerte admin
    await resend.emails.send({
      from: FROM_EMAIL,
      to:   ADMIN_EMAIL,
      subject: `🆕 Nouveau dossier agent — ${prenom} ${nom}`.trim(),
      html: `
        <div style="font-family:sans-serif;background:#050a12;color:#fff;padding:32px;border-radius:12px;max-width:480px">
          <h2 style="color:#00d1ff;letter-spacing:0.15em;text-transform:uppercase;font-size:16px;margin:0 0 24px">
            Nouveau dossier agent
          </h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;width:120px">Prénom</td>
                <td style="padding:8px 0;color:#fff;font-weight:700">${prenom || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Nom</td>
                <td style="padding:8px 0;color:#fff;font-weight:700">${nom || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Email</td>
                <td style="padding:8px 0;color:#00d1ff">${email || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Téléphone</td>
                <td style="padding:8px 0;color:#fff">${telephone || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Société</td>
                <td style="padding:8px 0;color:#fff">${societe || "—"}</td></tr>
          </table>
          <p style="margin:24px 0 0;color:#475569;font-size:11px">
            SECUPRO COMMAND SYSTEM · ${new Date().toLocaleString("fr-FR")}
          </p>
        </div>
      `,
    });

    // Email bienvenue agent
    if (email) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to:   email,
        subject: "Bienvenue dans SECUPRO — Votre mission commence ici",
        html: `
          <div style="font-family:sans-serif;background:#050a12;color:#fff;padding:32px;border-radius:12px;max-width:480px">
            <h1 style="color:#00d1ff;letter-spacing:0.1em;text-transform:uppercase;font-size:22px;margin:0 0 8px">SECUPRO</h1>
            <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.25em;margin:0 0 28px">Système de gestion agents</p>
            <h2 style="font-size:16px;margin:0 0 16px">Bienvenue, ${prenom || "Agent"} !</h2>
            <p style="color:#94a3b8;line-height:1.7;font-size:14px">
              Votre profil a bien été enregistré sur la plateforme <strong style="color:#fff">SECUPRO</strong>.
              Votre dossier est actif et en cours de traitement par notre équipe.
            </p>
            <div style="margin:28px 0;padding:16px;background:#0a1520;border:1px solid rgba(0,209,255,0.15);border-radius:8px">
              <p style="color:#00d1ff;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 8px;font-weight:700">Prochaines étapes</p>
              <ul style="color:#94a3b8;font-size:14px;line-height:2;margin:0;padding-left:16px">
                <li>Accédez à votre Hub Agent</li>
                <li>Complétez vos documents (Carte CNAPS, diplômes)</li>
                <li>Consultez vos plannings et fiches de paie</li>
              </ul>
            </div>
            <p style="color:#475569;font-size:11px;margin:24px 0 0">
              © 2026 SECUPRO · Cet email est automatique, merci de ne pas y répondre.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook] erreur Resend →", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
