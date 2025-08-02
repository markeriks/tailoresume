'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardMain from '@/app/components/DashboardMain';
import * as mammoth from 'mammoth';
import { getAuth } from "firebase/auth";

interface DashboardProps {
  setResumeContent: (original: string, modified: string) => void;
  setJobTitle: (title: string) => void;
}

export default function TailoResumeDashboard({ setResumeContent, setJobTitle }: DashboardProps) {
  const [jobUrl, setJobUrl] = useState<string>("https://example.com/job-posting");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const idToken = await user.getIdToken();

      const backendResponse = await fetch('https://backend-late-snow-4268.fly.dev/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          jobContent: combinedJobContent,
          resumeContent: originalHtml,
        }),
      });

      if (!backendResponse.ok) {
        throw new Error(`Backend API error: ${backendResponse.statusText}`);
      }

      const result = await backendResponse.json();
      const tailoredHtml = result.tailoredResume || originalHtml;

      // 4. Send both original and tailored resumes to wrapper
      setResumeContent(originalHtml, tailoredHtml);
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
    </div>
  );
}
