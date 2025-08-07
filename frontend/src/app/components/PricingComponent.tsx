'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

type PricingComponentProps = {
  title?: string;
};

type BillingPeriod = 'monthly' | 'quarterly';

type PlanPricing = {
  price: number;
  period: string;
};

type PlansData = {
  monthly: {
    free: PlanPricing;
    standard: PlanPricing;
    pro: PlanPricing;
  };
  quarterly: {
    free: PlanPricing;
    standard: PlanPricing;
    pro: PlanPricing;
  };
};

export default function PricingComponent({ title }: PricingComponentProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('quarterly');

  const priceIdMap = {
    standard: {
      monthly: 'price_1Rs64BGvBUCut5qmT1nvGJpv',
      quarterly: 'price_1Rs66VGvBUCut5qmYuWWav6W',
    },
    pro: {
      monthly: 'price_1Rs673GvBUCut5qmnhPP9GNQ',
      quarterly: 'price_1Rs67xGvBUCut5qmCZ0ahVfV',
    },
  };

  const plans: PlansData = {
    monthly: {
      free: { price: 0, period: 'per month' },
      standard: { price: 10, period: 'per month' },
      pro: { price: 20, period: 'per month' }
    },
    quarterly: {
      free: { price: 0, period: 'per quarter' },
      standard: { price: 24, period: 'per quarter' },
      pro: { price: 48, period: 'per quarter' }
    }
  };

  const features = {
    free: [
      '2 tailored resumes per month',
      'Basic ATS keyword optimization',
      'Upload and edit your resume'
    ],
    standard: [
      'Everything in Free +',
      'Up to 20 tailored resumes per month',
      'Full ATS optimization and keyword matching',
      'Export in PDF format',
      'Dedicated email support'
    ],
    pro: [
      'Everything in Standard +',
      '300 tailored resumes per month',
      'Enhanced resume personalization',
      'Export in PDF format',
      'Priority email support',
      'Early access to new features'
    ]
  };

  const currentPricing = plans[billingPeriod];

  const handleSubscribe = async (plan: 'standard' | 'pro') => {
    const priceId = priceIdMap[plan][billingPeriod];

    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert('Error starting checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-5xl font-bold text-gray-900 mb-14 text-center">
            {title}
          </h2>
        )}

        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-lg flex relative">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingPeriod === 'monthly'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('quarterly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingPeriod === 'quarterly'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Quarterly
            </button>
            <div className="absolute -top-4 -right-5 z-10">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                Best Value
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            label="Free"
            color="bg-green-500"
            price={currentPricing.free.price}
            billingPeriod={billingPeriod}
            period={currentPricing.free.period}
            features={features.free}
            buttonLabel="Get started"
            isFree
          />
          <PricingCard
            label="Standard"
            color="bg-blue-500"
            price={billingPeriod === 'quarterly' ? (currentPricing.standard.price / 3).toFixed(0) : currentPricing.standard.price}
            billingPeriod={billingPeriod}
            period={currentPricing.standard.period}
            features={features.standard}
            buttonLabel="Subscribe"
            badge="Popular"
            discount={billingPeriod === 'quarterly'}
            onSubscribe={() => handleSubscribe('standard')}
          />
          <PricingCard
            label="Pro"
            color="bg-purple-500"
            price={billingPeriod === 'quarterly' ? (currentPricing.pro.price / 3).toFixed(0) : currentPricing.pro.price}
            billingPeriod={billingPeriod}
            period={currentPricing.pro.period}
            features={features.pro}
            buttonLabel="Subscribe"
            discount={billingPeriod === 'quarterly'}
            onSubscribe={() => handleSubscribe('pro')}
          />
        </div>
      </div>
    </div>
  );
}

type CardProps = {
  label: string;
  color: string;
  price: number | string;
  billingPeriod: BillingPeriod;
  period: string;
  features: string[];
  buttonLabel: string;
  badge?: string;
  discount?: boolean;
  onSubscribe?: () => void;
  isFree?: boolean;
};

function PricingCard({
  label,
  color,
  price,
  billingPeriod,
  period,
  features,
  buttonLabel,
  badge,
  discount,
  onSubscribe,
  isFree,
}: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 relative">
      {badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
            {badge}
          </span>
        </div>
      )}

      <div className="flex items-center mb-4">
        <div className={`w-2 h-2 ${color} rounded-full mr-3`} />
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-gray-900">{price}€</span>
          {discount && (
            <span className="ml-3 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
              20% off
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mt-1">
          {label === 'Free'
            ? 'per month'
            : billingPeriod === 'quarterly'
              ? 'per month, billed every 3 months'
              : period}
        </p>
      </div>

      {isFree ? (
        <Link href="/dashboard">
          <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors mb-8">
            {buttonLabel}
          </button>
        </Link>
      ) : (
        <button
          onClick={onSubscribe}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors mb-8"
        >
          {buttonLabel}
        </button>
      )}

      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
