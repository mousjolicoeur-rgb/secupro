export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check
  const { key } = req.query;
  if (key !== 'secupro2026') {
    return res.status(401).json({ error: 'Clé invalide' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Variable ANTHROPIC_API_KEY manquante sur Vercel' });
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Variables SUPABASE_URL et SUPABASE_SERVICE_KEY manquantes sur Vercel' });
  }

  const queries = [
    {
      q: 'CNAPS réglementation sécurité privée France 2026',
      cat: 'cnaps'
    },
    {
      q: 'convention collective sécurité privée salaires 2026',
      cat: 'conv'
    },
    {
      q: 'offres emploi agent sécurité privée France',
      cat: 'emploi'
    }
  ];

  const articles = [];
  const errors = [];

  for (const { q, cat } of queries) {
    try {
      const prompt = `Tu es un journaliste spécialisé en sécurité privée en France. Utilise la recherche web pour trouver les 2 actualités les plus récentes sur : "${q}".

RÈGLES STRICTES :
1. Utilise UNIQUEMENT des informations trouvées via la recherche web - JAMAIS d'invention
2. La source doit être le NOM EXACT du site web où tu as trouvé l'info (ex: legifrance.gouv.fr, cnaps.interieur.gouv.fr, 83-629.fr, securite-privee.org)
3. La date_publication doit être la VRAIE date de publication de l'article source. Si tu ne trouves pas la date exacte, utilise "${new Date().toISOString().split('T')[0]}T00:00:00Z"
4. Si tu ne trouves AUCUN résultat fiable, réponds avec un array vide : []
5. Le contenu doit être factuel, vérifié et utile pour un agent de sécurité privée

Réponds UNIQUEMENT avec un JSON array valide, sans texte avant ou après :
[
  {
    "categorie": "${cat}",
    "titre": "Titre exact ou fidèle de l'actualité trouvée",
    "resume": "Résumé factuel en 2-3 lignes",
    "contenu": "Synthèse complète en 6-10 lignes avec les faits concrets, chiffres, dates et impacts pour les agents",
    "source": "nom-exact-du-site.fr",
    "date_publication": "2026-01-15T00:00:00Z"
  }
]`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API error ${response.status}: ${errText}`);
      }

      const data = await response.json();

      // Extract text blocks from response (web_search may produce tool_use + text blocks)
      let jsonText = '';
      if (data.content) {
        for (const block of data.content) {
          if (block.type === 'text') {
            jsonText += block.text;
          }
        }
      }

      // Extract JSON array from text
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        // Clean invalid characters before parsing
        const cleanJson = jsonMatch[0]
          .replace(/[\u00C0-\u024F]/g, match => match) // keep accented chars
          .replace(/[\x00-\x1F\x7F]/g, ' '); // remove control chars
        let parsed;
        try {
          parsed = JSON.parse(cleanJson);
        } catch (parseErr) {
          // Try to fix common JSON issues
          const fixedJson = cleanJson
            .replace(/,\s*]/g, ']')
            .replace(/,\s*}/g, '}');
          parsed = JSON.parse(fixedJson);
        }
        if (Array.isArray(parsed)) {
          articles.push(...parsed);
        }
      } await sleep(60000);
    } catch (e) {
      errors.push({ query: q, error: e.message });
      console.error(`Erreur scraping "${q}":`, e.message);
    }
  }

  if (!articles.length) {
    return res.status(200).json({
      inserted: 0,
      message: 'Aucun article généré',
      errors
    });
  }

  // Normalize and force statut brouillon before inserting
  const stripHtml = (str) => String(str || '').replace(/<[^>]*>/g, '');
  const toInsert = articles.map(a => ({
    categorie: a.categorie,
    titre: stripHtml(a.titre).slice(0, 500),
    resume: stripHtml(a.resume).slice(0, 1000),
    contenu: stripHtml(a.contenu),
    source: stripHtml(a.source || 'SecuPRO').slice(0, 200),
    date_publication: a.date_publication || new Date().toISOString(),
    statut: 'brouillon'
  })).filter(a => a.titre && a.resume && a.contenu);

  // Deduplication: fetch existing titles from Supabase
  let existingTitles = [];
  try {
    const existRes = await fetch(`${SUPABASE_URL}/rest/v1/actualites?select=titre`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (existRes.ok) {
      const existData = await existRes.json();
      existingTitles = existData.map(a => a.titre.toLowerCase().trim());
    }
  } catch (e) {
    console.error('Erreur fetch titres existants:', e.message);
  }

  const uniqueToInsert = toInsert.filter(a => 
    !existingTitles.includes(a.titre.toLowerCase().trim())
  );

  if (!uniqueToInsert.length) {
    return res.status(200).json({
      inserted: 0,
      skipped: toInsert.length,
      message: 'Tous les articles existent déjà',
      errors: errors.length ? errors : undefined
    });
  }

  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/actualites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(uniqueToInsert)
  });

  if (!insertRes.ok) {
    const errText = await insertRes.text();
    return res.status(500).json({ error: 'Erreur insertion Supabase: ' + errText, articles: uniqueToInsert });
  }

  return res.status(200).json({
    inserted: uniqueToInsert.length,
    skipped: toInsert.length - uniqueToInsert.length,
    message: `${uniqueToInsert.length} article(s) ajouté(s), ${toInsert.length - uniqueToInsert.length} doublon(s) ignoré(s)`,
    errors: errors.length ? errors : undefined
  });
}