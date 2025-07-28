'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Target, Zap, ArrowRight, User, Briefcase, ChevronRight } from 'lucide-react';
import personaImage from '@/app/assets/persona.jpg';

export default function AnnaStorySection() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNextScene = () => {
    setCurrentScene((prev) => (prev + 1) % 3);
  };

  const scenes = [
    {
      title: "The Struggle",
      icon: Clock,
      color: "bg-gray-100 border-gray-200",
      textColor: "text-gray-700",
      description: "Anna spends hours customizing each resume, never knowing if she's highlighting the right skills for each job."
    },
    {
      title: "The Frustration", 
      icon: Target,
      color: "bg-gray-100 border-gray-200",
      textColor: "text-gray-700",
      description: "Despite her qualifications, her applications disappear into the void. Is it her resume format? Wrong keywords?"
    },
    {
      title: "The Solution",
      icon: Zap,
      color: "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-200", 
      textColor: "text-white",
      description: "TailoResume analyzes job postings and tailors her resume instantly, highlighting exactly what recruiters want to see."
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm mb-6">
            <User className="w-4 h-4 mr-2" />
            Meet Anna Martinez
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            From Graduation to 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Dream Job Success
            </span>
          </h2>
        </div>

        {/* Main Story Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Anna's Large Image and Profile */}
          <div className="space-y-8">
            {/* Large Profile Image */}
            <div className="text-center">
              <div className="relative inline-block">
                <Image
                    src={personaImage}
                    alt="Persona image of a professional using TailoResume"
                    className="w-full max-w-md mx-auto h-auto rounded-2xl shadow-2xl ring-1 ring-gray-200"
                    priority
                />
                <div className="absolute -bottom-4 -right-4 bg-white border-4 border-gray-100 rounded-full p-3 shadow-lg">
                  <Briefcase className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Anna Martinez</h3>
                <p className="text-blue-600 font-medium">Software Development Graduate • Austin, TX</p>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  <strong className="text-gray-900">Fresh graduate</strong> with a Software Development degree. 
                  Built impressive projects: a portfolio website, mobile app, and data visualization tool.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900">The problem?</strong> Every job posting wants different skills emphasized. 
                  She's spending more time tweaking resumes than actually applying for jobs.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {['Python', 'React', 'JavaScript', 'Node.js', 'SQL'].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Anna's Quote */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <blockquote className="text-lg text-gray-700 italic mb-4">
                "I know I'm qualified, but I'm drowning in resume versions. Should I emphasize my React project for this frontend role? My Python skills for that data job? I need help matching my experience to what employers actually want."
              </blockquote>
              <cite className="text-blue-600 font-semibold">— Anna's daily struggle</cite>
            </div>
          </div>

          {/* Right Side - Animated Journey */}
          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Anna's Journey</h3>
              
              {/* Animated Scenes */}
              <div className="space-y-6">
                {scenes.map((scene, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentScene(index)}
                    className={`w-full transform transition-all duration-1000 focus:outline-none ${currentScene === index
                            ? 'scale-105 opacity-100'
                            : currentScene < index
                                ? 'opacity-40 scale-95 hover:opacity-70'
                                : 'opacity-60 scale-100 hover:opacity-80'
                        }`}
                  >
                    <div className={`p-6 rounded-xl border text-left ${scene.color} ${
                      currentScene === index ? 'shadow-lg' : 'shadow-sm hover:shadow-md'
                    } transition-shadow duration-300`}>
                      <div className="flex items-center mb-4">
                        <scene.icon className={`w-8 h-8 mr-3 ${scene.textColor === 'text-white' ? 'text-white' : 'text-gray-600'}`} />
                        <h4 className={`text-xl font-bold ${scene.textColor}`}>{scene.title}</h4>
                      </div>
                      <p className={`${scene.textColor === 'text-white' ? 'text-white/90' : 'text-gray-600'} leading-relaxed`}>
                        {scene.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress Indicator with Click Functionality */}
              <div className="flex justify-center mt-8 space-x-4">
                {scenes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentScene(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      currentScene === index 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 scale-125 shadow-lg' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* The Result */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8">
              <div className="text-center">
                <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-gray-900 mb-4">The Transformation</h4>
                <p className="text-gray-700 leading-relaxed mb-6">
                  With TailoResume, Anna goes from spending 2 hours per application to 5 minutes. 
                  Her resumes now speak directly to what each employer wants, and she's landing interviews faster than ever.
                </p>
                <a href="#how-it-works" className="inline-flex items-center text-blue-600 font-semibold">
                    <span>Anna's success story starts here</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            { metric: "2 hours", label: "Wasted per application", color: "text-gray-600" },
            { metric: "5 minutes", label: "With TailoResume", color: "text-blue-600" },
            { metric: "200%", label: "More interviews", color: "text-purple-600" }
          ].map((stat, index) => (
            <div key={index} className="text-center bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.metric}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}