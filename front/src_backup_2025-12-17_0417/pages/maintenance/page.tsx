
import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';

export default function Maintenance() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNotifyMe = () => {
    // Handle email notification signup
    console.log('Notify me when maintenance is complete');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <i className="ri-tools-line text-4xl text-blue-600"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">We'll be back soon!</h1>
          <p className="text-lg text-gray-600 mb-8">
            NPPE Pro is currently undergoing scheduled maintenance to improve your experience. 
            We apologize for any inconvenience and appreciate your patience.
          </p>

          {/* Countdown Timer */}
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Estimated completion time</h2>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                </div>
                <span className="text-sm text-gray-600">Hours</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                </div>
                <span className="text-sm text-gray-600">Minutes</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                </div>
                <span className="text-sm text-gray-600">Seconds</span>
              </div>
            </div>
          </div>

          {/* What's Being Updated */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What we're working on</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <i className="ri-speed-up-line text-blue-600 text-xl mt-1"></i>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">Performance Improvements</h4>
                  <p className="text-sm text-gray-600">Faster loading times and smoother navigation</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <i className="ri-shield-check-line text-green-600 text-xl mt-1"></i>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">Security Updates</h4>
                  <p className="text-sm text-gray-600">Enhanced security measures for your data</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <i className="ri-add-circle-line text-purple-600 text-xl mt-1"></i>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">New Features</h4>
                  <p className="text-sm text-gray-600">Exciting new tools to help you study better</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <i className="ri-bug-line text-orange-600 text-xl mt-1"></i>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">Bug Fixes</h4>
                  <p className="text-sm text-gray-600">Resolving reported issues and improving stability</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Notification */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Get notified when we're back</h3>
            <p className="text-blue-800 mb-4">
              Enter your email address and we'll send you a notification as soon as the maintenance is complete.
            </p>
            <div className="flex space-x-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                onClick={handleNotifyMe}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Notify Me
              </button>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">In the meantime</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="https://twitter.com/nppepro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="ri-twitter-line text-2xl text-blue-500 mb-2"></i>
                <h4 className="font-medium text-gray-900">Follow Updates</h4>
                <p className="text-sm text-gray-600">Get real-time updates on Twitter</p>
              </a>
              
              <a 
                href="/blog" 
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="ri-article-line text-2xl text-green-600 mb-2"></i>
                <h4 className="font-medium text-gray-900">Read Our Blog</h4>
                <p className="text-sm text-gray-600">Study tips and engineering insights</p>
              </a>
              
              <a 
                href="mailto:support@nppepro.com"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="ri-mail-line text-2xl text-purple-600 mb-2"></i>
                <h4 className="font-medium text-gray-900">Contact Support</h4>
                <p className="text-sm text-gray-600">Questions? We're here to help</p>
              </a>
            </div>
          </div>

          {/* Status Updates */}
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Maintenance Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <i className="ri-check-line text-green-600"></i>
                <span className="text-sm text-gray-700">Database optimization - Complete</span>
                <span className="text-xs text-gray-500">2:30 PM</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="ri-check-line text-green-600"></i>
                <span className="text-sm text-gray-700">Security patches applied - Complete</span>
                <span className="text-xs text-gray-500">3:15 PM</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-700">New feature deployment - In Progress</span>
                <span className="text-xs text-gray-500">4:00 PM</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="ri-time-line text-gray-400"></i>
                <span className="text-sm text-gray-500">Final testing and verification - Pending</span>
                <span className="text-xs text-gray-500">5:30 PM</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Thank you for your patience. We're working hard to get everything back online as quickly as possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
