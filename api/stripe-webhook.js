import Stripe from 'stripe';

// Disable body parser — Stripe needs the raw body to verify the signature
export const config = {
  api: { bodyParser: false }
};

const SUPABASE_URL = 'https://ladvecmpjpictubnnnsq.supabase.co';

const PRICE_PLAN_MAP = {
  'price_1TIIyL2MgRlKiK2HV8OIvkwV': 'essentiel',
  'price_1TIIz92MgRlKiK2HuZhM02Id': 'pro',
  'price_1TIJ012MgRlKiK2HLsnto1el': 'premium',
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function updateSupabasePlan(userId, plan) {
  const url = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase update failed: ${text}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        if (userId && plan) {
          await updateSupabasePlan(userId, plan);
          console.log(`Plan updated: user=${userId} plan=${plan}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        // Determine plan from price
        const priceId = sub.items?.data?.[0]?.price?.id;
        const plan = PRICE_PLAN_MAP[priceId];
        if (plan && sub.status === 'active') {
          await updateSupabasePlan(userId, plan);
          console.log(`Subscription updated: user=${userId} plan=${plan} status=${sub.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) {
          await updateSupabasePlan(userId, 'essentiel');
          console.log(`Subscription cancelled: user=${userId} → essentiel`);
        }
        break;
      }

      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    return res.status(500).json({ error: err.message });
  }

  return res.status(200).json({ received: true });
}
