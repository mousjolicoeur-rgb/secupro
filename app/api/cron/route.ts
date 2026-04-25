import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const RSS_FEEDS = [
  { url: 'https://www.legifrance.gouv.fr/rss/jorf.rss', categoryDefault: 'conv' },
  // Un flux fictif du CNAPS pour la démo
  { url: 'https://www.interieur.gouv.fr/rss/cnaps.rss', categoryDefault: 'cnaps' }
];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function GET(req: Request) {
  // Sécurisation basique du cron
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Missing Anthropic Key' }, { status: 500 });
  }

  const parser = new Parser();
  const results = { processed: 0, inserted: 0, errors: [] as string[] };

  try {
    for (const feed of RSS_FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url).catch(() => null);
        if (!parsed || !parsed.items) continue;

        // On prend les 5 derniers articles de chaque flux pour éviter le timeout
        for (const item of parsed.items.slice(0, 5)) {
          results.processed++;
          
          if (!item.title || !item.link) continue;

          // 1. Éviter les doublons sur la source (URL)
          const { data: existing } = await supabaseAdmin
            .from('actualites')
            .select('id')
            .eq('source', item.link)
            .single();

          if (existing) continue; // Déjà traité

          // 2. Appel à Claude 3.5 Sonnet pour l'analyse
          const promptContent = `
            Tu es un expert du domaine de la sécurité privée en France.
            Voici un article récent intitulé : "${item.title}".
            Résumé/Extrait : "${item.contentSnippet || item.content || 'Pas de contenu extrait'}".
            
            Tâche :
            1. Rédige un résumé clair de 2-3 lignes pour un agent de sécurité.
            2. Détermine la catégorie stricte parmi : cnaps, conv, emploi.
            3. Attribue un score de pertinence de 1 à 10 pour un agent de sécurité privée.
            
            Format de réponse attendu EXCLUSIVEMENT en JSON valide :
            { "resume": "...", "categorie": "cnaps", "score": 8 }
          `;

          const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 300,
            temperature: 0,
            messages: [{ role: "user", content: promptContent }]
          });

          const responseText = (msg.content[0] as any).text;
          
          try {
            // Extraction rudimentaire du JSON (au cas où Claude ajoute du blabla)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) continue;
            
            const iaData = JSON.parse(jsonMatch[0]);
            
            // 3. Filtrage par score >= 6
            if (iaData.score && iaData.score >= 6) {
              await supabaseAdmin.from('actualites').insert({
                titre: item.title,
                resume: iaData.resume,
                contenu: item.contentSnippet || item.content || iaData.resume,
                source: item.link,
                categorie: ['cnaps', 'conv', 'emploi'].includes(iaData.categorie) ? iaData.categorie : feed.categoryDefault,
                // On suppose qu'il y a created_at par défaut dans la BDD
              });
              results.inserted++;
            }
          } catch (jsonErr) {
            console.error("Erreur parsing JSON Anthropic", responseText);
          }
        }
      } catch (feedErr: any) {
        results.errors.push(`Erreur flux ${feed.url}: ${feedErr.message}`);
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (globalErr: any) {
    return NextResponse.json({ success: false, error: globalErr.message }, { status: 500 });
  }
}
