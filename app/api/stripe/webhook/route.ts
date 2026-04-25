import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeB2BEmail } from '@/lib/emails';
import { z } from 'zod';

const stripeCheckoutSchema = z.object({
  client_reference_id: z.string().uuid("societeId invalide"),
  subscription: z.string().min(1),
  customer: z.string().min(1)
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

// Initialise un client Supabase admin pour bypasser le RLS dans le webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing stripe signature or secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Validation Zod des propriétés du payload Stripe
        const validated = stripeCheckoutSchema.safeParse({
          client_reference_id: session.client_reference_id,
          subscription: session.subscription,
          customer: session.customer
        });

        if (!validated.success) {
          console.error('Payload Stripe invalide :', validated.error.errors);
          break;
        }

        const societeId = validated.data.client_reference_id;
        const subscriptionId = validated.data.subscription;
        const customerId = validated.data.customer;

        // Récupérer le plan à partir du produit/prix souscrit
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        
        // Déterminer le plan en fonction de l'ID (mocké ici, à adapter avec les vrais IDs)
        let plan = 'gratuit';
        if (priceId.includes('essentiel')) plan = 'essentiel';
        if (priceId.includes('pro')) plan = 'pro';
        if (priceId.includes('premium')) plan = 'premium';

        // Mettre à jour la base de données
        const { error } = await supabaseAdmin
          .from('societes')
          .update({
            plan: plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq('id', societeId);

        if (error) {
          console.error('Error updating societe after checkout:', error);
          throw error;
        }
        
        console.log(`[Stripe] Societe ${societeId} updated to plan ${plan}`);

        // ENVOI EMAIL DE BIENVENUE
        try {
          // On récupère le nom et l'email de la société pour l'email
          const { data: soc } = await supabaseAdmin
            .from('societes')
            .select('nom, email_contact')
            .eq('id', societeId)
            .single();

          if (soc && soc.email_contact) {
            await sendWelcomeB2BEmail(soc.email_contact, soc.nom, plan);
            console.log(`[Email] Bienvenue envoyé à ${soc.email_contact}`);
          }
        } catch (emailErr) {
          console.error('[Email] Erreur envoi bienvenue:', emailErr);
        }

        break;
      }
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const customerId = subscription.customer as string;

        // Si l'abonnement est annulé ou impayé, on repasse en gratuit
        if (status === 'canceled' || status === 'unpaid') {
          const { error } = await supabaseAdmin
            .from('societes')
            .update({ plan: 'gratuit' })
            .eq('stripe_customer_id', customerId);
            
          if (error) console.error('Error updating societe on sub deletion:', error);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Webhook handler failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
