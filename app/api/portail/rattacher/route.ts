import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Make sure we have a service role client or use standard if we rely on RLS. Actually, for update, we might need admin privileges.
// Wait, the project has SUPABASE_SERVICE_ROLE_KEY?
// In AGENTS.md: SUPABASE_SERVICE_ROLE_KEY is required. Let's create an admin client.
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Basic in-memory rate limiting map
// Key: IP or agentId, Value: { count: number, resetAt: number }
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();

export async function POST(req: Request) {
  try {
    const { code, agentId } = await req.json();

    if (!code || !agentId) {
      return NextResponse.json({ success: false, error: "Code ou Agent manquant" }, { status: 400 });
    }

    // --- 1. Rate Limiting (5 tentatives max par heure) ---
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateKey = `rate_${ip}_${agentId}`;
    const now = Date.now();
    
    const limitRecord = rateLimitMap.get(rateKey);
    if (limitRecord) {
      if (now < limitRecord.resetAt) {
        if (limitRecord.count >= 5) {
          return NextResponse.json({ success: false, error: "Trop de tentatives. Réessayez dans 1 heure." }, { status: 429 });
        }
        limitRecord.count += 1;
      } else {
        rateLimitMap.set(rateKey, { count: 1, resetAt: now + 3600 * 1000 });
      }
    } else {
      rateLimitMap.set(rateKey, { count: 1, resetAt: now + 3600 * 1000 });
    }

    // --- 2. Vérification du code ---
    const { data: societe, error: societeErr } = await supabaseAdmin
      .from('societes')
      .select('id, nom, code_expire_at')
      .eq('code_invitation', code.toUpperCase())
      .single();

    if (societeErr || !societe) {
      return NextResponse.json({ success: false, error: "Code d'invitation invalide ou introuvable." }, { status: 404 });
    }

    if (new Date(societe.code_expire_at).getTime() < now) {
      return NextResponse.json({ success: false, error: "Ce code d'invitation a expiré." }, { status: 400 });
    }

    // --- 3. Rattachement de l'agent ---
    const { error: updateAgentErr } = await supabaseAdmin
      .from('agents')
      .update({ societe_id: societe.id })
      .eq('id', agentId);

    if (updateAgentErr) {
      console.error("[Portail] Error updating agent:", updateAgentErr);
      return NextResponse.json({ success: false, error: "Erreur lors du rattachement de l'agent." }, { status: 500 });
    }

    // --- 4. Invalidation du code (usage unique) ---
    await supabaseAdmin
      .from('societes')
      .update({ code_invitation: null, code_expire_at: null })
      .eq('id', societe.id);

    // --- 5. Logs d'audit ---
    await supabaseAdmin
      .from('import_audits')
      .insert({
        societe_id: societe.id,
        fichier_nom: 'Rattachement_Portail_Pro',
        nb_lignes: 1,
        nb_succes: 1,
        nb_erreurs: 0,
        erreurs: { agentId, action: "rattachement", date: new Date().toISOString() }
      });

    return NextResponse.json({ success: true, nomSociete: societe.nom });

  } catch (error: any) {
    console.error("[Portail API]", error);
    return NextResponse.json({ success: false, error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
