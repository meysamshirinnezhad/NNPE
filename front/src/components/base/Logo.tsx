
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
      <img
        src="/images/logos/Logo.png"
        alt="ProCertFlo Logo"
        className={`${iconSize[size]} ${className} object-contain`}
      />
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Image */}
      <img
        src="/images/logos/Logo.png"
        alt="ProCertFlo Logo"
        className={`${iconSize[size]} object-contain`}
      />

      {/* Text */}
      <div className={`font-bold text-white ${textSize[size]} animate-fade-in`}>
        ProCertFlo
      </div>
    </div>
  );
}
