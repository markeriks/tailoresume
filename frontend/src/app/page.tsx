// src/app/page.tsx

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import CTA from './components/CTA';
import Persona from './components/Persona';

export const metadata = {
  title: 'TailoResume - Tailor Your Resume Instantly',
  description: 'Tailor your resume to any job posting in minutes with AI-powered optimization.',
  themeColor: '#ffffff',
  openGraph: {
    title: 'TailoResume',
    description: 'AI-powered resume tailoring for job seekers',
    url: 'https://tailoresume.com',
    siteName: 'TailoResume',
    images: [
      {
        url: 'https://tailoresume.com/og-image.png',
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
    images: ['https://tailoresume.com/og-image.png'],
  },
};


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Persona />
      <HowItWorks />
      <CTA />
      {/* Add more components as needed */}
    </>
  );
}
