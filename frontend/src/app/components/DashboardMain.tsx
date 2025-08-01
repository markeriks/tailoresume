'use client';

import React from 'react';
import { Upload, Link, FileText, Sparkles } from 'lucide-react';

interface DashboardMainProps {
  jobUrl: string;
  uploadedFile: File | null;
  isProcessing: boolean;
  setJobUrl: (url: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTailorResume: () => void;
}

export default function DashboardMain({
  jobUrl,
  uploadedFile,
  isProcessing,
  setJobUrl,
  handleFileUpload,
  handleTailorResume,
}: DashboardMainProps) {
  return (
    <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
  Tailor your resume for the job
</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your resume and paste a job posting URL to get a perfectly tailored resume that matches the job requirements.
        </p>
      </div>

      {/* Main Dashboard Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Job URL Input */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Link className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Job Posting URL</h3>
            </div>
            <div className="relative">
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://example.com/job-posting"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <p className="text-sm text-gray-500">
              Paste the URL of the job you're applying for
            </p>
          </div>

          {/* Resume Upload */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Upload Resume</h3>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {uploadedFile ? uploadedFile.name : 'Click to upload .docx file'}
                </span>
              </label>
            </div>
            <p className="text-sm text-gray-500">Only .docx format supported</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleTailorResume}
            disabled={isProcessing || !jobUrl || !uploadedFile}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Tailoring Resume...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Tailor My Resume</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
