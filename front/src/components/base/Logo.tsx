
interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'full' | 'icon';
  className?: string;
}

export default function Logo({ size = 'medium', variant = 'full', className = '' }: LogoProps) {

  const iconSize = {
    small: 'w-7 h-7',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const textSize = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  if (variant === 'icon') {
    return (
      <div className={`${iconSize[size]} ${className} flex items-center justify-center`}>
        <div className="relative">
          {/* Gear icon */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <i className="ri-settings-3-line text-white text-lg"></i>
          </div>
          {/* Graduation cap overlay */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
            <i className="ri-graduation-cap-line text-white text-xs"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Icon */}
      <div className={`${iconSize[size]} flex items-center justify-center`}>
        <div className="relative">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <i className="ri-settings-3-line text-white text-lg"></i>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
            <i className="ri-graduation-cap-line text-white text-xs"></i>
          </div>
        </div>
      </div>
      
      {/* Text */}
      <div className={`font-bold text-gray-900 ${textSize[size]}`}>
        NPPE Pro
      </div>
    </div>
  );
}