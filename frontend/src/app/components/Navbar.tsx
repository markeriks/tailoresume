'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Image src={logo} alt="TailoResume Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-bold text-gray-900">TailoResume</span>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isHome ? (
              <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 transition-colors">
                How It Works
              </a>
            ) : (
              <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                Home
              </Link>
            )}
            <Link href="/pricing" className="text-gray-500 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 rounded-md text-gray-700 hover:text-gray-900 transition-colors">Sign In</button>
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">Get Started</button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              {isHome ? (
                <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 transition-colors">
                  How It Works
                </a>
              ) : (
                <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              )}
              <Link href="/pricing" className="text-gray-500 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <button className="text-left px-4 py-2 rounded-md text-gray-700 hover:text-gray-900">
                  Sign In
                </button>
                <button className="text-left px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
