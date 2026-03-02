import React, { memo } from 'react';

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
}

export const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className
}: RippleProps) {
  return (
    <div
      className={`pointer-events-none select-none absolute inset-0 ${className || ''}`}
      style={{
        maskImage: 'linear-gradient(to bottom, white, transparent)'
      }}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';
        const borderOpacity = (5 + i * 5) / 100;

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              borderStyle,
              borderWidth: '1px',
              borderColor: `oklch(0.52 0.01 264 / ${borderOpacity})`,
              backgroundColor: 'oklch(0.52 0.01 264 / 0.03)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(1)',
              animationName: 'ripple',
              animationDuration: '2s',
              animationTimingFunction: 'ease',
              animationDelay: `${i * 0.06}s`,
              animationIterationCount: 'infinite'
            }}
          />
        );
      })}
    </div>
  );
});
