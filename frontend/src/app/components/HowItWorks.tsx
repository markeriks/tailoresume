const HowItWorks = () => {
  const steps = [
    {
      icon: (
        <svg
          className="w-8 h-8 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          {/* Link icon placeholder */}
          <path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
          <path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
        </svg>
      ),
      step: "01",
      title: "Paste Job Link",
      description:
        "Simply copy and paste the job posting URL from any job board like LinkedIn, Indeed, or company websites.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          {/* Upload icon placeholder */}
          <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          <path d="M12 12v9" />
          <path d="M16 8l-4-4-4 4" />
        </svg>
      ),
      step: "02",
      title: "Upload Resume",
      description:
        "Upload your existing resume in PDF, Word, or text format. Our AI will analyze your experience and skills.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          {/* Wand icon placeholder */}
          <path d="M15 12l6 6" />
          <path d="M18 7l-4 4" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      step: "03",
      title: "AI Magic",
      description:
        "Our intelligent system analyzes the job requirements and tailors your resume to highlight the most relevant qualifications.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          {/* Download icon placeholder */}
          <path d="M12 3v12" />
          <path d="M8 15l4 4 4-4" />
          <path d="M4 21h16" />
        </svg>
      ),
      step: "04",
      title: "Download & Apply",
      description:
        "Get your perfectly tailored resume in seconds. Download and submit your optimized application with confidence.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get your tailored resume in 4 simple steps. No complex setup, no learning curve.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 opacity-30"></div>
              )}

              <div className="text-center h-full bg-white bg-opacity-50 backdrop-blur-sm border border-gray-300 hover:border-blue-600 transition-all duration-300 hover:shadow-lg group rounded-lg">
                <div className="p-6 space-y-4">
                  <div className="relative mx-auto w-16 h-16">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
