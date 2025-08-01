'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardMain from '@/app/components/DashboardMain';
import * as mammoth from 'mammoth';

interface DashboardProps {
  setResumeContent: (html: string) => void;
}

export default function TailoResumeDashboard({ setResumeContent }: DashboardProps) {
  const [jobUrl, setJobUrl] = useState<string>("https://example.com/job-posting");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close profile modal on outside click
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
      // Read the uploaded file as an ArrayBuffer
      const arrayBuffer = await uploadedFile.arrayBuffer();

      // Use mammoth to convert docx to HTML
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

      // Set the converted HTML content into your state
      setResumeContent(html);
    } catch (error) {
      console.error('Failed to parse docx:', error);
      alert('Failed to load resume content.');
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
