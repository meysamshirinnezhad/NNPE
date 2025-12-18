import { useState } from 'react';
import type { ReactNode } from 'react';

interface FutureFeatureProps {
  children: ReactNode;
  tooltip?: string;
  className?: string;
  disabled?: boolean;
}

export default function FutureFeature({
  children,
  tooltip = 'Active in future',
  className = '',
  disabled = true
}: FutureFeatureProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${
          disabled
            ? 'opacity-50 pointer-events-none select-none grayscale'
            : ''
        } transition-opacity duration-200`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {/* Tooltip */}
      {showTooltip && disabled && (
        <div className="absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded-md shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

// Higher-order component for wrapping components
export function withFutureFeature<P extends object>(
  Component: React.ComponentType<P>,
  options: { tooltip?: string; disabled?: boolean } = {}
) {
  const { tooltip = 'Active in future', disabled = true } = options;

  return function FutureWrappedComponent(props: P) {
    return (
      <FutureFeature tooltip={tooltip} disabled={disabled}>
        <Component {...props} />
      </FutureFeature>
    );
  };
}
