import React from 'react';

interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
}

export default function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute inset-0 w-full h-full"
        >
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="oklch(0.52 0.01 264 / 0.2)"
            strokeWidth="1"
          />
        </svg>
      )}
      <div
        style={
          {
            '--duration': `${duration}`,
            '--radius': `${radius}`,
            '--delay': `${-delay}`,
            animationName: 'orbit',
            animationDuration: `${duration}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `${-delay}s`,
            animationDirection: reverse ? 'reverse' : 'normal'
          } as React.CSSProperties
        }
        className={`absolute flex w-8 h-8 items-center justify-center rounded-full border border-gray-200/20 bg-white/5 dark:bg-white/10 ${className || ''}`}
      >
        {children}
      </div>
    </>
  );
}
