
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import LoadingSpinner from '../../components/effects/LoadingSpinner';
import { updateSEO } from '../../utils/seo';
import { authService } from '../../api';

export default function EmailVerification() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    updateSEO({
      title: 'Email Verification - NPPE Pro',
      description: 'Verify your NPPE Pro account email',
      keywords: 'email verification, NPPE',
      canonical: '/email-verification'
    });
    
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification token');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setVerificationStatus('success');
      } catch (error) {
        setVerificationStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  const handleContinue = () => {
    navigate('/onboarding');
  };

  const handleResendEmail = async () => {
    setVerificationStatus('loading');
    setErrorMessage('');
    
    // Note: You'll need to implement a resend verification endpoint in the backend
    // For now, we'll just show an error message
    setTimeout(() => {
      setVerificationStatus('error');
      setErrorMessage('Please contact support to resend verification email');
    }, 1000);
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <LoadingSpinner size="lg" variant="engineering" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-6">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-error-warning-line text-red-600 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-2">
              We couldn't verify your email address. The link may have expired or is invalid.
            </p>
            {errorMessage && (
              <p className="text-red-600 text-sm mb-6">
                {errorMessage}
              </p>
            )}
            <div className="space-y-4">
              <Button 
                onClick={handleResendEmail}
                className="w-full"
              >
                <i className="ri-mail-send-line mr-2"></i>
                Resend Verification Email
              </Button>
              <button
                onClick={() => navigate('/login')}
                className="w-full text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="text-center">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <i className="ri-check-circle-line text-green-600 text-2xl"></i>
            </div>
            {/* Confetti Animation */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                ></div>
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verified Successfully! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Congratulations! Your email has been verified. You're now ready to start your NPPE preparation journey.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <i className="ri-lightbulb-line text-blue-600 text-xl mt-0.5"></i>
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 mb-1">What's Next?</h3>
                <p className="text-blue-700 text-sm">
                  Complete your profile setup and take a diagnostic test to create your personalized study plan.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleContinue}
            className="w-full"
            size="lg"
          >
            Continue to Setup
            <i className="ri-arrow-right-line ml-2"></i>
          </Button>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Skip setup and go to dashboard
            </button>
          </div>
        </Card>

        {/* Welcome Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Welcome to the NPPE Pro community! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
