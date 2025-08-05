'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, X } from 'lucide-react';

interface FeedbackPageProps {
  onClose: () => void;
}

export default function FeedbackPage({ onClose }: FeedbackPageProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('https://usebasin.com/f/59de0577d316', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="flex items-center justify-center px-4 relative">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic heading and subtext */}
        {status === 'success' ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Thank you for your feedback!</h1>
            <p className="text-gray-800 mb-6">We appreciate your input and will use it to improve our service.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">We'd love your feedback</h1>
            <p className="text-gray-500 mb-6">Tell us what’s working, what’s not, or what you'd like to see.</p>
          </>
        )}

        {status === 'success' ? (
          <div className="flex items-center gap-3 text-green-600 font-medium">
            <CheckCircle className="w-5 h-5" />
            Your feedback has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="text-sm font-medium text-gray-700 block mb-1">
                Your Feedback
              </label>
              <textarea
                name="message"
                id="message"
                required
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>

            {status === 'error' && (
              <p className="text-red-500 text-sm mt-2">Something went wrong. Please try again.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
