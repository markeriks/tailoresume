import { NextRequest } from 'next/server';
import stripe from '@/lib/stripe';

export async function GET(req: NextRequest) {
  const session_id = req.nextUrl.searchParams.get('session_id');
  if (!session_id) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items.data.price.product'],
    });

    return new Response(JSON.stringify(session), { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error('Error retrieving session:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
