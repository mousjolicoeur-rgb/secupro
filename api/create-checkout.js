import Stripe from 'stripe';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

const PRICE_PLAN_MAP = {
  'price_1TIIyL2MgRlKiK2HV8OIvkwV': 'essentiel',
  'price_1TIIz92MgRlKiK2HuZhM02Id': 'pro',
  'price_1TIJ012MgRlKiK2HLsnto1el': 'premium',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { priceId, userId, userEmail } = req.body;
  if (!priceId || !userId) return res.status(400).json({ error: 'priceId and userId are required' });
  if (!PRICE_PLAN_MAP[priceId]) return res.status(400).json({ error: 'Invalid priceId' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const plan = PRICE_PLAN_MAP[priceId];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId, plan },
      },
      metadata: { userId, plan },
      customer_email: userEmail || undefined,
      success_url: 'https://secupro.vercel.app/app.html?payment=success&plan=' + plan,
      cancel_url: 'https://secupro.vercel.app/app.html?payment=cancel',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
