
import { useEffect, useState } from 'react';

interface CountUpNumberProps {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export default function CountUpNumber({
  end,
  start = 0,
  duration = 1500,
  delay = 0,
  className = '',
  suffix = '',
  prefix = '',
  decimals = 0
}: CountUpNumberProps) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = decimals > 0
          ? parseFloat((easeOutQuart * (end - start) + start).toFixed(decimals))
          : Math.floor(easeOutQuart * (end - start) + start);
        
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [end, start, duration, delay]);

  return (
    <span className={`animate-count-up ${className}`}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : count}{suffix}
    </span>
  );
}