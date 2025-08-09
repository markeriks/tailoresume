'use client';

import Image from 'next/image';
import Video from 'next-video'
import heroVideo from '/videos/heroVideo.mov';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import heroImage from '@/app/assets/hero-image.jpg';
import rejected from '@/app/assets/rejected.png';

const Hero = () => {
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Replace this with your actual Mux playback ID
  const MUX_PLAYBACK_ID = "Ze9oTouw02RS2tTJKQHd4nPnRLpFKq9Kb58tfuu6jG3o";

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true);
    
    // Check if device is mobile
    const checkMobile = () => {
      return window.matchMedia('(max-width: 767px)').matches;
    };

    // Get preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial state
    const isCurrentlyMobile = checkMobile();
    setIsMobile(isCurrentlyMobile);
    setShouldAutoplay(!isCurrentlyMobile && !prefersReducedMotion.matches);

    // Listen for screen size changes
    const mobileMediaQuery = window.matchMedia('(max-width: 767px)');
    
    const handleMobileChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      // Update autoplay when screen size changes
      setShouldAutoplay(!e.matches && !prefersReducedMotion.matches);
    };

    mobileMediaQuery.addEventListener('change', handleMobileChange);

    // Cleanup
    return () => mobileMediaQuery.removeEventListener('change', handleMobileChange);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-gray-100 overflow-hidden px-4 lg:px-8 xl:px-16 2xl:px-24 pt-24 pb-16">

      {/* Background decorative gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%)] opacity-5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#8b5cf6_0%,transparent_50%)] opacity-5"></div>

      <div className="w-full max-w-[1600px] mx-auto grid lg:grid-cols-2 gap-12 xl:gap-16 2xl:gap-24 items-center">
        {/* Left content */}
        <div className="space-y-8 animate-in slide-in-from-left duration-1000 lg:pl-4 xl:pl-8">
          <div className="space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4 -4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
              </svg>
              Trusted by 500+ job seekers
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-gray-900 leading-tight">
              <span className="whitespace-nowrap">Tailor Your Resume to</span><br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Any Job </span>
              <br />
              in Minutes
            </h1>

            {/* Description */}
            <p className="text-lg xl:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Simply paste any job posting link and let our AI instantly customize your resume to match the requirements.
              Stand out from the crowd and catch recruiters' attention.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/signup">
              <button
                type="button"
                className="relative z-40 flex items-center gap-2 justify-center px-8 py-4 xl:px-10 xl:py-5 text-lg xl:text-xl font-semibold rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition"
              >Start tailoring now
              </button>
            </Link>

            <div className="flex items-center gap-2 px-4 py-4 xl:px-6 xl:py-5 text-gray-600 font-bold justify-start sm:justify-center">
              <Image src={rejected} alt="No credit card" width={40} height={40} className="xl:w-12 xl:h-12" />
              <span className="xl:text-lg">No credit card required</span>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 xl:gap-8 pt-4">
            <div className="text-center">
              <div className="text-2xl xl:text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm xl:text-base text-gray-500">Resumes Tailored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl xl:text-3xl font-bold text-gray-900">2x</div>
              <div className="text-sm xl:text-base text-gray-500">Interview Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl xl:text-3xl font-bold text-gray-900">&lt; 1 min</div>
              <div className="text-sm xl:text-base text-gray-500">Processing Time</div>
            </div>
          </div>
        </div>

        {/* Right content - Hero video with image fallback */}
        <div className="relative animate-in slide-in-from-right duration-1000 delay-300 lg:pr-4 xl:pr-8">
          <div className="relative z-10 max-w-full mx-auto">
            <div className="relative">
              {/* Image - always rendered but hidden on desktop when video loads */}
              <Image
                src={heroImage}
                alt="TailoResume dashboard showing AI-powered resume optimization"
                className={`w-full h-auto rounded-2xl shadow-2xl ring-1 ring-gray-200 transition-opacity duration-500 ${
                  isClient && !isMobile && !videoError ? 'opacity-0 absolute inset-0' : 'opacity-100'
                }`}
                priority
              />
              
              {/* Video - only rendered on desktop after client hydration */}
              {isClient && !isMobile && !videoError && (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200 opacity-100 transition-opacity duration-500 delay-300">
                  <Video
                    src={heroVideo}
                    poster={heroImage.src}
                    autoPlay={shouldAutoplay}
                    muted
                    loop
                    playsInline
                    controls={false}
                    preload="metadata"
                    className="w-full h-auto"
                    onError={() => setVideoError(true)}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl blur-xl scale-105 -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;