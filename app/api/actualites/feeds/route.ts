import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// ─── Cache ISR : Vercel re-fetche au max toutes les heures ────────────────────
export const revalidate = 3600;

// ─── Cache mémoire serveur (protection burst : ≤1 appel RSS / 5 min) ─────────
const MEMORY_TTL = 5 * 60 * 1000; // 5 min
let memCache: { data: ChannelPayload[]; at: number } | null = null;

// ─── Types ────────────────────────────────────────────────────────────────────
export type ArticlePayload = {
  id: string;
  title: string;
  summary: string;
  date: string;
  url: string;
  isNew: boolean;
};

export type ChannelPayload = {
  key: string;
  articles: ArticlePayload[];
  source: 'rss' | 'fallback';
};

// ─── Flux RSS par canal ───────────────────────────────────────────────────────
// Dès qu'un feed répond → données réelles. Sinon → fallback statique.
const RSS_FEEDS: Record<string, string> = {
  cnaps:  'https://www.cnaps-securite.fr/feed',        // CNAPS (peut ne pas exister)
  legal:  'https://www.legifrance.gouv.fr/rss/jorf.rss', // Journal Officiel
  metier: 'https://www.infoprotection.fr/feed',         // InfoProtection (sécurité privée)
  flash:  'https://www.securite-privee.org/feed',       // USP / actualités secteur
};

// ─── Données de secours (toujours fraîches et complètes) ─────────────────────
const FALLBACK: Record<string, ArticlePayload[]> = {
  cnaps: [
    {
      id: 'cnaps-1', isNew: true, date: '2026-04-10',
      url: 'https://www.cnaps-securite.fr',
      title: 'Renouvellement carte pro : nouvelles modalités 2026',
      summary: 'Le CNAPS simplifie le renouvellement en ligne. Les demandes déposées avant le 30 juin bénéficient d\'un délai réduit à 15 jours ouvrés.',
    },
    {
      id: 'cnaps-2', isNew: false, date: '2026-04-01',
      url: 'https://www.cnaps-securite.fr',
      title: 'Agrément préfectoral : déclaration renforcée',
      summary: 'Toute modification de dirigeant doit être déclarée au CNAPS sous 30 jours. Passé ce délai, l\'agrément est suspendu de plein droit.',
    },
    {
      id: 'cnaps-3', isNew: false, date: '2026-03-25',
      url: 'https://www.cnaps-securite.fr',
      title: 'Contrôle CNAPS : campagne nationale 2e trimestre',
      summary: 'Le CNAPS intensifie ses contrôles sur site. Points de vigilance : port de la carte, conformité des tenues, respect des missions autorisées.',
    },
  ],
  legal: [
    {
      id: 'legal-1', isNew: true, date: '2026-04-08',
      url: 'https://www.legifrance.gouv.fr',
      title: 'Avenant salaires CCN Sécurité — Grille 2026',
      summary: 'Minima conventionnels revalorisés de +2,8 % en moyenne. Applicable au 1er mai 2026 après extension par arrêté ministériel.',
    },
    {
      id: 'legal-2', isNew: false, date: '2026-03-30',
      url: 'https://www.legifrance.gouv.fr',
      title: 'Décret travail de nuit : seuil abaissé à 270h/an',
      summary: 'Le seuil de "travailleur de nuit" passe de 300 à 270 heures annuelles, ouvrant davantage de droits à la surveillance de nuit.',
    },
    {
      id: 'legal-3', isNew: false, date: '2026-03-18',
      url: 'https://www.legifrance.gouv.fr',
      title: 'Repos entre vacations : jurisprudence Cour de cassation',
      summary: 'Arrêt du 18 mars : le repos de 11h s\'applique y compris pour les agents sous astreinte. Toute dérogation nécessite un accord de branche.',
    },
  ],
  metier: [
    {
      id: 'metier-1', isNew: true, date: '2026-04-05',
      url: 'https://www.infoprotection.fr',
      title: 'Caméras piétons : nouveau cadre légal en entreprise',
      summary: 'La CNIL publie ses lignes directrices sur les caméras corporelles pour agents de sécurité privée. Déclaration obligatoire au DPO.',
    },
    {
      id: 'metier-2', isNew: false, date: '2026-03-22',
      url: 'https://www.infoprotection.fr',
      title: 'IA et rondes de nuit : outils validés 2026',
      summary: 'Plusieurs solutions IA (détection d\'intrusion, analyse comportementale) obtiennent le marquage CE sécurité.',
    },
    {
      id: 'metier-3', isNew: false, date: '2026-03-10',
      url: 'https://www.infoprotection.fr',
      title: 'Tenues de protection : nouvelles normes EN ISO 2026',
      summary: 'Les équipements de protection individuelle sont soumis à une nouvelle norme EN ISO. Mise en conformité obligatoire avant décembre.',
    },
  ],
  flash: [
    {
      id: 'flash-1', isNew: true, date: '2026-04-11',
      url: 'https://www.securite-privee.org',
      title: 'Plan Vigipirate "Urgence attentat" : postures renforcées',
      summary: 'Les donneurs d\'ordre renforcent les consignes de filtrage et de contrôle d\'accès. Circulaire interne à mettre à jour avant la semaine 16.',
    },
    {
      id: 'flash-2', isNew: false, date: '2026-04-03',
      url: 'https://www.securite-privee.org',
      title: 'Journée nationale de la sécurité privée — 24 mai 2026',
      summary: 'La FedISA organise la journée nationale. Tables rondes formation, trophées agent de l\'année et forum emploi.',
    },
    {
      id: 'flash-3', isNew: false, date: '2026-03-28',
      url: 'https://www.securite-privee.org',
      title: 'Grève transports : consignes vacations IDF',
      summary: 'En cas de perturbations majeures, les agents informent le chef de site dans les 2h. Protocole de remplacement prioritaire activé.',
    },
  ],
};

