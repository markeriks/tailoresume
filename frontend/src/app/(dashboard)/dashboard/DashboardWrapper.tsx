'use client';

import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import DashboardNavbar from '@/app/components/DashNavbar';
import Feedback from '@/app/components/Feedback';
import { AnimatePresence, motion } from 'framer-motion';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { auth } from "@/lib/firebase";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export default function DashboardWrapper() {
  const [originalResume, setOriginalResume] = useState<string | null>(null);
  const [modifiedResume, setModifiedResume] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {

      if (currentUser) {
        try {
          const db = getFirestore();
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const userRef = doc(db, "users", currentUser.uid);

            const lastRefill: Timestamp = data.lastCreditRefill || Timestamp.fromMillis(0);
            const now = Timestamp.now();

            const diffInDays = (now.seconds - lastRefill.seconds) / (60 * 60 * 24);

            let creditsToAdd = 0;

            if (diffInDays >= 30) {
              console.log("Adding credits for monthly refill");
              const plan = data.plan;

              if (!plan) {
                creditsToAdd = 2;
              } else if (plan === "Standard Plan") {
                creditsToAdd = 10;
              } else if (plan === "Pro Plan") {
                creditsToAdd = 300;
              }

              await updateDoc(userRef, {
                credits: (data.credits ?? 0) + creditsToAdd,
                lastCreditRefill: serverTimestamp(),
              });

              setCredits((data.credits ?? 0) + creditsToAdd);
            } else {
              setCredits(data.credits ?? 0);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user credits:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleResumeReady = (original: string, modifiedPromise: Promise<string>) => {
    setOriginalResume(original);
    setShowEditor(true);
    setShowSidebar(true);

    modifiedPromise.then(modified => {
      setModifiedResume(modified);
    });
  };

  const handleNewResume = () => {
    setShowEditor(false);
    setOriginalResume(null);
    setModifiedResume(null);
    setJobTitle(null);
    setShowSidebar(false);
  };

  return (
    <div className="relative h-screen w-full">
      <DashboardNavbar
        credits={credits}
        showSidebar={showSidebar}
        onNewResume={handleNewResume}
        onSendFeedback={() => {
          setShowFeedback(true);
        }}
      />

      <AnimatePresence mode="wait">
        {!showEditor && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-start justify-center"
          >
            <div className="w-full max-w-[1000px] px-4">
              <Dashboard
                setResumeContent={handleResumeReady}
                setJobTitle={setJobTitle}
                setCredits={setCredits}
                credits={credits}
              />
            </div>
          </motion.div>
        )}

        {showEditor && originalResume && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 p-5"
          >
            <div className="mt-10">
              <SimpleEditor
                originalResume={originalResume}
                modifiedResume={modifiedResume}
                jobTitle={jobTitle}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Feedback onClose={() => setShowFeedback(false)} />
        </div>
      )}
    </div>
  );
}
