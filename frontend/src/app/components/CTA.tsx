import Link from 'next/link';

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Social proof stars */}
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-purple-600 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
            <span className="ml-2 text-gray-500">Rated 4.9/5 by 100+ users</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            Ready to Land Your
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dream Job?
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of successful job seekers who've increased their interview rates with perfectly tailored resumes. Start your journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/signup">
              <button
                type="button"
                className="flex items-center gap-2 justify-center px-8 py-4 text-lg font-semibold rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition"
              >
                Get Started for Free
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
            
            <Link href="/pricing">
              <button
                type="button"
                className="px-8 py-4 text-lg font-semibold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                View Pricing
              </button>
            </Link>
          </div>

          {/* Contact section with email */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-2">Questions? We're here to help!</p>
            <a 
              href="mailto:hello@tailoresume.com" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                viewBox="0 0 24 24"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              info@tailoresume.com
            </a>
          </div>

          {/* Footer */}
          <div className="pt-8">
            <p className="text-center text-sm text-gray-700">
              &copy; {new Date().getFullYear()} TailoResume. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;