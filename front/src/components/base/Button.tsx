
import { useRef, useEffect } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
  magnetic?: boolean;
  glow?: boolean;
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  loading = false,
  magnetic = false,
  glow = false,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const baseClasses = 'font-medium transition-all duration-200 whitespace-nowrap cursor-pointer relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-primary text-white rounded-lg hover:bg-[#01579B] hover:shadow-lg hover:scale-102 active:scale-98 disabled:bg-gray-300 disabled:opacity-50',
    secondary: 'bg-white text-primary border-2 border-primary rounded-lg hover:bg-[#E3F2FD] hover:border-[#01579B] hover:scale-102 active:scale-98',
    icon: 'rounded-full shadow-md hover:shadow-lg hover:scale-102 active:scale-95'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  const magneticClass = magnetic ? 'btn-magnetic' : 'btn-transition';
  const glowClass = glow ? 'glow-effect' : '';

  // Magnetic effect
  useEffect(() => {
    if (!magnetic || !buttonRef.current) return;

    const button = buttonRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 100;
      
      if (distance < maxDistance) {
        const strength = (maxDistance - distance) / maxDistance;
        const moveX = x * strength * 0.3;
        const moveY = y * strength * 0.3;
        
        button.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`;
      }
    };

    const handleMouseLeave = () => {
      button.style.transform = 'translate(0px, 0px) scale(1)';
    };

    document.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [magnetic]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Enhanced ripple effect
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('absolute', 'bg-white', 'bg-opacity-30', 'rounded-full', 'animate-ripple', 'pointer-events-none');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 400);

    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${variant === 'icon' ? iconSizeClasses[size] : sizeClasses[size]} ${magneticClass} ${glowClass} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin mr-2"></i>
          Loading...
        </div>
      ) : children}
    </button>
  );
}
