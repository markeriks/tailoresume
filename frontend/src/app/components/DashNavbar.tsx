'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from 'next/navigation';
import logo from '@/app/assets/logo.png';
import profile from '@/app/assets/profile.jpg';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Zap } from 'lucide-react';


export default function DashboardNavbar() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const db = getFirestore();
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setCredits(data.credits ?? 0);
          }
        } catch (error) {
          console.error("Failed to fetch user credits:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to check if user signed in with Google provider
  const isGoogleUser = () => {
    if (!user) return false;
    return user.providerData.some(provider => provider.providerId === "google.com");
  };

  // Determine displayed name & photo
  const displayName = user
    ? isGoogleUser()
      ? user.displayName ?? user.email ?? "User"
      : user.email ?? "User"
    : "User";

  const displayPhoto = user && isGoogleUser() && user.photoURL ? user.photoURL : profile;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Image src={logo} alt="TailoResume Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-bold text-gray-900">TailoResume</span>
          </Link>

          <div className="flex items-center space-x-4 font-bold">
            {user && credits !== null && (
              <div className="flex items-center gap-1 text-sm text-gray-700 mr-4">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>{credits} credits</span>
              </div>
            )}
            {/* Profile button with dropdown */}
            <div className="relative">
              <button
                ref={profileRef}
                aria-label="Profile"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 w-auto h-10 rounded-full overflow-hidden focus:outline-none px-2 cursor-pointer"
                style={{ outline: 'none', border: 'none' }}
              >
                {displayPhoto ? (
                  <Image
                    src={displayPhoto}
                    alt="User Profile"
                    width={40}
                    height={40}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${profileOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  aria-hidden="true"
                />
              </button>

              {profileOpen && (
                <div
                  ref={modalRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-100"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                    {displayPhoto ? (
                      <Image
                        src={displayPhoto}
                        alt="User Profile"
                        width={40}
                        height={40}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-800 truncate">{displayName}</span>
                  </div>

                  {/* Log Out button */}
                  <button
                    onClick={() => {
                      signOut(auth)
                        .then(() => {
                          setProfileOpen(false);
                          router.push('/');
                        })
                        .catch((error) => {
                          console.error("Error signing out:", error);
                        });
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 rounded-b-lg cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
