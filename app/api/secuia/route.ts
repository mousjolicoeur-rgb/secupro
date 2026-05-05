import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// On utilise le modèle défini dans les instructions (dans un vrai cas, on vérifierait si la clé est présente)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

const SYSTEM_PROMPT = `Tu es SecuIA, l'assistant expert et officiel de SecuPRO.
Ton rôle est STRICTEMENT limité à répondre aux questions concernant :
- Le droit du travail dans la sécurité privée en France.
- La Convention Collective Nationale des Entreprises de Prévention et de Sécurité (IDCC 1351).
- La réglementation du CNAPS (Conseil National des Activités Privées de Sécurité).
- Les grilles de salaire de la sécurité privée, les coefficients.
- La durée du travail, les temps de pause, les heures supplémentaires, les majorations (nuit, dimanche, jours fériés) applicables à la profession.
- L'obtention, le renouvellement et les conditions liées à la carte professionnelle.

RÈGLE ABSOLUE : Si l'utilisateur pose une question qui sort de ce cadre (par exemple : programmation, cuisine, politique, droit commun hors sécurité privée, etc.), tu DOIS refuser poliment de répondre en expliquant que ton expertise est exclusivement dédiée à la réglementation de la sécurité privée (IDCC 1351) et au CNAPS.

Sois précis, professionnel, et cite les articles de la convention collective ou du code de la sécurité intérieure quand c'est pertinent. Utilise le formatage Markdown pour rendre tes réponses lisibles.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Format de messages invalide.' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Mock de réponse si pas de clé API, utile pour le dev
      console.warn("ANTHROPIC_API_KEY n'est pas définie, utilisation d'un mock.");
      return NextResponse.json({ 
        role: 'assistant', 
        content: "La clé d'API Anthropic n'est pas configurée dans `.env.local`. C'est une réponse de test de SecuIA : Je suis spécialisé dans l'IDCC 1351 et le CNAPS." 
      });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5', // Comme demandé dans les consignes 2026
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content
      })),
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : 'Je ne peux pas répondre sous ce format.';

    return NextResponse.json({ 
      role: 'assistant', 
      content: reply 
    });

  } catch (error: any) {
    console.error('[SecuIA API Error]', error);
    return NextResponse.json({ error: error.message || 'Une erreur est survenue avec SecuIA.' }, { status: 500 });
  }
}
