'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import logo from '@/app/assets/logo.png';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getFirestore, increment, updateDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);
    const [planName, setPlanName] = useState<string | null>(null);
    const [userVerified, setUserVerified] = useState(false);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user || !sessionId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/checkout-session?session_id=${sessionId}`);
                const session = await res.json();

                const productName: string =
                    session?.line_items?.data?.[0]?.price?.product?.name || 'Unknown';
                setPlanName(productName);

                const db = getFirestore();
                const userRef = doc(db, 'users', user.uid);

                let creditsToAdd = 0;
                if (/standard/i.test(productName)) {
                    creditsToAdd = 20;
                } else if (/pro/i.test(productName)) {
                    creditsToAdd = 300;
                }

                if (creditsToAdd > 0) {
                    await updateDoc(userRef, {
                        credits: increment(creditsToAdd),
                        lastCreditRefill: serverTimestamp(),
                        plan: productName,
                    });
                    setUserVerified(true);
                }
            } catch (err) {
                console.error('Error updating credits:', err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [sessionId]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-white text-center px-4 pb-10">
            {/* Logo centered */}
            <div className="mb-8">
                <Image
                    src={logo}
                    alt="App Logo"
                    width={70}
                    height={70}
                    priority
                />
            </div>
            <h1 className="text-3xl font-bold mb-4">🎉 Payment Successful!</h1>

            {loading ? (
                <p className="text-gray-600">Finalizing your subscription...</p>
            ) : userVerified ? (
                <>
                    <p className="text-gray-700 mb-2">
                        You’re now subscribed{planName ? ` to the ${planName}` : ''}.
                    </p>
                    <p className="text-gray-500 mb-10">
                        {planName?.toLowerCase().includes('pro') ? '300' : '20'} credits have been added to your
                        account.
                    </p>
                    <Link href="/dashboard">
                        <button className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition">
                            Go to Dashboard
                        </button>
                    </Link>

                </>
            ) : (
                <>
                    <p className="text-red-500 font-semibold">Something went wrong. Please contact support.</p>
                    <p className="text-red-500 font-semibold mb-10">info@tailoresume.com</p>
                    <Link href="/dashboard">
                        <button className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition">
                            Go to Dashboard
                        </button>
                    </Link>

                </>
            )}
        </div>
    );
}
