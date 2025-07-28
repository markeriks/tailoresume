
import Image from 'next/image';
import heroImage from '@/app/assets/hero-image.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-gray-100 overflow-hidden px-4 pt-24 pb-16">

      {/* Background decorative gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%)] opacity-5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#8b5cf6_0%,transparent_50%)] opacity-5"></div>

      <div className="container max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="space-y-8 animate-in slide-in-from-left duration-1000">
          <div className="space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4 -4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
              </svg>
              Trusted by 500+ job seekers
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              Tailor Your Resume to<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Any Job</span>
              <br />
              in Minutes
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              Simply paste any job posting link and let our AI instantly customize your resume to match the requirements.
              Stand out from the crowd and catch recruiters' attention.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex items-center justify-center gap-2 px-8 py-4 text-lg rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-colors">
              Start Tailoring Now
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button className="px-8 py-4 text-lg rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
              See How It Works
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-500">Resumes Tailored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">2x</div>
              <div className="text-sm text-gray-500">Interview Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">&lt; 3 min</div>
              <div className="text-sm text-gray-500">Processing Time</div>
            </div>
          </div>
        </div>

        {/* Right content - Hero image */}
        <div className="relative animate-in slide-in-from-right duration-1000 delay-300">
          <div className="relative z-10 max-w-[90%] mx-auto">
            <Image
              src={heroImage}
              alt="TailoResume dashboard showing AI-powered resume optimization"
              className="w-full h-auto rounded-2xl shadow-2xl ring-1 ring-gray-200"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl blur-xl scale-105 -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
