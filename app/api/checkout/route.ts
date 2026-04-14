import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
})

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json()
    
    // Initialisation simple de Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // LA CORRECTION : On utilise await devant cookies() car tu es sur Next.js 15
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    // On récupère l'utilisateur proprement
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Veuillez vous reconnecter' }, { status: 401 })
    }

    // Création de la session Stripe
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/agent?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/abonnement`,
      metadata: { userId: user.id },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}