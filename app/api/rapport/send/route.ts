import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendRapportBody {
  pdfBase64: string;
  destinataire: string;
  mois: string;
  societeName: string;
}

function formatMois(mois: string): string {
  const [year, month] = mois.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (isNaN(date.getTime())) return mois;
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function extractPdfBuffer(pdfBase64: string): Buffer {
  const prefix = 'data:application/pdf;base64,';
  const base64 = pdfBase64.startsWith(prefix)
    ? pdfBase64.slice(prefix.length)
    : pdfBase64;
  return Buffer.from(base64, 'base64');
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: SendRapportBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const { pdfBase64, destinataire, mois, societeName } = body;

  if (!pdfBase64 || !destinataire || !mois || !societeName) {
    return NextResponse.json(
      { error: 'Champs requis manquants : pdfBase64, destinataire, mois, societeName' },
      { status: 400 }
    );
  }

  const moisFormate = formatMois(mois);
  const subject = `Rapport mensuel SecuPRO — ${societeName} — ${moisFormate}`;
  const filename = `rapport-${societeName}-${mois}.pdf`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0B1426;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0B1426;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#0A1F2F;border:1px solid rgba(0,209,255,0.20);border-radius:8px;padding:40px;">
          <tr>
            <td style="padding-bottom:32px;border-bottom:1px solid rgba(0,209,255,0.12);">
              <span style="font-size:22px;font-weight:700;color:#00d1ff;letter-spacing:2px;">SECUPRO</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top:32px;color:#f1f5f9;font-size:15px;line-height:1.7;">
              <p style="margin:0 0 16px 0;">Bonjour,</p>
              <p style="margin:0 0 16px 0;">
                Veuillez trouver ci-joint le rapport mensuel d'activité pour
                <strong style="color:#00d1ff;">${societeName}</strong> — ${moisFormate}.
              </p>
              <p style="margin:0;color:rgba(100,120,150,0.8);font-size:13px;">L'équipe SecuPRO</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = extractPdfBuffer(pdfBase64);
  } catch {
    return NextResponse.json({ error: 'Encodage PDF invalide' }, { status: 400 });
  }

  let sendResult: Awaited<ReturnType<typeof resend.emails.send>>;
  try {
    sendResult = await resend.emails.send({
      from: 'SECUPRO <noreply@secupro.app>',
      to: destinataire,
      subject,
      html: htmlBody,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    });
  } catch (err) {
    console.error('[rapport/send] Resend SDK threw:', err);
    return NextResponse.json({ error: "Erreur réseau lors de l'envoi" }, { status: 502 });
  }

  const { data, error } = sendResult;

  if (error) {
    console.error('[rapport/send] Resend error:', error);
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ success: true, id: data?.id });
}