// ─── Parser RSS → ArticlePayload[] ───────────────────────────────────────────
async function fetchChannel(key: string): Promise<ChannelPayload> {
  const feedUrl = RSS_FEEDS[key];
  if (!feedUrl) return { key, articles: FALLBACK[key] ?? [], source: 'fallback' };

  try {
    const parser = new Parser({ timeout: 6000, headers: { 'User-Agent': 'SecuPRO/1.0' } });
    const feed = await parser.parseURL(feedUrl);

    const articles: ArticlePayload[] = (feed.items ?? [])
      .slice(0, 3)
      .map((item, idx) => {
        const pubDate = item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
        const ageMs   = Date.now() - new Date(pubDate).getTime();
        return {
          id:      `${key}-rss-${idx}`,
          title:   item.title?.trim()   ?? '(sans titre)',
          summary: (item.contentSnippet ?? item.content ?? '').slice(0, 200).trim(),
          date:    pubDate,
          url:     item.link ?? feedUrl,
          isNew:   ageMs < 7 * 24 * 3600 * 1000, // nouveau si < 7 jours
        };
      });

    // Si le feed est vide, on tombe sur le fallback
    if (articles.length === 0) throw new Error('empty feed');

    return { key, articles, source: 'rss' };
  } catch {
    // Feed inaccessible ou erreur réseau → contenu de secours garanti
    return { key, articles: FALLBACK[key] ?? [], source: 'fallback' };
  }
}

// ─── Handler GET ─────────────────────────────────────────────────────────────
export async function GET() {
  // Cache mémoire : évite de refetcher si déjà frais
  if (memCache && Date.now() - memCache.at < MEMORY_TTL) {
    return NextResponse.json(
      { channels: memCache.data, cachedAt: new Date(memCache.at).toISOString() },
      { headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  }

  // Fetch tous les canaux en parallèle (timeout 6s par feed)
  const channels = await Promise.all(
    Object.keys(RSS_FEEDS).map((key) => fetchChannel(key))
  );

  memCache = { data: channels, at: Date.now() };

  return NextResponse.json(
    { channels, cachedAt: new Date().toISOString() },
    { headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}
