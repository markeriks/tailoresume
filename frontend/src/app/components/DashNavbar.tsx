'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Zap, Menu, Sparkles, MessageSquare } from 'lucide-react';
import { signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import logo from '@/app/assets/logo.png';
import profile from '@/app/assets/profile.jpg';
import { motion, AnimatePresence } from "framer-motion";


interface DashboardNavbarProps {
  credits: number;
  showSidebar: boolean;
  onNewResume?: () => void;
  onSendFeedback?: () => void;
}

export default function DashboardNavbar({ credits, showSidebar, onNewResume, onSendFeedback }: DashboardNavbarProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const profileRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Fetch current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showConfirmPopup) {
      setMobileSidebarOpen(false);
    }
  }, [showConfirmPopup]);

  // Handle outside click to close dropdown
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

  const isGoogleUser = () => user?.providerData.some(p => p.providerId === 'google.com') ?? false;

  const displayName = user
    ? isGoogleUser()
      ? user.displayName ?? user.email ?? 'User'
      : user.email ?? 'User'
    : 'User';

  const displayPhoto = user && isGoogleUser() && user.photoURL ? user.photoURL : profile;

  function SidebarContent() {
    return (
      <>
        <button onClick={() => setShowConfirmPopup(true)} className="w-full flex items-center gap-2 text-left text-gray-800 font-bold px-2 py-3 hover:bg-gray-100 hover:rounded-lg">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          Tailor new resume
        </button>
        <button onClick={onSendFeedback} className="w-full flex items-center gap-2 text-left text-gray-500 font-semibold px-2 py-3 hover:bg-gray-100 hover:rounded-lg hover:text-gray-800">
          <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-gray-800" />
          Send feedback
        </button>
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showConfirmPopup && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md mx-auto"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Are you sure?
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Your current resume will be deleted.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirmPopup(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onNewResume!();
                    setShowConfirmPopup(false);
                  }}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className=" mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo or Menu */}
            <div className="flex items-center gap-2">
              {/* Show menu button only if sidebar is enabled AND viewport is mobile */}
              {showSidebar ? (
                <>
                  {/* Mobile: show menu */}
                  <button className="sm:hidden text-gray-700" onClick={() => setMobileSidebarOpen(prev => !prev)}>
                    <Menu className="w-6 h-6" />
                  </button>

                  {/* Desktop: show logo */}
                  <Link href="/dashboard" className="hidden sm:flex items-center gap-2">
                    <div className="w-8 h-8 relative">
                      <Image src={logo} alt="TailoResume Logo" fill className="object-contain" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">TailoResume</span>
                  </Link>
                </>
              ) : (
                // Always show logo when sidebar is not enabled
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 relative">
                    <Image src={logo} alt="TailoResume Logo" fill className="object-contain" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 hidden sm:inline">TailoResume</span>
                </Link>
              )}
            </div>


            {/* Right Side */}
            <div className="flex items-center space-x-4 font-bold">
              {user && (
                <div className="flex items-center gap-1 text-sm text-gray-700 mr-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>{credits} {credits === 1 ? 'credit' : 'credits'}</span>
                </div>
              )}

              {/* Profile Button */}
              <div className="relative">
                <button
                  ref={profileRef}
                  onClick={() => setProfileOpen(open => !open)}
                  className="flex items-center gap-2 w-auto h-10 rounded-full overflow-hidden px-2 cursor-pointer"
                >
                  <Image
                    src={displayPhoto}
                    alt="User Profile"
                    width={40}
                    height={40}
                    className="object-cover rounded-full"
                  />
                  <ChevronDown
                    className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${profileOpen ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>

                {profileOpen && (
                  <div
                    ref={modalRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                      <Image
                        src={displayPhoto}
                        alt="User Profile"
                        width={40}
                        height={40}
                        className="object-cover rounded-full"
                      />
                      <span className="font-medium text-gray-800 truncate">{displayName}</span>
                    </div>

                    <button
                      onClick={() => {
                        signOut(auth)
                          .then(() => {
                            setProfileOpen(false);
                            router.push('/');
                          })
                          .catch((error) => console.error('Sign-out error:', error));
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 rounded-b-lg"
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

      {/* Conditional Sidebar Rendering */}
      {showSidebar && (
        <>
          {/* Desktop Sidebar (visible always when showSidebar is true and screen is md+) */}
          <aside className="hidden sm:flex fixed left-0 top-10 w-64 h-full bg-white border-l border-gray-200 shadow-lg z-6 pt-10 flex-col p-3 gap-2">
            <SidebarContent />
          </aside>

          {/* Mobile Sidebar (only visible when toggled open) */}
          <AnimatePresence>
            {mobileSidebarOpen && (
              <motion.div
                key="mobile-sidebar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sm:hidden fixed inset-0 z-50 flex"
              >
                {/* Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/50"
                  onClick={() => setMobileSidebarOpen(false)}
                />

                {/* Sidebar panel */}
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="mr-auto w-72 bg-white h-full shadow-lg p-6 flex flex-col gap-6 z-100"
                >
                  {/* Logo */}
                  <div className="flex items-center gap-2 mb-6 mt-16">
                    <div className="w-8 h-8 relative">
                      <Image src={logo} alt="TailoResume Logo" fill className="object-contain" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">TailoResume</span>
                  </div>
                  <SidebarContent />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </>
      )}
    </>
  );
}

