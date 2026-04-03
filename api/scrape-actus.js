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
      const prompt = `Tu es un expert en sécurité privée en France. Utilise la recherche web pour trouver les 2 actualités les plus récentes et pertinentes sur : "${q}".

Pour chaque résultat trouvé, génère un JSON array avec ce format exact :
[
  {
    "categorie": "${cat}",
    "titre": "Titre accrocheur de l'actualité",
    "resume": "Résumé clair en 2-3 lignes pour les agents de sécurité",
    "contenu": "Article complet résumé en 6-10 lignes avec les informations essentielles et concrètes pour les professionnels",
    "source": "Nom exact du site source (ex: Légifrance, CNAPS, USP, Syndicat des métiers de la sécurité...)",
    "date_publication": "2026-01-15T00:00:00Z"
  }
]

Règles :
- Inclure uniquement des informations vérifiées et récentes (2025-2026)
- Le contenu doit être utile et concret pour un agent de sécurité privée en France
- Réponds UNIQUEMENT avec le JSON array valide, sans texte avant ou après`;

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
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          articles.push(...parsed);
        }
      } await sleep(30000);
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
  const toInsert = articles.map(a => ({
    categorie: a.categorie,
    titre: String(a.titre || '').slice(0, 500),
    resume: String(a.resume || '').slice(0, 1000),
    contenu: String(a.contenu || ''),
    source: String(a.source || 'SecuPRO').slice(0, 200),
    date_publication: a.date_publication || new Date().toISOString(),
    statut: 'brouillon'
  })).filter(a => a.titre && a.resume && a.contenu);

  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/actualites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(toInsert)
  });

  if (!insertRes.ok) {
    const errText = await insertRes.text();
    return res.status(500).json({ error: 'Erreur insertion Supabase: ' + errText, articles: toInsert });
  }

  return res.status(200).json({
    inserted: toInsert.length,
    message: `${toInsert.length} article(s) ajouté(s) en brouillon`,
    errors: errors.length ? errors : undefined
  });
}
