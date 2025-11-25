
import { useEffect } from 'react';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { updateSEO, seoData } from '../../utils/seo';

export default function Features() {
  useEffect(() => {
    updateSEO(seoData.features);
  }, []);

  const mainFeatures = [
    {
      icon: 'ri-book-open-line',
      title: 'Comprehensive Question Bank',
      description: 'Access 500+ practice questions covering all NPPE exam topics with detailed explanations.',
      benefits: ['Updated annually', 'Expert-reviewed content', 'Difficulty levels', 'Topic categorization']
    },
    {
      icon: 'ri-timer-line',
      title: 'Realistic Practice Tests',
      description: 'Take full-length practice exams that simulate the actual NPPE testing environment.',
      benefits: ['Authentic timing', 'Real exam format', 'Instant scoring', 'Performance analytics']
    },
    {
      icon: 'ri-bar-chart-line',
      title: 'Advanced Analytics',
      description: 'Track your progress with detailed performance metrics and identify areas for improvement.',
      benefits: ['Progress tracking', 'Weakness identification', 'Study recommendations', 'Performance trends']
    },
    {
      icon: 'ri-road-map-line',
      title: 'Structured Study Path',
      description: 'Follow our 8-week guided curriculum designed by NPPE experts.',
      benefits: ['Week-by-week plan', 'Video tutorials', 'Reading materials', 'Practice assignments']
    },
    {
      icon: 'ri-team-line',
      title: 'Study Community',
      description: 'Connect with fellow engineers and get support from peers preparing for the same exam.',
      benefits: ['Discussion forums', 'Study groups', 'Peer support', 'Expert Q&A']
    },
    {
      icon: 'ri-smartphone-line',
      title: 'Mobile Learning',
      description: 'Study anywhere with our mobile-optimized platform and offline capabilities.',
      benefits: ['iOS & Android apps', 'Offline mode', 'Sync across devices', 'Push notifications']
    }
  ];

  const studyTools = [
    {
      icon: 'ri-bookmark-line',
      title: 'Smart Bookmarks',
      description: 'Save important questions and create custom study sets for focused review.'
    },
    {
      icon: 'ri-flashlight-line',
      title: 'Weakness Spotlight',
      description: 'AI-powered recommendations highlight your weak areas and suggest targeted practice.'
    },
    {
      icon: 'ri-calendar-line',
      title: 'Study Scheduler',
      description: 'Set study goals and receive personalized reminders to stay on track.'
    },
    {
      icon: 'ri-award-line',
      title: 'Achievement System',
      description: 'Earn badges and track milestones to stay motivated throughout your preparation.'
    }
  ];

  const examTopics = [
    { name: 'Professional Practice', coverage: '95%' },
    { name: 'Ethics', coverage: '92%' },
    { name: 'Engineering Law', coverage: '88%' },
    { name: 'Professional Liability', coverage: '90%' },
    { name: 'Contracts', coverage: '85%' },
    { name: 'Sustainability', coverage: '87%' },
    { name: 'Project Management', coverage: '89%' },
    { name: 'Leadership', coverage: '86%' }
  ];

  return (
    <div className="min-h-screen bg-white">
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
              <a href="/" className="text-gray-600 hover:text-[#0277BD] transition-colors">Home</a>
              <a href="/features" className="text-[#0277BD] font-medium">Features</a>
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
      <section 
        className="relative bg-cover bg-center bg-no-repeat py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(2, 119, 189, 0.9), rgba(1, 87, 155, 0.9)), url('https://readdy.ai/api/search-image?query=modern%20engineering%20study%20workspace%20laptop%20computer%20technical%20books%20calculator%20blueprints%20professional%20learning%20environment%20bright%20lighting%20organized%20desk&width=1200&height=400&seq=features-hero&orientation=landscape')`
        }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to Pass the NPPE
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Comprehensive tools, expert content, and proven strategies designed specifically for Canadian engineering professionals.
          </p>
          <Button size="lg" className="text-lg px-8 py-4 bg-white text-[#0277BD] hover:bg-gray-100" onClick={() => window.location.href = '/signup'}>
            Explore All Features
          </Button>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Exam Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with expert content to provide the most effective NPPE preparation experience.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#0277BD] rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${feature.icon} text-white text-xl`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                          <i className="ri-check-line text-green-500 mr-2"></i>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Study Tools Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Smart Study Tools
            </h2>
            <p className="text-xl text-gray-600">
              AI-powered features that adapt to your learning style and optimize your study time
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {studyTools.map((tool, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0277BD] to-[#01579B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${tool.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{tool.title}</h3>
                <p className="text-gray-600 text-sm">{tool.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Topic Coverage Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Complete NPPE Topic Coverage
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our question bank covers all eight core NPPE topics with comprehensive practice materials and expert explanations.
              </p>
              
              <div className="space-y-4">
                {examTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                    <span className="font-medium text-gray-900">{topic.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#0277BD] to-[#01579B] h-2 rounded-full"
                          style={{ width: topic.coverage }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-[#0277BD] w-12">{topic.coverage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <img
                src="https://readdy.ai/api/search-image?query=engineering%20study%20materials%20textbooks%20technical%20documents%20NPPE%20exam%20preparation%20organized%20desk%20workspace%20professional%20learning%20environment%20bright%20lighting&width=600&height=500&seq=topic-coverage&orientation=landscape"
                alt="NPPE study materials"
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Demo Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See NPPE Pro in Action
            </h2>
            <p className="text-xl text-gray-600">
              Experience our intuitive interface and powerful features
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <img
                src="https://readdy.ai/api/search-image?query=modern%20dashboard%20interface%20analytics%20charts%20progress%20tracking%20clean%20design%20professional%20software%20UI%20engineering%20education%20platform&width=400&height=250&seq=dashboard-demo&orientation=landscape"
                alt="Dashboard interface"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Dashboard</h3>
              <p className="text-gray-600">Track your progress with detailed analytics and personalized insights.</p>
            </Card>
            
            <Card className="p-6">
              <img
                src="https://readdy.ai/api/search-image?query=practice%20test%20interface%20multiple%20choice%20questions%20clean%20design%20professional%20exam%20software%20UI%20engineering%20education%20platform&width=400&height=250&seq=practice-demo&orientation=landscape"
                alt="Practice test interface"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Practice Tests</h3>
              <p className="text-gray-600">Take realistic practice exams with instant feedback and detailed explanations.</p>
            </Card>
            
            <Card className="p-6">
              <img
                src="https://readdy.ai/api/search-image?query=study%20path%20curriculum%20interface%20structured%20learning%20modules%20clean%20design%20professional%20education%20software%20UI%20engineering%20platform&width=400&height=250&seq=study-path-demo&orientation=landscape"
                alt="Study path interface"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Guided Study Path</h3>
              <p className="text-gray-600">Follow our expert-designed 8-week curriculum for structured preparation.</p>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="text-lg px-8 py-4" onClick={() => window.location.href = '/signup'}>
              Try Free Demo
            </Button>
            <p className="mt-4 text-gray-600">No credit card required • Full access for 14 days</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0277BD]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of engineers who have successfully passed their NPPE exam with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4 bg-white text-[#0277BD] hover:bg-gray-100" onClick={() => window.location.href = '/signup'}>
              Start Free Trial
            </Button>
            <Button variant="secondary" size="lg" className="text-lg px-8 py-4 bg-white/20 border-white text-white hover:bg-white/30">
              Watch Demo Video
            </Button>
          </div>
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
