import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY!,
);

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

type AnalysisResult = {
  ok: boolean;
  file_url: string;
  file_path: string;
  // IA fields
  type_confirm: string | null;       // detected doc type
  type_match: boolean;               // matches selected type?
  expiration: string | null;         // YYYY-MM-DD or null
  quality: 'good' | 'partial' | 'unreadable';
  quality_msg: string | null;
  too_large: boolean;
  warning: string | null;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file      = formData.get('file')     as File   | null;
    const userId    = (formData.get('userId')  as string) || 'unknown';
    const docType   = (formData.get('docType') as string) || 'autre';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    // ── 1. Vérification taille ────────────────────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({
        ok: false,
        too_large: true,
        warning: `Ce fichier fait ${(file.size / 1024 / 1024).toFixed(1)} Mo. Pour une stabilité optimale sur mobile, veuillez compresser l'image ou le PDF en dessous de 5 Mo avant de l'envoyer.`,
      } as Partial<AnalysisResult>);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/${Date.now()}_${safeName}`;

    // ── 2. Upload Supabase Storage ────────────────────────────────────────────
    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      // Auto-create bucket if missing
      if (uploadError.message?.toLowerCase().includes('not found')) {
        await supabaseAdmin.storage.createBucket('documents', { public: true });
        const { error: e2 } = await supabaseAdmin.storage
          .from('documents')
          .upload(storagePath, buffer, { contentType: file.type, upsert: false });
        if (e2) throw e2;
      } else {
        throw uploadError;
      }
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(storagePath);

    const fileUrl = urlData.publicUrl;

    // ── 3. Analyse IA Claude Vision ───────────────────────────────────────────
    const base64  = buffer.toString('base64');
    const isPdf   = file.type === 'application/pdf';
    type ImageMime = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const validImg: ImageMime[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const isImage = validImg.includes(file.type as ImageMime);

    const TYPE_LABELS: Record<string, string> = {
      carte_pro: 'Carte Professionnelle CNAPS (sécurité privée)',
      diplome:   'Diplôme ou certificat SST / formation sécurité',
      contrat:   'Contrat de travail ou avenant',
      autre:     'Autre document professionnel',
    };

    let aiResult = {
      type_confirm: null as string | null,
      type_match: true,
      expiration: null as string | null,
      quality: 'good' as 'good' | 'partial' | 'unreadable',
      quality_msg: null as string | null,
      warning: null as string | null,
    };

    if (isPdf || isImage) {
      const mediaBlock = isPdf
        ? ({ type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 } })
        : ({ type: 'image' as const,    source: { type: 'base64' as const, media_type: file.type as ImageMime,          data: base64 } });

      const prompt = `Tu es un expert en documents professionnels pour agents de sécurité privée en France.
Analyse ce document et réponds UNIQUEMENT avec un objet JSON valide (pas de markdown) :

{
  "type_detected": "string décrivant le type de document détecté (carte pro CNAPS, diplôme SST, contrat, carte d'identité, etc.)",
  "type_match": true/false (est-ce que ce document correspond bien à : "${TYPE_LABELS[docType] || docType}" ?),
  "expiration_date": "YYYY-MM-DD ou null si non trouvée",
  "quality": "good" | "partial" | "unreadable",
  "quality_message": "null si bonne qualité, sinon message court en français expliquant le problème (ex: Image floue, numéros illisibles pour un contrôle CNAPS — veuillez reprendre la photo)"
}

Règles :
- "quality: unreadable" si le document est flou, trop sombre ou illisible pour un contrôle officiel
- "quality: partial" si certaines zones sont lisibles mais d'autres pas
- "quality: good" si le document est net et exploitable
- Pour "expiration_date" : cherche 'Valide jusqu'au', 'Date de validité', 'Expire le', 'Date limite', 'Valid until'`;

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [{ role: 'user', content: [mediaBlock, { type: 'text', text: prompt }] }],
      });

      const raw   = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
      const clean = raw.replace(/```json\s*|\s*```/g, '').trim();

      try {
        const parsed = JSON.parse(clean);
        aiResult.type_confirm = parsed.type_detected ?? null;
        aiResult.type_match   = parsed.type_match !== false;
        aiResult.expiration   = parsed.expiration_date ?? null;
        aiResult.quality      = parsed.quality ?? 'good';
        aiResult.quality_msg  = parsed.quality_message ?? null;

        if (aiResult.quality === 'unreadable') {
          aiResult.warning = aiResult.quality_msg ??
            'Image illisible pour un contrôle CNAPS — veuillez reprendre la photo ou scanner le document.';
        } else if (!aiResult.type_match) {
          aiResult.warning = `Ce document semble être "${aiResult.type_confirm}" et non "${TYPE_LABELS[docType]}". Vérifiez le type sélectionné.`;
        }
      } catch { /* Keep defaults */ }
    }

    return NextResponse.json({
      ok: true,
      file_url: fileUrl,
      file_path: storagePath,
      too_large: false,
      ...aiResult,
    } as AnalysisResult);

  } catch (err) {
    console.error('[docs/analyze]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 },
    );
  }
}
