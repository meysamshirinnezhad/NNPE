
import { useEffect, useState } from 'react';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { updateSEO, seoData } from '../../utils/seo';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    updateSEO(seoData.pricing);
  }, []);

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for getting started with NPPE preparation',
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        '200+ practice questions',
        'Basic progress tracking',
        'Email support',
        'Mobile app access',
        'Study materials download'
      ],
      limitations: [
        'Limited practice tests (2/month)',
        'Basic analytics only',
        'No community access'
      ],
      popular: false,
      cta: 'Start Basic Plan'
    },
    {
      name: 'Professional',
      description: 'Most popular choice for serious exam preparation',
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        '500+ practice questions',
        'Unlimited practice tests',
        'Advanced analytics & insights',
        'Study path curriculum',
        'Community forum access',
        'Video tutorials',
        'Priority email support',
        'Weakness spotlight',
        'Mobile app with offline mode',
        'Achievement system'
      ],
      limitations: [],
      popular: true,
      cta: 'Start Professional Plan'
    },
    {
      name: 'Premium',
      description: 'Complete preparation with personalized coaching',
      monthlyPrice: 199,
      annualPrice: 159,
      features: [
        'Everything in Professional',
        '1-on-1 coaching sessions (2/month)',
        'Personalized study plan',
        'Live Q&A sessions',
        'Exam strategy consultation',
        'Priority phone support',
        'Custom practice tests',
        'Performance guarantee*'
      ],
      limitations: [],
      popular: false,
      cta: 'Start Premium Plan'
    }
  ];

  const faqs = [
    {
      question: 'Can I switch plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.'
    },
    {
      question: 'What happens after my free trial?',
      answer: 'Your 14-day free trial gives you full access to the Professional plan. After the trial, you\'ll be charged based on your selected plan unless you cancel.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with your purchase, contact us for a full refund.'
    },
    {
      question: 'Is there a student discount?',
      answer: 'Yes! We offer a 20% discount for students with valid .edu email addresses. Contact support to apply the discount.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely.'
    },
    {
      question: 'Can I pause my subscription?',
      answer: 'Yes, you can pause your subscription for up to 3 months if you need to take a break from studying. Contact support to arrange this.'
    }
  ];

  const getCurrentPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (billingCycle === 'annual') {
      const monthlyCost = plan.monthlyPrice * 12;
      const annualCost = plan.annualPrice * 12;
      const savings = monthlyCost - annualCost;
      return Math.round((savings / monthlyCost) * 100);
    }
    return 0;
  };

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
              <a href="/features" className="text-gray-600 hover:text-[#0277BD] transition-colors">Features</a>
              <a href="/pricing" className="text-[#0277BD] font-medium">Pricing</a>
              <a href="/about" className="text-gray-600 hover:text-[#0277BD] transition-colors">About</a>
              <a href="/login" className="text-gray-600 hover:text-[#0277BD] transition-colors">Login</a>
              <Button onClick={() => window.location.href = '/signup'}>Sign Up</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#0277BD] to-[#01579B]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your Path to Success
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Flexible pricing plans designed to fit your study needs and budget. Start with a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-blue-200'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${billingCycle === 'annual' ? 'text-white' : 'text-blue-200'}`}>
              Annual
              <span className="ml-2 text-sm bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative p-8 ${plan.popular ? 'border-2 border-[#0277BD] shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#0277BD] text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${getCurrentPrice(plan)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'month'}
                    </span>
                  </div>
                  
                  {billingCycle === 'annual' && getSavings(plan) > 0 && (
                    <div className="text-green-600 font-medium mb-4">
                      Save {getSavings(plan)}% with annual billing
                    </div>
                  )}
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-[#0277BD] hover:bg-[#01579B]' : ''}`}
                    variant={plan.popular ? 'primary' : 'secondary'}
                    onClick={() => window.location.href = '/signup'}
                  >
                    {plan.cta}
                  </Button>
                  
                  <p className="text-sm text-gray-500 mt-2">14-day free trial included</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <i className="ri-check-line text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li key={limitationIndex} className="flex items-start">
                            <i className="ri-close-line text-red-500 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span className="text-gray-600 text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              * Performance guarantee: If you don't pass the NPPE exam after completing our Premium program, we'll refund your money.
            </p>
            <p className="text-sm text-gray-500">
              All plans include access to our mobile app and sync across all your devices.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Compare All Features
            </h2>
            <p className="text-xl text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Basic</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 bg-blue-50">Professional</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Practice Questions</td>
                  <td className="text-center py-4 px-6 text-gray-600">200+</td>
                  <td className="text-center py-4 px-6 text-gray-600 bg-blue-50">500+</td>
                  <td className="text-center py-4 px-6 text-gray-600">500+</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Practice Tests</td>
                  <td className="text-center py-4 px-6 text-gray-600">2/month</td>
                  <td className="text-center py-4 px-6 text-gray-600 bg-blue-50">Unlimited</td>
                  <td className="text-center py-4 px-6 text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Advanced Analytics</td>
                  <td className="text-center py-4 px-6"><i className="ri-close-line text-red-500"></i></td>
                  <td className="text-center py-4 px-6 bg-blue-50"><i className="ri-check-line text-green-500"></i></td>
                  <td className="text-center py-4 px-6"><i className="ri-check-line text-green-500"></i></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Study Path Curriculum</td>
                  <td className="text-center py-4 px-6"><i className="ri-close-line text-red-500"></i></td>
                  <td className="text-center py-4 px-6 bg-blue-50"><i className="ri-check-line text-green-500"></i></td>
                  <td className="text-center py-4 px-6"><i className="ri-check-line text-green-500"></i></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Community Access</td>
                  <td className="text-center py-4 px-6"><i className="ri-close-line text-red-500"></i></td>
                  <td className="text-center py-4 px-6 bg-blue-50"><i className="ri-check-line text-green-500"></i></td>
                  <td className="text-center py-4 px-6"><i className="ri-check-line text-green-500"></i></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">1-on-1 Coaching</td>
                  <td className="text-center py-4 px-6"><i className="ri-close-line text-red-500"></i></td>
                  <td className="text-center py-4 px-6 bg-blue-50"><i className="ri-close-line text-red-500"></i></td>
                  <td className="text-center py-4 px-6"><i className="ri-check-line text-green-500"></i></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Performance Guarantee</td>
                  <td className="text-center py-4 px-6"><i className="ri-close-line text-red-500"></i></td>
                  <td className="text-center py-4 px-6 bg-blue-50"><i className="ri-close-line text-red-500"></i></td>
                  <td className="text-center py-4 px-6"><i className="ri-check-line text-green-500"></i></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing and plans
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0277BD]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your NPPE Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of engineers who have successfully passed their exam with NPPE Pro.
          </p>
          <Button size="lg" className="text-lg px-8 py-4 bg-white text-[#0277BD] hover:bg-gray-100" onClick={() => window.location.href = '/signup'}>
            Start Your Free Trial
          </Button>
          <p className="mt-4 text-blue-100">
            14-day free trial • No credit card required • Cancel anytime
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
                <li><a href="#" className="hover:text-white transition-colors">Practice Tests</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Study Materials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Help</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
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
