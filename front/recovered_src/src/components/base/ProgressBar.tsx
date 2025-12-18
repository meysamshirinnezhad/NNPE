
import { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  delay?: number;
  showLabel?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  animate = false,
  delay = 0,
  showLabel = false,
  glow = false,
  gradient = false
}: ProgressBarProps) {
  const [currentValue, setCurrentValue] = useState(animate ? 0 : value);
  const [isAnimating, setIsAnimating] = useState(false);

  const percentage = Math.min((currentValue / max) * 100, 100);

  const colorClasses = {
    primary: gradient 
      ? 'bg-gradient-to-r from-[#0277BD] to-[#01579B]' 
      : 'bg-[#0277BD]',
    success: gradient 
      ? 'bg-gradient-to-r from-[#388E3C] to-[#2E7D32]' 
      : 'bg-[#388E3C]',
    warning: gradient 
      ? 'bg-gradient-to-r from-[#FBC02D] to-[#F57C00]' 
      : 'bg-[#FBC02D]',
    error: gradient 
      ? 'bg-gradient-to-r from-[#D32F2F] to-[#B71C1C]' 
      : 'bg-[#D32F2F]'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const glowClasses = {
    primary: 'shadow-lg shadow-blue-500/30',
    success: 'shadow-lg shadow-green-500/30',
    warning: 'shadow-lg shadow-yellow-500/30',
    error: 'shadow-lg shadow-red-500/30'
  };

  useEffect(() => {
    if (!animate) return;

    const timer = setTimeout(() => {
      setIsAnimating(true);
      const duration = 1200;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCurrentValue(value);
          setIsAnimating(false);
          clearInterval(interval);
        } else {
          setCurrentValue(current);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [animate, delay, value]);

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-300 ease-out relative overflow-hidden ${
            glow ? glowClasses[color] : ''
          } ${isAnimating ? 'animate-progress-glow' : ''}`}
          style={{ 
            width: `${percentage}%`,
            transition: animate ? 'width 1200ms cubic-bezier(0.23, 1, 0.32, 1)' : undefined
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
          
          {/* Glow effect */}
          {glow && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>
      </div>
      
      {showLabel && (
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>{Math.round(currentValue)}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
