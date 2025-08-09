'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

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

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export default function PricingComponent() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('quarterly');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>('credits');

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
      <span key="credits-free">
        <button 
          onClick={() => {
            setExpandedFAQ('credits');
            document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-orange-600 hover:text-orange-700 underline underline-offset-2 decoration-dotted"
        >
          20 credits
        </button> per month
      </span>,
      'Basic ATS keyword optimization',
      'Upload and edit your resume'
    ],
    standard: [
      'Everything in Free +',
      <span key="credits-standard">
        Up to{' '}
        <button 
          onClick={() => {
            setExpandedFAQ('credits');
            document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-orange-600 hover:text-orange-700 underline underline-offset-2 decoration-dotted"
        >
          100 credits
        </button> per month
      </span>,
      'Full ATS optimization and keyword matching',
      'Export in PDF format',
      'Dedicated email support'
    ],
    pro: [
      'Everything in Standard +',
      <span key="credits-pro">
        <button 
          onClick={() => {
            setExpandedFAQ('credits');
            document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-orange-600 hover:text-orange-700 underline underline-offset-2 decoration-dotted"
        >
          500 credits
        </button> per month
      </span>,
      'Enhanced resume personalization',
      'Export in PDF format',
      'Priority email support',
      'Early access to new features'
    ]
  };

  const faqs: FAQ[] = [
    {
      id: 'credits',
      question: 'What are credits and how many do I need?',
      answer: 'Credits are what power TailoResume\'s AI features. Tailoring a full resume costs 5 credits. Quick tweaks or asking questions through the AI toolbar cost 1 credit each, making it easy to adjust your resume or get instant help whenever you need.'
    },
    {
      id: 'ats',
      question: 'How does ATS optimization work?',
      answer: 'Our AI scans job postings to find the most important skills, keywords, and requirements that Applicant Tracking Systems (ATS) are looking for. Then, it weaves those elements into your resume in a natural way—so it\'s both ATS-friendly and easy for real people to read. This boosts your chances of getting past the filters and in front of recruiters.'
    },
    {
      id: 'formats',
      question: 'What file formats do you support?',
      answer: 'You can upload resumes in DOCX format or paste your resume text directly into our platform. All optimized resumes can be exported as professional PDF files, which is the preferred format for most job applications and ATS systems.'
    },
    {
      id: 'quality',
      question: 'Will my resume still sound authentic after AI optimization?',
      answer: 'Absolutely! TailoResume doesn\'t replace your content - it strategically highlights your existing skills and experiences that match the job requirements. The AI maintains your authentic voice while ensuring the most relevant qualifications are prominently featured and properly formatted for maximum impact.'
    },
    {
      id: 'speed',
      question: 'How quickly can I get my tailored resume?',
      answer: 'Our AI processes and optimizes resumes in under 1 minute. Simply paste the job posting link, upload your resume, and you\'ll have a perfectly tailored version ready to download and submit almost instantly.'
    }
  ];

  const currentPricing = plans[billingPeriod];

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI-powered resumes,
            <br />
            human-friendly plans
          </h1>
          <p className="text-xl text-gray-600">
            Designed for every stage of your job search.
          </p>
        </div>

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

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          {/* Free Plan */}
          <PricingCard
            label="Free"
            color="bg-green-500"
            price={currentPricing.free.price}
            billingPeriod={billingPeriod}
            period={currentPricing.free.period}
            features={features.free}
            buttonLabel="Get started"
          />

          {/* Standard Plan */}
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
          />

          {/* Pro Plan */}
          <PricingCard
            label="Pro"
            color="bg-purple-500"
            price={billingPeriod === 'quarterly' ? (currentPricing.pro.price / 3).toFixed(0) : currentPricing.pro.price}
            billingPeriod={billingPeriod}
            period={currentPricing.pro.period}
            features={features.pro}
            buttonLabel="Subscribe"
            discount={billingPeriod === 'quarterly'}
          />
        </div>

        {/* FAQ Section */}
        <div id="faq-section" className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h4 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h4>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
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
  features: (string | React.ReactNode)[];
  buttonLabel: string;
  badge?: string;
  discount?: boolean;
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
  discount
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

      <Link href="/signup">
        <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors mb-8">
          {buttonLabel}
        </button>
      </Link>

      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-sm">
              {typeof feature === 'string' ? feature : feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}