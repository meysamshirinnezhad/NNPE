import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import { updateSEO, seoData } from '../../utils/seo';

/**
 * HIGH-CONVERTING LANDING PAGE
 *
 * Design Principles Applied:
 * 1. Single conversion goal: Start free practice test
 * 2. Minimal distractions: No navigation menu
 * 3. Benefit-focused copy: What users GET, not what we HAVE
 * 4. Under 150 lines of content
 * 5. Two CTA buttons max (hero + bottom)
 * 6. No fake social proof (we have 0 sales)
 * 7. Clear value proposition above the fold
 */

export default function ConversionFocusedLanding() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    updateSEO(seoData.landing);
  }, []);

  const handleStartFreeTrial = () => {
    if (email) {
      navigate(`/signup?email=${encodeURIComponent(email)}`);
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header - Logo + Login Only */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="ri-settings-3-line text-[#0277BD] text-2xl"></i>
            <span className="text-xl font-bold text-gray-900">NPPE Pro</span>
          </div>
          <a
            href="/login"
            className="text-gray-600 hover:text-[#0277BD] transition-colors text-sm font-medium"
          >
            Login
          </a>
        </div>
      </header>

      {/* HERO SECTION - Above the Fold */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline: One benefit-driven statement */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Pass Your NPPE Exam with Confidence
          </h1>

          {/* Subheadline: One supporting sentence */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Unlimited practice exams that show exactly where you need to study
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-6 py-4 text-lg border-2 border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:border-[#0277BD] transition-colors"
            />
            <Button
              size="lg"
              onClick={handleStartFreeTrial}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold whitespace-nowrap bg-[#0277BD] hover:bg-[#025A8C] transition-colors"
            >
              Start Free Practice Test
              <i className="ri-arrow-right-line ml-2"></i>
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            No credit card required • Instant access • 7 days free
          </p>

          {/* Hero Visual - Screenshot */}
          <div className="mt-16 rounded-lg shadow-2xl overflow-hidden border-4 border-gray-200">
            <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-8">
              {/* Mock screenshot of results dashboard */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Practice Test Results</h3>
                  <div className="text-3xl font-bold text-green-600">85%</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Professional Practice</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                      <span className="font-semibold">90%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Ethics</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="font-semibold">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Law for Engineers</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="font-semibold text-yellow-600">65% - Practice More</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            <span className="font-semibold text-gray-900">Not knowing if you're ready for the NPPE creates anxiety.</span>
            {' '}Most engineers study blindly without knowing their weak areas until exam day—when it's too late.
          </p>
        </div>
      </section>

      {/* SOLUTION SECTION - How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0277BD] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Take Realistic NPPE Mock Exams
              </h3>
              <p className="text-gray-600">
                Questions mirror actual NPPE format and difficulty
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0277BD] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get Instant Feedback on Weak Topics
              </h3>
              <p className="text-gray-600">
                Smart analysis pinpoints exactly which topics to review
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0277BD] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Track Progress Until You're Confident
              </h3>
              <p className="text-gray-600">
                Unlimited attempts—practice until you're ready to pass
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-16 px-6 bg-blue-50">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* Benefit 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <i className="ri-checkbox-circle-fill text-3xl text-green-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Questions mirror actual NPPE format and difficulty
                </h3>
                <p className="text-gray-600">
                  Practice with questions designed by P.Eng holders who've passed the exam
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <i className="ri-checkbox-circle-fill text-3xl text-green-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Smart analysis pinpoints exactly which topics to review
                </h3>
                <p className="text-gray-600">
                  Stop wasting time on topics you've mastered. Focus on what matters.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <i className="ri-checkbox-circle-fill text-3xl text-green-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Unlimited attempts—practice until confident
                </h3>
                <p className="text-gray-600">
                  No limits. Take as many practice tests as you need to feel ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Know Your Score Before the Real Exam
          </h2>

          <p className="text-xl text-gray-600 mb-10">
            Start practicing today—7 days free, no credit card required
          </p>

          {/* Repeat Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-6 py-4 text-lg border-2 border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:border-[#0277BD] transition-colors"
            />
            <Button
              size="lg"
              onClick={handleStartFreeTrial}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold whitespace-nowrap bg-[#0277BD] hover:bg-[#025A8C] transition-colors"
            >
              Start My Free Test
              <i className="ri-arrow-right-line ml-2"></i>
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Join engineers preparing for their NPPE exam
          </p>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <i className="ri-settings-3-line text-[#0277BD] text-xl"></i>
              <span className="font-semibold">NPPE Pro</span>
            </div>

            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms-of-service" className="hover:text-white transition-colors">Terms</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mt-8">
            © 2024 NPPE Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
