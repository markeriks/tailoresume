'use client';

import React, { useState, useEffect } from 'react';
import DashboardNavbar from '@/app/components/DashNavbar';
import Feedback from '@/app/components/Feedback';
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
  const [credits, setCredits] = useState<number>(0);
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
                creditsToAdd = 20;
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

  const handleNewResume = () => {
    // Refresh the page to restart the setup flow
    window.location.reload();
  };

  return (
    <div className="relative h-screen w-full">
      <DashboardNavbar
        credits={credits}
        showSidebar={true} // Always show sidebar since we're always in editor mode now
        onNewResume={handleNewResume}
        onSendFeedback={() => {
          setShowFeedback(true);
        }}
      />

      {/* Always show the editor with setup flow */}
      <div className="absolute inset-0 p-5">
        <div className="mt-10">
          <SimpleEditor setCredits={setCredits} />
        </div>
      </div>

      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Feedback onClose={() => setShowFeedback(false)} />
        </div>
      )}
    </div>
  );
}