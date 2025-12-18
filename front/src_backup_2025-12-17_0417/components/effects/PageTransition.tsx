
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const location = useLocation();

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  return (
    <div className="relative min-h-screen">
      {/* Page transition overlay */}
      <div 
        className={`fixed inset-0 z-50 pointer-events-none transition-all duration-300 ease-out ${
          isTransitioning 
            ? 'opacity-100 bg-gradient-to-br from-blue-50 via-white to-blue-50' 
            : 'opacity-0'
        }`}
      >
        {isTransitioning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Animated engineering icon */}
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="ri-settings-3-line text-2xl text-blue-600 animate-pulse"></i>
                </div>
              </div>
              
              {/* Loading text */}
              <div className="mt-4 text-center">
                <div className="text-blue-600 font-medium animate-pulse">Loading...</div>
                <div className="w-24 h-1 bg-blue-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-progress-fill"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Page content */}
      <div 
        className={`transition-all duration-500 ease-out ${
          isTransitioning 
            ? 'opacity-0 transform translate-y-4 scale-95' 
            : 'opacity-100 transform translate-y-0 scale-100'
        }`}
      >
        {displayChildren}
      </div>
    </div>
  );
}
