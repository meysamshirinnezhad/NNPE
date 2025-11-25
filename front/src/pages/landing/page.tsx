
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { updateSEO, seoData } from '../../utils/seo';
import LoadingSpinner from '../../components/effects/LoadingSpinner';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    updateSEO(seoData.landing);
  }, []);

  const features = [
    {
      icon: 'ri-book-open-line',
      title: 'Comprehensive Study Materials',
      description: 'Access 500+ practice questions, video tutorials, and detailed explanations covering all NPPE exam topics.'
    },
    {
      icon: 'ri-bar-chart-line',
      title: 'Progress Analytics',
      description: 'Track your performance with detailed analytics, identify weak areas, and monitor your improvement over time.'
    },
    {
      icon: 'ri-timer-line',
      title: 'Realistic Practice Tests',
      description: 'Take full-length practice exams with authentic timing and question formats to simulate the real NPPE experience.'
    },
    {
      icon: 'ri-team-line',
      title: 'Study Community',
      description: 'Connect with fellow engineers, join study groups, and get support from peers preparing for the same exam.'
    }
  ];

  const testimonials = [
    {
      name: 'Michael Rodriguez',
      role: 'Mechanical Engineer',
      image: 'professional engineer testimonial portrait confident smile office background modern lighting business attire',
      quote: 'NPPE Pro helped me pass on my first attempt. The practice questions were spot-on and the analytics showed exactly where I needed to focus.'
    },
    {
      name: 'Jennifer Liu',
      role: 'Civil Engineer',
      image: 'female professional engineer testimonial portrait confident expression office environment modern lighting business professional',
      quote: 'The study path feature kept me organized and motivated. I loved tracking my progress and seeing my weak areas improve over time.'
    },
    {
      name: 'David Thompson',
      role: 'Electrical Engineer',
      image: 'male professional engineer testimonial portrait friendly smile office background modern lighting professional attire',
      quote: 'The community forum was invaluable. Getting tips from engineers who had already passed made all the difference in my preparation.'
    }
  ];

  const handleGetStarted = () => {
    setIsLoading(true);
    // Simulate loading before navigation
    setTimeout(() => {
      navigate('/signup');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-settings-3-line text-[#0277BD] text-xl"></i>
              </div>
              <h1 className="text-xl font-bold text-[#0277BD]">NPPE Pro</h1>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/" className="text-[#0277BD] font-medium">Home</a>
              <a href="/features" className="text-gray-600 hover:text-[#0277BD] transition-colors">Features</a>
              <a href="/pricing" className="text-gray-600 hover:text-[#0277BD] transition-colors">Pricing</a>
              <a href="/about" className="text-gray-600 hover:text-[#0277BD] transition-colors">About</a>
              <a href="/blog" className="text-gray-600 hover:text-[#0277BD] transition-colors">Blog</a>
              <a href="/contact" className="text-gray-600 hover:text-[#0277BD] transition-colors">Contact</a>
              <a href="/login" className="text-gray-600 hover:text-[#0277BD] transition-colors">Login</a>
              <Button onClick={() => window.location.href = '/signup'}>Sign Up</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-blue-800/20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center animate-fade-in-up">
            <div className="mb-8 animate-engineering-pulse">
              <i className="ri-tools-line text-6xl text-blue-600 mb-4 block"></i>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Master Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 animate-shimmer">
                P.Eng Exam
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-in-left stagger-1">
              The most comprehensive NPPE preparation platform designed by engineers, for engineers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-right stagger-2">
              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="btn-premium px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" variant="engineering" />
                ) : (
                  <>
                    Start Your Journey
                    <i className="ri-arrow-right-line ml-2"></i>
                  </>
                )}
              </button>
              
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 whitespace-nowrap cursor-pointer">
                Watch Demo
                <i className="ri-play-circle-line ml-2"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Floating engineering elements */}
        <div className="absolute top-20 left-10 animate-float-animation">
          <div className="w-16 h-16 border-2 border-blue-300 rounded-lg flex items-center justify-center animate-gear-rotate">
            <i className="ri-settings-3-line text-2xl text-blue-500"></i>
          </div>
        </div>
        
        <div className="absolute bottom-32 right-16 animate-float-animation" style={{ animationDelay: '2s' }}>
          <div className="w-20 h-20 border-2 border-blue-400 rounded-full flex items-center justify-center animate-circuit-flow">
            <i className="ri-cpu-line text-2xl text-blue-600"></i>
          </div>
        </div>
        
        <div className="absolute top-1/2 left-20 animate-float-animation" style={{ animationDelay: '4s' }}>
          <div className="w-12 h-12 border-2 border-blue-200 rounded-lg flex items-center justify-center animate-engineering-pulse">
            <i className="ri-compass-3-line text-xl text-blue-400"></i>
          </div>
        </div>
      </section>

      {/* Rest of the existing sections with enhanced animations */}
      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources you need to prepare effectively for the NPPE exam.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-[#0277BD] rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${feature.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-[#0277BD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Pass Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-lg opacity-90">Engineers Trained</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Practice Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-lg opacity-90">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from engineers who achieved their professional designation with NPPE Pro
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <img
                  src={`https://readdy.ai/api/search-image?query=$%7Btestimonial.image%7D&width=80&height=80&seq=testimonial-${index}&orientation=squarish`}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of engineers who have successfully passed their NPPE exam with our proven study system.
          </p>
          <Button size="lg" className="text-lg px-8 py-4" onClick={() => window.location.href = '/signup'}>
            Start Your Free Trial Today
          </Button>
          <p className="mt-4 text-sm text-gray-400">
            No commitment required • Full access for 14 days
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-settings-3-line text-[#0277BD] text-xl"></i>
                </div>
                <h3 className="text-xl font-bold">NPPE Pro</h3>
              </div>
              <p className="text-gray-400">
                The most comprehensive NPPE exam preparation platform for professional engineers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/practice" className="hover:text-white transition-colors">Practice Tests</a></li>
                <li><a href="/study-path" className="hover:text-white transition-colors">Study Materials</a></li>
                <li><a href="/topics" className="hover:text-white transition-colors">Topics</a></li>
                <li><a href="/analytics" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/forum" className="hover:text-white transition-colors">Forum</a></li>
                <li><a href="/study-groups" className="hover:text-white transition-colors">Study Groups</a></li>
                <li><a href="/achievements" className="hover:text-white transition-colors">Achievements</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Help</a></li>
                <li><a href="/support" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NPPE Pro. All rights reserved. | <a href="https://readdy.ai/?origin=logo" className="hover:text-white transition-colors">Powered by Readdy</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
