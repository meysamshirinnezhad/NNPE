
import { useEffect, useState } from 'react';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { updateSEO, seoData } from '../../utils/seo';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error } = useAuth();
  const { setUser } = useAuthContext();

  useEffect(() => {
    updateSEO(seoData.login);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login({ email, password });

    if (result) {
      // Update AuthContext with user data
      setUser(result.user);
      
      // Login successful, redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  const handleGoogleLogin = () => {
    // Simulate Google OAuth
    console.log('Google login initiated');
  };

  const handleAppleLogin = () => {
    // Simulate Apple OAuth
    console.log('Apple login initiated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0277BD] to-[#01579B] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 flex items-center justify-center">
              <i className="ri-settings-3-line text-white text-3xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-white">NPPE Pro</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-blue-100">Sign in to continue your NPPE preparation</p>
        </div>

        {/* Login Form */}
        <Card className="p-8 bg-white/95 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <i className="ri-error-warning-line text-red-600 mr-2"></i>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0277BD] focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
                <i className="ri-mail-line absolute right-3 top-3 text-gray-400"></i>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0277BD] focus:border-transparent transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#0277BD] focus:ring-[#0277BD] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="/forgot-password" className="text-sm text-[#0277BD] hover:text-[#01579B] transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 text-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={handleGoogleLogin}
              className="w-full py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <i className="ri-google-fill mr-2 text-red-500"></i>
              Google
            </Button>
            <Button
              variant="secondary"
              onClick={handleAppleLogin}
              className="w-full py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <i className="ri-apple-fill mr-2 text-gray-900"></i>
              Apple
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-[#0277BD] hover:text-[#01579B] font-medium transition-colors">
                Sign up for free
              </a>
            </p>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <a href="/" className="text-blue-100 hover:text-white transition-colors text-sm">
            <i className="ri-arrow-left-line mr-1"></i>
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
