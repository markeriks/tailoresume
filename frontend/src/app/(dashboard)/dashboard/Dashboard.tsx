'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardMain from '@/app/components/DashboardMain';
import * as mammoth from 'mammoth';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, increment, getDoc } from "firebase/firestore";

interface DashboardProps {
  setResumeContent: (original: string, modifiedPromise: Promise<string>) => void;
  setJobTitle: (title: string) => void;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
}

export default function TailoResumeDashboard({ setResumeContent, setJobTitle, setCredits }: DashboardProps) {
  const [jobUrl, setJobUrl] = useState<string>("https://www.linkedin.com/jobs/view/4264440346");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setUploadedFile(file);
    } else {
      alert('Please upload a .docx file');
    }
  };

  const handleTailorResume = async () => {
    if (!jobUrl || !uploadedFile) {
      alert('Please provide both job URL and resume file');
      return;
    }

    setIsProcessing(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        setIsProcessing(false);
        return;
      }

      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("User document does not exist");
        setIsProcessing(false);
        return;
      }

      const userData = userSnap.data();
      const userCredits = userData?.credits ?? 0;

      if (userCredits <= 0) {
        setShowNoCreditsModal(true);
        setIsProcessing(false);
        return;
      }
      // 1. Extract job title & text using Diffbot
      const token = process.env.NEXT_PUBLIC_DIFFBOT_TOKEN!;
      const diffbotUrl = `https://api.diffbot.com/v3/job?token=${token}&url=${encodeURIComponent(jobUrl)}`;

      const diffbotResponse = await fetch(diffbotUrl);
      if (!diffbotResponse.ok) {
        throw new Error(`Diffbot API error: ${diffbotResponse.statusText}`);
      }
      const jobData = await diffbotResponse.json();
      console.log('Extracted job data:', JSON.stringify(jobData, null, 2));

      const jobObj = jobData.objects?.[0];
      const title = jobObj?.title || 'Untitled Job';
      const text = jobObj?.text || '';
      const combinedJobContent = `${title}\n\n${text}`;

      // Set job title
      setJobTitle(title);

      // 2. Convert uploaded resume to HTML
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const { value: originalHtml } = await mammoth.convertToHtml({ arrayBuffer });

      // 3. Send original resume + job data to backend for tailoring

      const idToken = await user.getIdToken();

      await updateDoc(userRef, {
        credits: increment(-1),
        tailorCalls: increment(1)
      });
      setCredits((prevCredits: number) => prevCredits - 1);

      console.log(originalHtml)

      const tailoredResumePromise = fetch('https://backend-late-snow-4268.fly.dev/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          jobContent: combinedJobContent,
          resumeContent: originalHtml,
        }),
      })
        .then(res => {
          if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
          return res.json();
        })
        .then(data => data.tailoredResume || originalHtml)
        .catch(error => {
          console.error("Failed to get tailored resume:", error);
          return originalHtml;
        });

      // Immediately show editor with original, modified loads when ready
      setResumeContent(originalHtml, tailoredResumePromise);
      tailoredResumePromise.then((tailored) => {
        console.log("Tailored Resume:", tailored);
      });
    } catch (error) {
      console.error('Error during tailoring resume:', error);
      alert('An error occurred while tailoring your resume.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardMain
        jobUrl={jobUrl}
        uploadedFile={uploadedFile}
        isProcessing={isProcessing}
        setJobUrl={setJobUrl}
        handleFileUpload={handleFileUpload}
        handleTailorResume={handleTailorResume}
      />
      {showNoCreditsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-2">No Credits Left</h2>
            <p className="mb-4">You’ve run out of resume tailoring credits.</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setShowNoCreditsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
