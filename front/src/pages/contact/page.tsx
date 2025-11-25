
import { useEffect, useState } from 'react';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { updateSEO, seoData } from '../../utils/seo';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    updateSEO(seoData.contact);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
      
      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: 'ri-mail-line',
      title: 'Email Support',
      description: 'Get help with your account, billing, or technical issues',
      contact: 'support@nppepro.com',
      action: 'Send Email'
    },
    {
      icon: 'ri-phone-line',
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      contact: '1-800-NPPE-PRO',
      action: 'Call Now'
    },
    {
      icon: 'ri-chat-3-line',
      title: 'Live Chat',
      description: 'Chat with our team in real-time',
      contact: 'Available 9 AM - 6 PM EST',
      action: 'Start Chat'
    }
  ];

  const faqItems = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking the "Forgot Password" link on the login page.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from your account settings.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all new subscriptions.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about NPPE Pro? We're here to help you succeed in your engineering career.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <i className="ri-check-circle-line text-green-600 text-xl mr-3"></i>
                    <p className="text-green-800">Thank you! Your message has been sent successfully.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Subscriptions</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="partnership">Partnership Opportunities</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Please provide details about your inquiry..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.message.length}/500 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      Send Message
                      <i className="ri-send-plane-line ml-2"></i>
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Other Ways to Reach Us</h3>
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${method.icon} text-blue-600 text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{method.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                      <p className="text-sm font-medium text-gray-900 mb-2">{method.contact}</p>
                      <Button variant="secondary" size="sm">
                        {method.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick FAQ */}
            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Answers</h3>
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                    <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                    <p className="text-sm text-gray-600">{item.answer}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="secondary" className="w-full">
                  View All FAQs
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Office Information */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Visit Our Office</h2>
            <p className="text-gray-600 mb-6">
              Located in the heart of Toronto's engineering district
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <i className="ri-map-pin-line text-3xl text-blue-600 mb-3 block"></i>
                <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                <p className="text-gray-600">
                  123 Engineering Way<br />
                  Toronto, ON M5V 3A8<br />
                  Canada
                </p>
              </div>
              <div>
                <i className="ri-time-line text-3xl text-blue-600 mb-3 block"></i>
                <h3 className="font-semibold text-gray-900 mb-2">Office Hours</h3>
                <p className="text-gray-600">
                  Monday - Friday<br />
                  9:00 AM - 6:00 PM EST<br />
                  Closed Weekends
                </p>
              </div>
              <div>
                <i className="ri-phone-line text-3xl text-blue-600 mb-3 block"></i>
                <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">
                  Main: (416) 555-0123<br />
                  Support: 1-800-NPPE-PRO<br />
                  Fax: (416) 555-0124
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <MobileNavigation />
    </div>
  );
}
