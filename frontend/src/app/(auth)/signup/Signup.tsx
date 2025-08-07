"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, googleProvider } from '@/lib/firebase';
import Logo from "@/app/components/ui/Logo";
import Image from 'next/image';

const db = getFirestore();

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Failed to check email availability');
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if email already exists in our database
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setError('An account with this email already exists. Please sign in instead.');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`, // Redirect URL after verification
        handleCodeInApp: false,
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email: user.email,
        plan: null,
        credits: 2,
        tailorCalls: 0,
        selectCalls: 0,
        createdAt: serverTimestamp(),
        lastCreditRefill: serverTimestamp(),
        emailVerified: false, // Track verification status
      });

      setVerificationSent(true);
      
      // Sign out the user until they verify their email
      await auth.signOut();

    } catch (error: unknown) {
      if (error instanceof Error) {
        // Handle specific Firebase auth errors
        if (error.message.includes('email-already-in-use')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('weak-password')) {
          setError('Password should be at least 6 characters long.');
        } else if (error.message.includes('invalid-email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if email already exists in our database
      if (user.email) {
        const emailExists = await checkEmailExists(user.email);
        if (emailExists) {
          setError('An account with this email already exists. Please sign in instead.');
          // Sign out the user since we won't be creating an account
          await auth.signOut();
          setLoading(false);
          return;
        }
      }

      await setDoc(doc(db, 'users', user.uid), {
        fullName: user.displayName || '',
        email: user.email,
        plan: null,
        credits: 2,
        tailorCalls: 0,
        selectCalls: 0,
        createdAt: serverTimestamp(),
        lastCreditRefill: serverTimestamp(),
        emailVerified: user.emailVerified, // Google accounts are typically pre-verified
      });

      router.push('/plans');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // You'll need to temporarily sign the user back in to resend verification
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      
      await auth.signOut();
      setError(null);
      
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('email-already-in-use')) {
        // User already exists, that's expected for resend
        setError('Verification email sent! Please check your inbox.');
      } else {
        setError('Failed to resend verification email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show verification sent message
  if (verificationSent) {
    return (
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 mt-15">
        <div className="absolute top-6 left-6">
          <Logo />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Check Your Email
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We've sent a verification link to <strong>{email}</strong>
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Please click the link in the email to verify your account before signing in.
              </p>
              
              <div className="mt-6 space-y-4">
                <button
                  onClick={resendVerificationEmail}
                  disabled={loading}
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  {loading ? 'Sending...' : 'Resend verification email'}
                </button>
                
                <div>
                  <Link 
                    href="/login" 
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Back to sign in
                  </Link>
                </div>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-500">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* Custom Logo Top Left */}
      <div className="absolute top-6 left-6">
        <Logo />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-20 text-center text-2xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
              Full name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        {/* OR Divider */}
        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or continue with</span>
          </div>
        </div>

        {/* Google Sign Up */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Google
          </button>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}