
import { useEffect } from 'react';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import { updateSEO, seoData } from '../../utils/seo';

export default function PrivacyPolicy() {
  useEffect(() => {
    updateSEO(seoData.privacyPolicy);
  }, []);

  const sections = [
    {
      title: 'Information We Collect',
      content: [
        'Personal Information: When you create an account, we collect your name, email address, and professional information.',
        'Usage Data: We collect information about how you use our platform, including study patterns, test scores, and feature usage.',
        'Device Information: We may collect information about your device, browser, and operating system.',
        'Cookies: We use cookies and similar technologies to enhance your experience and analyze usage patterns.'
      ]
    },
    {
      title: 'How We Use Your Information',
      content: [
        'Provide and improve our educational services and platform functionality.',
        'Personalize your learning experience and track your progress.',
        'Send you important updates, notifications, and educational content.',
        'Analyze usage patterns to improve our platform and develop new features.',
        'Ensure platform security and prevent fraudulent activities.'
      ]
    },
    {
      title: 'Information Sharing',
      content: [
        'We do not sell, trade, or rent your personal information to third parties.',
        'We may share aggregated, anonymized data for research and improvement purposes.',
        'We may share information with service providers who help us operate our platform.',
        'We may disclose information if required by law or to protect our rights and users.'
      ]
    },
    {
      title: 'Data Security',
      content: [
        'We implement industry-standard security measures to protect your data.',
        'All data transmission is encrypted using SSL/TLS protocols.',
        'We regularly update our security practices and conduct security audits.',
        'Access to personal data is restricted to authorized personnel only.'
      ]
    },
    {
      title: 'Your Rights',
      content: [
        'Access: You can request access to your personal information.',
        'Correction: You can request correction of inaccurate information.',
        'Deletion: You can request deletion of your account and associated data.',
        'Portability: You can request a copy of your data in a portable format.',
        'Opt-out: You can opt out of marketing communications at any time.'
      ]
    },
    {
      title: 'Cookies and Tracking',
      content: [
        'Essential Cookies: Required for platform functionality and security.',
        'Analytics Cookies: Help us understand how users interact with our platform.',
        'Preference Cookies: Remember your settings and preferences.',
        'You can control cookie settings through your browser preferences.'
      ]
    },
    {
      title: 'Third-Party Services',
      content: [
        'We use third-party services for analytics, payment processing, and customer support.',
        'These services have their own privacy policies and data handling practices.',
        'We ensure all third-party services meet our privacy and security standards.',
        'Links to third-party websites are governed by their respective privacy policies.'
      ]
    },
    {
      title: 'Data Retention',
      content: [
        'We retain your account information for as long as your account is active.',
        'Study progress and test results are retained to provide ongoing service.',
        'You can request deletion of your data at any time.',
        'Some information may be retained for legal or security purposes.'
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
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: January 15, 2024
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              At NPPE Pro, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              platform and services.
            </p>
            <p className="text-gray-700 mt-4">
              By using NPPE Pro, you agree to the collection and use of information in accordance with this policy. 
              If you do not agree with our policies and practices, please do not use our services.
            </p>
          </div>
        </Card>

        {/* Policy Sections */}
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

        {/* Contact Information */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Questions About This Policy?
            </h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about this Privacy Policy or our data practices, 
              please don't hesitate to contact us.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <i className="ri-mail-line text-2xl text-blue-600 mb-2 block"></i>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-gray-600">privacy@nppepro.com</p>
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

        {/* Updates Notice */}
        <Card className="mt-8">
          <div className="flex items-start space-x-4">
            <i className="ri-information-line text-blue-600 text-2xl mt-1"></i>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Policy Updates</h3>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
                this Privacy Policy periodically for any changes.
              </p>
            </div>
          </div>
        </Card>
      </main>

      <MobileNavigation />
    </div>
  );
}
