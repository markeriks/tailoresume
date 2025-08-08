"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, sendEmailVerification } from "firebase/auth";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, googleProvider } from "@/lib/firebase";
import Logo from "@/app/components/ui/Logo";
import Image from 'next/image';

const db = getFirestore();

export default function Signin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [needsVerification, setNeedsVerification] = useState<boolean>(false);
  const [resendingEmail, setResendingEmail] = useState<boolean>(false);
  const router = useRouter();

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) return;

    setResendingEmail(true);
    setError(null);

    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      setError("Verification email sent! Please check your inbox.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("Failed to send verification email. Please try again.");
      }
    } finally {
      setResendingEmail(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAccountCreatedToday = (createdAt: any): boolean => {
    if (!createdAt) return false;

    // Handle Firestore Timestamp
    const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const today = new Date();

    return (
      createdDate.getDate() === today.getDate() &&
      createdDate.getMonth() === today.getMonth() &&
      createdDate.getFullYear() === today.getFullYear()
    );
  };

  const hasPlan = (plan: unknown): boolean => {
    return plan !== null && plan !== undefined;
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setNeedsVerification(false);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setNeedsVerification(true);
        setError("Please verify your email address before signing in. Check your inbox for a verification link.");
        await auth.signOut(); // Sign out the unverified user
        setLoading(false);
        return;
      }

      // Get user document from Firestore to check creation date and verification status
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Double-check emailVerified status in Firestore (in case it's out of sync)
        if (userData.emailVerified === false) {
          setNeedsVerification(true);
          setError("Please verify your email address before signing in. Check your inbox for a verification link.");
          await auth.signOut();
          setLoading(false);
          return;
        }

        // Check if account was created today AND user doesn't have a plan
        if (isAccountCreatedToday(userData.createdAt) && !hasPlan(userData.plan)) {
          router.push("/plans");
        } else {
          router.push("/dashboard");
        }
      } else {
        // User document doesn't exist, redirect to plans (new account flow)
        router.push("/plans");
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        // Handle specific Firebase auth errors
        if (error.message.includes('user-not-found')) {
          setError('No account found with this email address.');
        } else if (error.message.includes('wrong-password')) {
          setError('Incorrect password. Please try again.');
        } else if (error.message.includes('invalid-email')) {
          setError('Please enter a valid email address.');
        } else if (error.message.includes('too-many-requests')) {
          setError('Too many failed attempts. Please try again later.');
        } else {
          setError(error.message);
        }
      } else {
        setError("Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    setNeedsVerification(false);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email) {
        throw new Error("Google account has no email.");
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if account was created today AND user doesn't have a plan
        if (isAccountCreatedToday(userData.createdAt) && !hasPlan(userData.plan)) {
          router.push("/plans");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Create new user document
        await setDoc(userDocRef, {
          fullName: user.displayName || '',
          email: user.email,
          plan: null,
          credits: 2,
          tailorCalls: 0,
          selectCalls: 0,
          createdAt: serverTimestamp(),
          lastCreditRefill: serverTimestamp(),
          emailVerified: user.emailVerified,
        });

        router.push("/plans");
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* Custom Logo Top Left */}
      <div className="absolute top-6 left-6">
        <Logo />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-20 text-center text-2xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleEmailLogin} className="space-y-6">
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
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm">
              <p className={`font-medium ${error.includes('Verification email sent') ? 'text-green-600' : 'text-red-500'}`}>
                {error}
              </p>
              {needsVerification && (
                <button
                  type="button"
                  onClick={resendVerificationEmail}
                  disabled={resendingEmail}
                  className="mt-2 text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  {resendingEmail ? 'Sending...' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
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

        {/* Google Sign In */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
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
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}