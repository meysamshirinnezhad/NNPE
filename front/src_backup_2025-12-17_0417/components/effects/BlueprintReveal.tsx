
import { useEffect, useState } from 'react';

interface BlueprintRevealProps {
  onComplete?: () => void;
  duration?: number;
}

export default function BlueprintReveal({ onComplete, duration = 2500 }: BlueprintRevealProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<'grid' | 'pulse' | 'fade'>('grid');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('pulse'), 800);
    const timer2 = setTimeout(() => setPhase('fade'), 1500);
    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Blueprint Grid */}
      <div 
        className={`absolute inset-0 blueprint-grid transition-opacity duration-1000 ${
          phase === 'fade' ? 'opacity-0' : 'opacity-100'
        }`}
      />
      
      {/* Pulse Effect */}
      {phase === 'pulse' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent animate-ping" />
          <div className="absolute inset-0 bg-gradient-radial from-blue-400/10 via-transparent to-transparent animate-pulse" />
        </div>
      )}
      
      {/* Construction Lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern id="construction" patternUnits="userSpaceOnUse" width="100" height="100">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(2, 119, 189, 0.3)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#construction)" className={`transition-opacity duration-1000 ${
          phase === 'fade' ? 'opacity-0' : 'opacity-100'
        }`} />
      </svg>
    </div>
  );
}
