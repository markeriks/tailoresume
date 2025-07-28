// src/app/page.tsx

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import CTA from './components/CTA';

export const metadata = {
  title: 'TailoResume - Tailor Your Resume Instantly',
  description: 'Tailor your resume to any job posting in minutes with AI-powered optimization.',
  themeColor: '#ffffff',
  openGraph: {
    title: 'TailoResume',
    description: 'AI-powered resume tailoring for job seekers',
    url: 'https://yourdomain.com',
    siteName: 'TailoResume',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TailoResume Open Graph Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TailoResume',
    description: 'AI-powered resume tailoring for job seekers',
    creator: '@yourtwitterhandle',
    images: ['/og-image.png'], // optional
  },
};


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      {/* Add more components as needed */}
    </>
  );
}
