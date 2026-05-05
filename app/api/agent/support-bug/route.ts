import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Validation JWT Supabase ──────────────────────────────────────────────────
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function POST(req: Request) {
  try {
    // Auth
    const user = await getUserFromToken(req.headers.get('Authorization'));
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const description: string = body?.description?.trim();
    const title: string = body?.title?.trim() || 'Signalement bug SecuPRO';

    if (!description) {
      return NextResponse.json({ error: 'Description manquante.' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('[support-bug] RESEND_API_KEY manquant — email non envoyé.');
      return NextResponse.json({ ok: true });
    }

    await resend.emails.send({
      from: 'noreply@secupro.app',
      to:   'support@secupro.app',
      subject: `[Bug] ${title}`,
      text: [
        `Signalement de bug SecuPRO`,
        ``,
        `Utilisateur : ${user.email} (${user.id})`,
        `Sujet      : ${title}`,
        ``,
        `Description :`,
        description,
        ``,
        `---`,
        `Envoyé depuis /agent/support · SecuPRO`,
      ].join('\n'),
    });

    return NextResponse.json({ ok: true });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne.';
    console.error('[support-bug]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
