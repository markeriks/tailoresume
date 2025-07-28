const Features = () => {
  const features = [
    {
      icon: (
        <svg
          className="w-6 h-6 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      ),
      title: "AI-Powered Analysis",
      description:
        "Our advanced AI analyzes job postings to extract key requirements, skills, and keywords that matter most to recruiters.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      title: "Minutes, Not Hours",
      description:
        "Transform your resume in under 3 minutes. No more spending hours manually tweaking your resume for each application.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8l4 4-4 4" />
        </svg>
      ),
      title: "Precision Matching",
      description:
        "Intelligently highlight your most relevant experience and skills that directly match the job requirements.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
        </svg>
      ),
      title: "Instant Results",
      description:
        "Get your tailored resume immediately. Perfect for when you need to apply to multiple positions quickly.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      title: "ATS-Optimized",
      description:
        "Ensures your resume passes through Applicant Tracking Systems with proper formatting and keyword optimization.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M3 17l6-6 4 4 8-8" />
        </svg>
      ),
      title: "Proven Results",
      description:
        "Users report 2x higher interview rates and significantly better response rates from employers.",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-purple-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Why Choose TailoResume?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our intelligent platform combines cutting-edge AI with proven recruitment insights to give you the
            competitive edge you need in today's job market.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group border border-gray-300 rounded-lg bg-white bg-opacity-50 backdrop-blur-sm p-6 space-y-4 hover:shadow-lg hover:border-blue-500 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
