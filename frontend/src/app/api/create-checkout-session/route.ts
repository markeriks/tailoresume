import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { priceId, email } = await req.json();

    if (!priceId || !email) {
      return NextResponse.json(
        { error: 'Missing priceId or email in request body' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email, // ✅ lock email – can't be changed by the user
      success_url: `http://tailoresume.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://tailoresume.com/cancel`,
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    const error = err as Error;
    console.error('Stripe error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
