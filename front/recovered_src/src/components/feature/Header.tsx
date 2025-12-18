
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../base/Logo';
import { useAuthContext } from '../../contexts/AuthContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-nav shadow-lg' : 'bg-white/90'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white/80 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200"
                placeholder="Search questions, topics..."
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center">
            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user ? `${user.first_name} ${user.last_name}` : 'User'}
                </span>
                <i className="ri-arrow-down-s-line text-gray-400 group-hover:text-gray-600 transition-colors"></i>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                <div className="py-1">
                  {user && !user.is_verified && (
                    <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                      <p className="text-xs text-amber-800 font-medium">Email not verified</p>
                      <button 
                        onClick={() => {
                          navigate('/dashboard');
                          // Force scroll to top to see banner
                          window.scrollTo(0, 0);
                        }}
                        className="text-xs text-amber-600 hover:text-amber-700 underline mt-1"
                      >
                        Verify now
                      </button>
                    </div>
                  )}
                  <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <i className="ri-user-line mr-3"></i>
                    Profile
                  </a>
                  <a href="/settings/account" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <i className="ri-settings-line mr-3"></i>
                    Settings
                  </a>
                  <a href="/help" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <i className="ri-question-line mr-3"></i>
                    Help
                  </a>
                  {user?.is_admin && (
                    <>
                      <hr className="my-1" />
                      <a href="/admin" className="flex items-center px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors">
                        <i className="ri-admin-line mr-3"></i>
                        Admin Panel
                      </a>
                    </>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                  >
                    <i className="ri-logout-box-line mr-3"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
