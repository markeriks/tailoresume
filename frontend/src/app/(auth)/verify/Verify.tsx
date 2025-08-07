"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import Logo from "@/app/components/ui/Logo";

const db = getFirestore();

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const actionCode = searchParams.get('oobCode');
      const mode = searchParams.get('mode');

      // Check if this is an email verification request
      if (mode !== 'verifyEmail' || !actionCode) {
        setStatus('error');
        setError('Invalid verification link.');
        return;
      }

      try {
        // First, check if the action code is valid and get info about it
        const info = await checkActionCode(auth, actionCode);
        
        // Apply the email verification
        await applyActionCode(auth, actionCode);

        // Update the user's emailVerified status in Firestore
        if (info.data.email) {
          // We need to find the user by email since we might not have their UID
          // You might want to store the UID in the verification URL instead
          // For now, we'll use the email to find the user document
          
          // Alternative approach: If you have access to the user's UID, use it directly
          // const userRef = doc(db, 'users', userId);
          // await updateDoc(userRef, { emailVerified: true });

          // Since we need to find user by email, we'll need to query
          const { collection, query, where, getDocs, updateDoc: firestoreUpdateDoc } = await import('firebase/firestore');
          
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', info.data.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Update the first matching user document
            const userDoc = querySnapshot.docs[0];
            await firestoreUpdateDoc(userDoc.ref, {
              emailVerified: true,
            });
          }
        }

        setStatus('success');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Email verification error:', error);
        
        if (error.code === 'auth/expired-action-code') {
          setStatus('expired');
          setError('This verification link has expired. Please request a new one.');
        } else if (error.code === 'auth/invalid-action-code') {
          setStatus('error');
          setError('This verification link is invalid or has already been used.');
        } else {
          setStatus('error');
          setError('Failed to verify email. Please try again or contact support.');
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    // Check if there's a continue URL in the search params
    const continueUrl = searchParams.get('continueUrl');
    if (continueUrl) {
      window.location.href = continueUrl;
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 mt-15">
      {/* Custom Logo Top Left */}
      <div className="absolute top-6 left-6">
        <Logo />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Verifying Your Email
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Email Verified Successfully!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your email has been verified. You can now sign in to your account.
              </p>
              
              <div className="mt-6">
                <button
                  onClick={handleContinue}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue to Sign In
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Verification Failed
              </h2>
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
              
              <div className="mt-6 space-y-3">
                <Link 
                  href="/signup"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Request New Verification
                </Link>
                <Link 
                  href="/login"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Verification Link Expired
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                This verification link has expired. Please request a new verification email.
              </p>
              
              <div className="mt-6 space-y-3">
                <Link 
                  href="/signup"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Request New Verification
                </Link>
                <Link 
                  href="/login"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}