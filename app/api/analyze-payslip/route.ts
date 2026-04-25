import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

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
      .from('payrolls')
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from('payrolls')
      .getPublicUrl(storagePath);

    const fileUrl = urlData.publicUrl;

    // ─── 2. Analyse avec Claude Vision (IDCC 1351) ────────────────────────────
    const base64 = buffer.toString('base64');
    const isPdf = file.type === 'application/pdf';

    type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const allowedImageTypes: ImageMediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const isImage = allowedImageTypes.includes(file.type as ImageMediaType);

    let analyseData: Record<string, unknown> = {};

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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: [
              mediaBlock,
              {
                type: 'text',
                text: `Tu es un expert en audit de fiches de paie françaises (secteur sécurité privée / gardiennage, convention collective IDCC 1351).
Analyse ce bulletin de salaire et extrais les données. Identifie toute anomalie (heures supplémentaires non payées, primes manquantes comme prime d'habillage ou prime panier, déductions injustifiées, ou un coefficient IDCC 1351 incorrect).

Règles d'extraction des métriques de base :
- "salaire_net" : montant net à payer
- "acompte" : avance ou acompte versé (0 si absent)
- "retenues" : total des cotisations salariales retenues
- "heures_travaillees" : nombre total d'heures effectuées
- "conges_pris" : jours ou heures de congés pris
- "conges_restant" : solde de congés restants
- "mois" : période de la fiche (ex: "Avril 2026")

Règles de l'analyse IA IDCC 1351 (Génère des phrases courtes et concises) :
- "points_ok" : liste des éléments conformes (ex: "Coefficient 140 conforme au taux horaire de 12.00€", "Prime panier bien présente").
- "alertes" : liste des anomalies détectées (ex: "4h supplémentaires n'ont pas été majorées", "Absence de la prime d'habillage alors que des heures de nuit sont présentes").
- "coefficient_detecte" : le coefficient de la grille IDCC 1351 trouvé sur la fiche (ex: 130, 140, 150)
- "taux_horaire_detecte" : le taux horaire brut de base
- "heures_sup_detectees" : le nombre d'heures supplémentaires identifiées (0 si aucune)

Réponds UNIQUEMENT avec ce JSON valide, sans markdown ni aucune autre phrase :
{
  "mois": string|null,
  "salaire_net": number|null,
  "acompte": number|null,
  "retenues": number|null,
  "heures_travaillees": number|null,
  "conges_pris": number|null,
  "conges_restant": number|null,
  "analyse_ia": {
    "points_ok": string[],
    "alertes": string[],
    "coefficient_detecte": number|null,
    "taux_horaire_detecte": number|null,
    "heures_sup_detectees": number|null,
    "date_analyse": string
  }
}`
              },
            ],
          },
        ],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
      const clean = raw.replace(/```json\s*|\s*```/g, '').trim();
      try {
        analyseData = JSON.parse(clean);
      } catch (e) {
        console.error('[Analyze Payslip] Parse Error:', e, clean);
        analyseData = {};
      }
    }

    // Assign today's date if missing from JSON
    if (analyseData.analyse_ia && typeof analyseData.analyse_ia === 'object') {
      const ia = analyseData.analyse_ia as Record<string, any>;
      if (!ia.date_analyse) {
        ia.date_analyse = new Date().toISOString().slice(0, 10);
      }
    }

    return NextResponse.json({
      file_path: storagePath,
      file_url: fileUrl,
      extracted: analyseData,
    });
  } catch (err) {
    console.error('[Analyze Payslip] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 },
    );
  }
}
