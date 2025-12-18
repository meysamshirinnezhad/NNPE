import { useState, useEffect } from 'react';
import Button from '../base/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { authService } from '../../api';

export default function VerificationBanner() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if user is logged in AND not verified
    if (user && !user.is_verified) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user]);

  // Ensure it's not hidden by other elements
  if (!isVisible) {
    return null;
  }

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authService.sendVerificationEmail();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Verification email error:', err);
      // More user-friendly error message for rate limits
      if (err.message?.includes('wait')) {
        setError('Please wait a moment before requesting another email.');
      } else {
        setError(err.message || 'Failed to send verification email');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 sm:px-6 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <i className="ri-alert-line text-amber-600 text-xl"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Please verify your email address
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              You need to verify your email ({user?.email}) to access all features.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {success ? (
            <span className="text-sm font-medium text-green-600 flex items-center bg-green-50 px-3 py-1.5 rounded-md border border-green-200">
              <i className="ri-check-line mr-1.5"></i>
              Email sent!
            </span>
          ) : (
            <>
              {error && (
                <span className="text-xs text-red-600 mr-2 hidden md:inline">
                  {error}
                </span>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full sm:w-auto text-amber-700 hover:text-amber-800 hover:bg-amber-100 border-amber-300"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-700 mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="ri-mail-send-line mr-1.5"></i>
                    Resend Email
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-2 text-center sm:hidden">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
