export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { messages } = req.body;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `Tu es SecuIA, l'assistant intelligent intégré dans SecuPRO, une application pour les agents de sécurité privée en France.

Tu es expert en :
- Droit du travail dans la sécurité privée (Convention collective nationale IDCC 1351)
- Réglementation CNAPS et carte professionnelle APS
- Calcul des salaires, heures supplémentaires, coefficients
- CQP, SSIAP, habilitations professionnelles
- Droits des agents : repos compensateurs, primes, planning légal
- Questions pratiques du quotidien d'un agent de sécurité

Tu réponds en français, de manière claire et concise. Tu es bienveillant et professionnel.
Pour les questions juridiques complexes, conseille de consulter un avocat ou un syndicat.`,
        messages: messages
      })
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
}
