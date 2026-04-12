import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Allow up to 60s for upload + Claude OCR
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string) || 'unknown';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // ─── 1. Upload vers Supabase Storage ─────────────────────────────────────
    const { error: uploadError } = await supabaseAdmin.storage
      .from('fiches-paie')
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      // If bucket doesn't exist, try to create it then retry
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        await supabaseAdmin.storage.createBucket('fiches-paie', { public: true });
        const { error: retryErr } = await supabaseAdmin.storage
          .from('fiches-paie')
          .upload(storagePath, buffer, { contentType: file.type, upsert: false });
        if (retryErr) throw retryErr;
      } else {
        throw uploadError;
      }
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('fiches-paie')
      .getPublicUrl(storagePath);

    const fileUrl = urlData.publicUrl;

    // ─── 2. OCR avec Claude Vision ────────────────────────────────────────────
    const base64 = buffer.toString('base64');
    const isPdf = file.type === 'application/pdf';

    type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const allowedImageTypes: ImageMediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const isImage = allowedImageTypes.includes(file.type as ImageMediaType);

    let extracted: Record<string, unknown> = {};

    if (isPdf || isImage) {
      const mediaBlock = isPdf
        ? ({
            type: 'document' as const,
            source: {
              type: 'base64' as const,
              media_type: 'application/pdf' as const,
              data: base64,
            },
          })
        : ({
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: file.type as ImageMediaType,
              data: base64,
            },
          });

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              mediaBlock,
              {
                type: 'text',
                text: `Tu es un expert en lecture de fiches de paie françaises (secteur sécurité privée / gardiennage).
Extrais précisément les données suivantes de ce document.

Règles :
- "salaire_brut" : montant brut avant cotisations (cherche "Salaire brut", "Rémunération brute", "Total brut")
- "salaire_net" : montant net à payer (cherche "Net à payer", "Net payé", "Salaire net")
- "acompte" : avance ou acompte versé (cherche "Acompte", "Avance sur salaire" — 0 si absent)
- "retenues" : total des cotisations salariales retenues (cherche "Total retenues salariales", "Cotisations salariales")
- "heures_travaillees" : nombre total d'heures effectuées ce mois (cherche "Heures travaillées", "H. effectuées", "Nombre d'heures")
- "conges_pris" : jours ou heures de congés pris CE mois (0 si absent)
- "conges_restant" : solde de congés restants ou acquis (cherche "Solde CP", "Congés restants", "Reliquat")
- "mois" : période de la fiche au format "Mois AAAA" (ex: "Avril 2026")

Réponds UNIQUEMENT avec ce JSON valide, sans markdown ni explication :
{"mois":string|null,"salaire_brut":number|null,"salaire_net":number|null,"acompte":number|null,"retenues":number|null,"heures_travaillees":number|null,"conges_pris":number|null,"conges_restant":number|null}`,
              },
            ],
          },
        ],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
      const clean = raw.replace(/```json\s*|\s*```/g, '').trim();
      try {
        extracted = JSON.parse(clean);
      } catch {
        extracted = {};
      }
    }

    return NextResponse.json({
      file_path: storagePath,
      file_url: fileUrl,
      extracted,
    });
  } catch (err) {
    console.error('[OCR] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 },
    );
  }
}
