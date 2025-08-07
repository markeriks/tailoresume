import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Try to find existing Stripe customer by email
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // No existing customer found — return an error
      return NextResponse.json(
        { error: 'No Stripe customer found for the given email' },
        { status: 404 }
      );
    }

    // Create the billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://tailoresume.com/dashboard',
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Error creating customer portal session:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to create customer portal session', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
