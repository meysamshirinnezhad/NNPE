
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'engineering';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'engineering') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={`relative ${sizeClasses[size]}`}>
          {/* Outer gear */}
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-200 rounded-full"></div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-200 rounded-full"></div>
            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-200 rounded-full"></div>
            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-200 rounded-full"></div>
          </div>
          
          {/* Inner gear */}
          <div className="absolute inset-2 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" 
               style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}>
          </div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="ri-tools-line text-blue-600 animate-pulse" style={{ fontSize: size === 'sm' ? '8px' : size === 'md' ? '12px' : size === 'lg' ? '16px' : '20px' }}></i>
          </div>
        </div>
        
        {text && (
          <div className={`mt-3 text-blue-600 font-medium animate-pulse ${textSizeClasses[size]}`}>
            {text}
          </div>
        )}
      </div>
    );
  }

  const variantClasses = {
    primary: 'border-blue-500 border-t-transparent',
    secondary: 'border-gray-300 border-t-transparent'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-4 rounded-full animate-spin ${variantClasses[variant]}`}></div>
      {text && (
        <div className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </div>
      )}
    </div>
  );
}
