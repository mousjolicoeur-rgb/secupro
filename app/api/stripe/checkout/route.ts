import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // Utiliser la dernière version supportée par les types
});

export async function POST(request: Request) {
  try {
    const { priceId, societeId } = await request.json();

    if (!priceId || !societeId) {
      return NextResponse.json({ error: 'priceId et societeId sont requis' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Création de la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Essai gratuit de 7 jours
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          societeId: societeId, // Très important pour le Webhook
        }
      },
      client_reference_id: societeId, // Passe l'ID de la société
      success_url: `${appUrl}/performance?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
