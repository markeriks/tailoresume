'use client';

import React, { useState } from 'react';
import Dashboard from './Dashboard';
import DashboardNavbar from '@/app/components/DashNavbar';
import { AnimatePresence, motion } from 'framer-motion';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

export default function DashboardWrapper() {
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleResumeReady = (html: string) => {
    setResumeContent(html);
    setShowEditor(true);
  };

  return (
    <div className="relative h-screen w-full">
      <DashboardNavbar />

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
              <Dashboard setResumeContent={handleResumeReady} />
            </div>
          </motion.div>
        )}

        {showEditor && resumeContent && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 p-5"
          >
            {/* <QuillEditor initialContent={resumeContent} /> */}
            <div className='mt-10'>
              <SimpleEditor resumeContent={resumeContent} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
