import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const SYSTEM_PROMPT = `Tu es l'assistant technique officiel de SecuPRO, une application SaaS dédiée aux agents de sécurité privée et aux entreprises de gardiennage en France.

Ton rôle est d'aider les utilisateurs avec :
- La navigation et l'utilisation de l'application SecuPRO (plannings, fiches de paie, documents, profil, espace pro)
- L'assistant IA SecuIA et ses fonctionnalités
- Les problèmes de connexion, de compte, de synchronisation
- Les questions sur les fonctionnalités disponibles (hub agent, paie, planning, docs, actualités)
- Les exports PDF, l'OCR des fiches de paie, les rapports mensuels
- Les abonnements et la facturation

Si la question porte sur du droit du travail ou la convention IDCC 1351, oriente l'utilisateur vers SecuIA (accessible depuis l'onglet "SecuIA" de l'application).

Réponds en français, de manière concise et professionnelle. Si tu ne sais pas, dis-le honnêtement et propose de contacter le support humain à support@secupro.app.`;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Validation JWT Supabase ──────────────────────────────────────────────────
async function getUserFromToken(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

export async function POST(req: Request) {
  try {
    // Auth
    const userId = await getUserFromToken(req.headers.get('Authorization'));
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    // Body
    const body = await req.json().catch(() => null);
    const messages: { role: 'user' | 'assistant'; content: string }[] = body?.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Format de messages invalide.' }, { status: 400 });
    }

    // Sanitize : seuls les rôles user/assistant sont acceptés par Anthropic
    const sanitized = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        text: "La clé API Anthropic n'est pas configurée. Contactez support@secupro.app.",
      });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: sanitized,
    });

    const text =
      response.content[0]?.type === 'text'
        ? response.content[0].text
        : 'Je ne peux pas répondre sous ce format.';

    return NextResponse.json({ text });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne.';
    console.error('[support-chat]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
