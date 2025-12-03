import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Activity, Utensils, Trophy } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Track Your Fitness",
    description: "Log your workouts, monitor your progress, and crush your goals with precision.",
    icon: Activity,
    color: "text-blue-400",
    bg: "bg-blue-400/10"
  },
  {
    id: 2,
    title: "AI Nutrition",
    description: "Snap a photo of your meal and let our AI analyze calories and macros instantly.",
    icon: Utensils,
    color: "text-[#00E376]",
    bg: "bg-[#00E376]/10"
  },
  {
    id: 3,
    title: "Achieve Greatness",
    description: "Join a community of winners and transform your lifestyle today.",
    icon: Trophy,
    color: "text-purple-400",
    bg: "bg-purple-400/10"
  }
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    // Save onboarding status if needed
    localStorage.setItem('hasOnboarded', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#05100a] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#00E376]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Content Container */}
      <div className={`w-full max-w-md flex flex-col items-center text-center transition-opacity duration-300 ${isAnimating ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'}`}>

        {/* Icon Circle */}
        <div className={`w-32 h-32 rounded-full ${slides[currentSlide].bg} flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-bounce-slow`}>
          {React.createElement(slides[currentSlide].icon, {
            size: 48,
            className: slides[currentSlide].color
          })}
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
          {slides[currentSlide].title}
        </h1>
        <p className="text-gray-400 text-lg mb-12 leading-relaxed">
          {slides[currentSlide].description}
        </p>

        {/* Indicators */}
        <div className="flex gap-2 mb-12">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-[#00E376]' : 'w-2 bg-white/20'
                }`}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={nextSlide}
          className="w-full bg-[#00E376] text-black font-bold py-4 rounded-2xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,227,118,0.3)]"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          <ChevronRight size={20} />
        </button>

        {/* Skip Link */}
        {currentSlide < slides.length - 1 && (
          <button
            onClick={completeOnboarding}
            className="mt-6 text-sm text-gray-500 hover:text-white transition"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};