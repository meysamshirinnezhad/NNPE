
import { useState } from 'react';
import Header from '../../components/feature/Header';

export default function Error() {
  const [errorDetails, setErrorDetails] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const errorId = 'ERR-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  const handleSendReport = () => {
    // Simulate sending error report
    setTimeout(() => {
      setReportSent(true);
    }, 1000);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <i className="ri-error-warning-line text-4xl text-red-600"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
          <p className="text-lg text-gray-600 mb-8">
            We're sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.
          </p>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Error Information</h2>
              <span className="text-sm text-gray-500">Error ID: {errorId}</span>
            </div>
            
            <div className="text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time:</span>
                <span className="text-sm text-gray-900">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Page:</span>
                <span className="text-sm text-gray-900">{window.location.pathname}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Browser:</span>
                <span className="text-sm text-gray-900">{navigator.userAgent.split(' ')[0]}</span>
              </div>
            </div>

            <button
              onClick={() => setErrorDetails(!errorDetails)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              {errorDetails ? 'Hide' : 'Show'} technical details
            </button>

            {errorDetails && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-left">
                <pre className="text-xs text-gray-700 overflow-x-auto">
{`TypeError: Cannot read property 'undefined' of null
    at Component.render (app.js:1234:56)
    at ReactDOM.render (react-dom.js:789:12)
    at Object.updateComponent (react.js:456:78)`}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">What you can do:</h3>
            <ul className="text-left text-blue-800 space-y-2">
              <li className="flex items-start space-x-2">
                <i className="ri-refresh-line mt-0.5"></i>
                <span>Try refreshing the page</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="ri-arrow-left-line mt-0.5"></i>
                <span>Go back to the previous page</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="ri-home-line mt-0.5"></i>
                <span>Return to the homepage</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="ri-customer-service-line mt-0.5"></i>
                <span>Contact our support team if the problem persists</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <button 
                onClick={handleRetry}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <i className="ri-refresh-line mr-2"></i>
                Try Again
              </button>
              <button 
                onClick={handleGoHome}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <i className="ri-home-line mr-2"></i>
                Go Home
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium text-gray-900 mb-3">Help us improve</h4>
              <p className="text-sm text-gray-600 mb-4">
                Send us details about what happened to help prevent this error in the future.
              </p>
              
              {!reportSent ? (
                <button 
                  onClick={handleSendReport}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <i className="ri-send-plane-line mr-2"></i>
                  Send Error Report
                </button>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <i className="ri-check-line"></i>
                  <span className="text-sm">Error report sent successfully</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12">
            <div className="border-t border-gray-200 pt-8">
              <h4 className="font-medium text-gray-900 mb-4">Need immediate help?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a 
                  href="/support"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <i className="ri-customer-service-line text-2xl text-blue-600 mb-2"></i>
                  <h5 className="font-medium text-gray-900">Support Center</h5>
                  <p className="text-sm text-gray-600">Get help from our team</p>
                </a>
                
                <a 
                  href="/help"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <i className="ri-question-line text-2xl text-green-600 mb-2"></i>
                  <h5 className="font-medium text-gray-900">FAQ</h5>
                  <p className="text-sm text-gray-600">Find quick answers</p>
                </a>
                
                <a 
                  href="/forum"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <i className="ri-chat-3-line text-2xl text-purple-600 mb-2"></i>
                  <h5 className="font-medium text-gray-900">Community</h5>
                  <p className="text-sm text-gray-600">Ask the community</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
