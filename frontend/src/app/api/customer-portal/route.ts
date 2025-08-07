import { NextRequest, NextResponse } from 'next/server';
import  stripe  from '@/lib/stripe';

interface TokenVerificationResponse {
  user_id: string;
  email: string;
  verified: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const idToken = authHeader?.replace('Bearer ', '');
    
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token with Python backend
    const backendResponse = await fetch(`https://backend-late-snow-4268.fly.dev/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: 'Token verification failed', details: errorData.detail }, 
        { status: backendResponse.status }
      );
    }

    const userData: TokenVerificationResponse = await backendResponse.json();

    if (!userData.verified) {
      return NextResponse.json({ error: 'Token not verified' }, { status: 401 });
    }

    // Try to find existing Stripe customer by email
    const customers = await stripe.customers.list({
      email: userData.email,
      limit: 1,
    });

    let customerId: string;

    if (customers.data.length > 0) {
      // Use existing customer
      customerId = customers.data[0].id;
    } else {
      // Create new customer if none exists
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          firebase_uid: userData.user_id,
        },
      });
      customerId = customer.id;
    }

    // Create the customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'tailoresume.com/dashboard',
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