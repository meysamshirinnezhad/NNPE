
import { useEffect } from 'react';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import { updateSEO, seoData } from '../../utils/seo';

export default function TermsOfService() {
  useEffect(() => {
    updateSEO(seoData.termsOfService);
  }, []);

  const sections = [
    {
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using NPPE Pro, you accept and agree to be bound by these Terms of Service.',
        'If you do not agree to these terms, you may not access or use our services.',
        'We reserve the right to modify these terms at any time with notice to users.',
        'Continued use of the service after changes constitutes acceptance of new terms.'
      ]
    },
    {
      title: 'Description of Service',
      content: [
        'NPPE Pro provides online educational resources for NPPE exam preparation.',
        'Our services include practice questions, study materials, progress tracking, and community features.',
        'We strive to provide accurate and up-to-date content but make no guarantees about exam outcomes.',
        'Service availability may vary and we reserve the right to modify or discontinue features.'
      ]
    },
    {
      title: 'User Accounts and Registration',
      content: [
        'You must create an account to access most features of our platform.',
        'You are responsible for maintaining the confidentiality of your account credentials.',
        'You must provide accurate and complete information during registration.',
        'You are responsible for all activities that occur under your account.'
      ]
    },
    {
      title: 'Acceptable Use Policy',
      content: [
        'You may use our service only for lawful purposes and in accordance with these terms.',
        'You may not share your account credentials or allow others to use your account.',
        'You may not attempt to reverse engineer, hack, or compromise our platform security.',
        'You may not use our content for commercial purposes without written permission.'
      ]
    },
    {
      title: 'Intellectual Property Rights',
      content: [
        'All content on NPPE Pro is protected by copyright and other intellectual property laws.',
        'You may not copy, distribute, or create derivative works from our content.',
        'You retain ownership of any content you submit to our platform.',
        'By submitting content, you grant us a license to use it in connection with our services.'
      ]
    },
    {
      title: 'Payment and Subscription Terms',
      content: [
        'Subscription fees are charged in advance and are non-refundable except as required by law.',
        'We offer a 30-day money-back guarantee for new subscribers.',
        'Prices may change with 30 days notice to existing subscribers.',
        'Failure to pay subscription fees may result in account suspension or termination.'
      ]
    },
    {
      title: 'Privacy and Data Protection',
      content: [
        'Your privacy is important to us and is governed by our Privacy Policy.',
        'We collect and use your information as described in our Privacy Policy.',
        'You have rights regarding your personal data as outlined in our Privacy Policy.',
        'We implement appropriate security measures to protect your information.'
      ]
    },
    {
      title: 'Disclaimers and Limitations',
      content: [
        'Our service is provided "as is" without warranties of any kind.',
        'We do not guarantee that our service will be uninterrupted or error-free.',
        'We are not responsible for any damages arising from your use of our service.',
        'Our liability is limited to the amount you paid for our services in the past 12 months.'
      ]
    },
    {
      title: 'Termination',
      content: [
        'You may terminate your account at any time through your account settings.',
        'We may terminate or suspend your account for violation of these terms.',
        'Upon termination, your right to use our service ceases immediately.',
        'We may retain certain information as required by law or for legitimate business purposes.'
      ]
    },
    {
      title: 'Governing Law',
      content: [
        'These terms are governed by the laws of Ontario, Canada.',
        'Any disputes will be resolved in the courts of Ontario, Canada.',
        'If any provision of these terms is invalid, the remaining provisions remain in effect.',
        'These terms constitute the entire agreement between you and NPPE Pro.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: January 15, 2024
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              Welcome to NPPE Pro. These Terms of Service ("Terms") govern your use of our platform and services. 
              Please read these terms carefully before using our service.
            </p>
            <p className="text-gray-700 mt-4">
              By accessing or using NPPE Pro, you agree to be bound by these Terms and our Privacy Policy. 
              If you disagree with any part of these terms, then you may not access our service.
            </p>
          </div>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {index + 1}. {section.title}
              </h2>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <i className="ri-check-line text-blue-600 text-lg mr-3 mt-0.5 flex-shrink-0"></i>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Important Notice */}
        <Card className="mt-12 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex items-start space-x-4">
            <i className="ri-alert-line text-yellow-600 text-2xl mt-1"></i>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Important Notice</h3>
              <p className="text-gray-700">
                NPPE Pro is an educational platform designed to help you prepare for the NPPE exam. 
                While we strive to provide high-quality content and resources, we cannot guarantee 
                exam success. Your results depend on your individual effort, preparation, and understanding 
                of the material.
              </p>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Questions About These Terms?
            </h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <i className="ri-mail-line text-2xl text-blue-600 mb-2 block"></i>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-gray-600">legal@nppepro.com</p>
              </div>
              <div className="text-center">
                <i className="ri-phone-line text-2xl text-blue-600 mb-2 block"></i>
                <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                <p className="text-gray-600">1-800-NPPE-PRO</p>
              </div>
              <div className="text-center">
                <i className="ri-map-pin-line text-2xl text-blue-600 mb-2 block"></i>
                <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                <p className="text-gray-600">
                  123 Engineering Way<br />
                  Toronto, ON M5V 3A8
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
