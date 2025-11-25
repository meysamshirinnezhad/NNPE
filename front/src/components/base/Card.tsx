
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  animate?: boolean;
  delay?: number;
  glassmorphism?: boolean;
  glow?: boolean;
  interactive3d?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  hover = true,
  animate = true,
  delay = 0,
  glassmorphism = false,
  glow = false,
  interactive3d = false
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const baseClass = glassmorphism ? 'glass-card' : 'bg-white';
  const hoverClass = interactive3d ? 'card-hover-3d' : hover ? 'card-hover' : '';
  const animateClass = animate ? 'animate-fade-in-up' : '';
  const glowClass = glow ? 'glow-effect animate-glow-pulse' : '';
  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  // 3D tilt effect
  useEffect(() => {
    if (!interactive3d || !cardRef.current) return;

    const card = cardRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.setProperty('--rotate-x', `${rotateX}deg`);
      card.style.setProperty('--rotate-y', `${rotateY}deg`);
    };

    const handleMouseLeave = () => {
      card.style.setProperty('--rotate-x', '0deg');
      card.style.setProperty('--rotate-y', '0deg');
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive3d]);

  return (
    <div 
      ref={cardRef}
      className={`${baseClass} rounded-lg ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClass} ${animateClass} ${glowClass} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
}
