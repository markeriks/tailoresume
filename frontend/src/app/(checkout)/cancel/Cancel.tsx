'use client';

import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/assets/logo.png';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-center px-4">
      <div className="mb-8">
        <Image
          src={logo}
          alt="App Logo"
          width={70}
          height={70}
          priority
        />
      </div>
      <h1 className="text-3xl font-bold mb-4">Subscription Canceled</h1>
      <p className="text-gray-700 mb-6">
        You canceled the checkout process or it failed. No changes have been made.
      </p>
      <Link href="/plans">
        <button className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition">
          Return to Plans
        </button>
      </Link>
    </div>
  );
}
