
import { useEffect, useState } from 'react';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'success' | 'warning' | 'error';
  animate?: boolean;
  delay?: number;
  showLabel?: boolean;
  gradient?: boolean;
  glow?: boolean;
}

export default function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  animate = false,
  delay = 0,
  showLabel = true,
  gradient = true,
  glow = false
}: CircularProgressProps) {
  const [currentValue, setCurrentValue] = useState(animate ? 0 : value);
  const [isAnimating, setIsAnimating] = useState(false);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((currentValue / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: '#0277BD',
    success: '#388E3C',
    warning: '#FBC02D',
    error: '#D32F2F'
  };

  const gradientIds = {
    primary: 'primaryGradient',
    success: 'successGradient',
    warning: 'warningGradient',
    error: 'errorGradient'
  };

  useEffect(() => {
    if (!animate) return;

    const timer = setTimeout(() => {
      setIsAnimating(true);
      const duration = 1500;
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
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${glow ? 'drop-shadow-lg' : ''}`}
      >
        <defs>
          <linearGradient id={gradientIds.primary} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0277BD" />
            <stop offset="100%" stopColor="#01579B" />
          </linearGradient>
          <linearGradient id={gradientIds.success} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#388E3C" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
          <linearGradient id={gradientIds.warning} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBC02D" />
            <stop offset="100%" stopColor="#F57C00" />
          </linearGradient>
          <linearGradient id={gradientIds.error} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D32F2F" />
            <stop offset="100%" stopColor="#B71C1C" />
          </linearGradient>
          
          {glow && (
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradient ? `url(#${gradientIds[color]})` : colorClasses[color]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out ${
            isAnimating ? 'animate-draw-progress' : ''
          }`}
          style={{
            transition: animate ? 'stroke-dashoffset 1500ms cubic-bezier(0.23, 1, 0.32, 1)' : undefined,
            filter: glow ? 'url(#glow)' : undefined
          }}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold text-gray-900 ${
              isAnimating ? 'animate-number-count' : ''
            }`}>
              {Math.round(currentValue)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
