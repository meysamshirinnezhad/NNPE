
import { useEffect, useState } from 'react';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { updateSEO, seoData } from '../../utils/seo';

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    updateSEO(seoData.help);
  }, []);

  const categories = [
    { id: 'all', name: 'All Topics', icon: 'ri-question-line' },
    { id: 'getting-started', name: 'Getting Started', icon: 'ri-rocket-line' },
    { id: 'account', name: 'Account & Billing', icon: 'ri-user-line' },
    { id: 'studying', name: 'Studying & Practice', icon: 'ri-book-open-line' },
    { id: 'technical', name: 'Technical Issues', icon: 'ri-tools-line' },
    { id: 'exam', name: 'NPPE Exam Info', icon: 'ri-file-text-line' }
  ];

  const faqItems = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I get started with NPPE Pro?',
      answer: 'Getting started is easy! First, create your account and complete the onboarding process. Then, take our diagnostic test to assess your current knowledge level. Based on your results, we\'ll recommend a personalized study path to help you prepare effectively for the NPPE exam.'
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'What is included in my subscription?',
      answer: 'Your NPPE Pro subscription includes access to 500+ practice questions, detailed explanations, progress analytics, study path curriculum, practice tests, community forums, and mobile app access. Premium subscribers also get priority support and advanced analytics features.'
    },
    {
      id: 3,
      category: 'account',
      question: 'How do I change my subscription plan?',
      answer: 'You can change your subscription plan anytime from your account settings. Go to Settings > Subscription & Billing, select your new plan, and confirm the change. Changes take effect immediately, and you\'ll be charged the prorated difference.'
    },
    {
      id: 4,
      category: 'account',
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'Yes! We offer a 30-day money-back guarantee for all new subscriptions. If you\'re not completely satisfied within the first 30 days, contact our support team for a full refund. No questions asked.'
    },
    {
      id: 5,
      category: 'studying',
      question: 'How should I structure my study schedule?',
      answer: 'We recommend studying 1-2 hours daily, 5-6 days per week. Use our study path feature to follow a structured 8-week curriculum. Focus on your weak areas identified through our analytics, and take practice tests weekly to track your progress.'
    },
    {
      id: 6,
      category: 'studying',
      question: 'How accurate are the practice questions compared to the real exam?',
      answer: 'Our practice questions are developed by licensed professional engineers and closely mirror the format, difficulty, and content of the actual NPPE exam. We regularly update our question bank based on the latest exam guidelines and user feedback.'
    },
    {
      id: 7,
      category: 'technical',
      question: 'The platform is running slowly. What should I do?',
      answer: 'Try clearing your browser cache and cookies, ensure you have a stable internet connection, and close other browser tabs. If issues persist, try using a different browser or contact our technical support team for assistance.'
    },
    {
      id: 8,
      category: 'technical',
      question: 'Can I use NPPE Pro on my mobile device?',
      answer: 'Yes! NPPE Pro is fully responsive and works great on mobile devices. You can also download our mobile app from the App Store or Google Play for the best mobile experience with offline study capabilities.'
    },
    {
      id: 9,
      category: 'exam',
      question: 'When should I schedule my NPPE exam?',
      answer: 'We recommend scheduling your exam after completing our full study program and consistently scoring 80%+ on practice tests. Most students need 8-12 weeks of preparation. Check with Professional Engineers Ontario (PEO) for exam dates and registration deadlines.'
    },
    {
      id: 10,
      category: 'exam',
      question: 'What topics are covered in the NPPE exam?',
      answer: 'The NPPE exam covers 8 main topics: Professional Practice, Ethics, Engineering Law, Liability, Contracts, Sustainability, Project Management, and Leadership. Our platform provides comprehensive coverage of all these areas with detailed study materials and practice questions.'
    }
  ];

  const quickLinks = [
    {
      title: 'Getting Started Guide',
      description: 'Complete walkthrough for new users',
      icon: 'ri-guide-line',
      link: '#'
    },
    {
      title: 'Study Tips & Strategies',
      description: 'Proven methods for effective preparation',
      icon: 'ri-lightbulb-line',
      link: '#'
    },
    {
      title: 'Technical Requirements',
      description: 'System requirements and compatibility',
      icon: 'ri-computer-line',
      link: '#'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'ri-customer-service-line',
      link: '#'
    }
  ];

  const filteredFaqs = faqItems.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (faqId: number) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and get the help you need to succeed with NPPE Pro.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400 text-xl"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for help articles, FAQs, or topics..."
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickLinks.map((link, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`${link.icon} text-blue-600 text-2xl`}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {link.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {link.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${category.icon} text-lg`}></i>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Frequently Asked Questions
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredFaqs.length} articles found
                </span>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-search-line text-4xl text-gray-400 mb-4 block"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or browse different categories.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <h3 className="font-medium text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                        <i className={`ri-arrow-${expandedFaq === faq.id ? 'up' : 'down'}-s-line text-gray-400 text-xl flex-shrink-0`}></i>
                      </button>
                      
                      {expandedFaq === faq.id && (
                        <div className="px-4 pb-4 border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed pt-4">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Contact Support */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-700 mb-6">
              Can't find what you're looking for? Our support team is here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <i className="ri-chat-3-line mr-2"></i>
                Start Live Chat
              </Button>
              <Button variant="secondary" size="lg">
                <i className="ri-mail-line mr-2"></i>
                Send Email
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Average response time: &lt; 2 hours during business hours
            </p>
          </div>
        </Card>
      </main>

      <MobileNavigation />
    </div>
  );
}
