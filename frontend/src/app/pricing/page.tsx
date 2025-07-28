import Navbar from '../components/Navbar';
import Pricing from '../components/Pricing';

export const metadata = {
  title: 'TailoResume Pricing – Choose Your Plan',
  description: 'Flexible pricing for every stage of your job search. Choose from Free, Standard, or Pro to create AI-optimized resumes with confidence.',
  openGraph: {
    title: 'TailoResume Pricing – Choose Your Plan',
    description: 'Explore Free, Standard, and Pro plans designed to help you craft the perfect resume with AI-powered tools.',
    url: 'https://yourdomain.com/pricing',
    siteName: 'TailoResume',
    images: [
      {
        url: 'https://yourdomain.com/og-image.png', // Optional: Replace with your OG image
        width: 1200,
        height: 630,
        alt: 'TailoResume Pricing Plans',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TailoResume Pricing – Choose Your Plan',
    description: 'AI-enhanced resume plans to help you land your dream job. Compare features and choose what fits best.',
    images: ['https://yourdomain.com/og-image.png'],
  },
};

export default function PricingPage() {
  return (
    <>
        <Navbar />
        <Pricing />
    </>
  );
}
