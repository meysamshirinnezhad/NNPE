import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/base/Logo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    'Real NPPE Exam Questions',
    'Instant Performance Analytics',
    'Adaptive Learning System'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTest = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/signup');
    }, 1500);
  };

  // Generate grid cells for animated background
  const gridCells = Array.from({ length: 120 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden relative">
      {/* Animated Grid Background with Lights */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-10 gap-1 p-4 opacity-30">
          {gridCells.map((cell) => (
            <div
              key={cell}
              className="light-cell rounded-sm"
              style={{
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />

      {/* Floating Tech Icons */}
      <div className="absolute top-1/4 left-1/4 animate-float opacity-20">
        <i className="ri-code-s-slash-line text-6xl text-cyan-400" />
      </div>
      <div className="absolute top-2/3 right-1/4 animate-float opacity-20" style={{ animationDelay: '1s' }}>
        <i className="ri-brain-line text-6xl text-blue-400" />
      </div>
      <div className="absolute bottom-1/4 left-1/3 animate-float opacity-20" style={{ animationDelay: '2s' }}>
        <i className="ri-lightbulb-flash-line text-6xl text-purple-400" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-8 py-6">
        <Logo />
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-300 hover:scale-105 whitespace-nowrap cursor-pointer"
        >
          Login
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full">
            <span className="text-cyan-400 font-semibold">🚀 Canada's #1 NPPE Prep Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-gradient leading-tight">
            Pass Your NPPE Exam<br />With Confidence
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Practice with real exam questions, get instant feedback, and track your progress with our AI-powered learning platform
          </p>

          {/* Rotating Feature Highlight */}
          <div className="h-8 mb-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-cyan-400">
              <i className="ri-checkbox-circle-fill text-2xl" />
              <span className="text-lg font-semibold animate-fade-in" key={currentFeature}>
                {features[currentFeature]}
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center items-center">
            <button
              onClick={handleStartTest}
              disabled={isLoading}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Start Free Mock Test
                  <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4">No credit card required • 7-day free trial</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: 'ri-trophy-line', value: '95%', label: 'Pass Rate', color: 'from-yellow-400 to-orange-400' },
            { icon: 'ri-team-line', value: '10,000+', label: 'Engineers Trained', color: 'from-blue-400 to-cyan-400' },
            { icon: 'ri-question-answer-line', value: '500+', label: 'Practice Questions', color: 'from-purple-400 to-pink-400' }
          ].map((stat, index) => (
            <div
              key={index}
              className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <i className={`${stat.icon} text-3xl text-white`} />
              </div>
              <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Trusted by Engineers Across Canada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Mechanical Engineer',
                text: 'Passed on my first attempt! The mock tests were incredibly similar to the actual exam.',
                rating: 5
              },
              {
                name: 'Michael Rodriguez',
                role: 'Civil Engineer',
                text: 'The analytics helped me focus on my weak areas. Best investment for my career.',
                rating: 5
              },
              {
                name: 'Priya Patel',
                role: 'Electrical Engineer',
                text: 'Comprehensive question bank and excellent explanations. Highly recommend!',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 animate-slide-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="ri-star-fill text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xl font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center p-12 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl animate-slide-up">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of engineers who have successfully passed their NPPE exam
          </p>
          <button
            onClick={handleStartTest}
            disabled={isLoading}
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <i className="ri-loader-4-line animate-spin" />
                Loading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Start Free Mock Test
                <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-400 text-sm border-t border-white/10">
        <p>&copy; 2024 NPPE Pro. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes light-pulse {
          0%, 100% {
            background-color: rgba(59, 130, 246, 0.1);
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
          }
          50% {
            background-color: rgba(6, 182, 212, 0.3);
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.6);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .light-cell {
          background-color: rgba(59, 130, 246, 0.05);
          animation: light-pulse infinite ease-in-out;
        }

        .light-cell:nth-child(3n) {
          animation-delay: 0.5s;
        }

        .light-cell:nth-child(5n) {
          animation-delay: 1s;
        }

        .light-cell:nth-child(7n) {
          animation-delay: 1.5s;
        }

        .light-cell:nth-child(11n) {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
