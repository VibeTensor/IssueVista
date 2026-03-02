import React from 'react';

interface BorderTextProps {
  text: string;
  className?: string;
}

export function BorderText({ text, className = '' }: BorderTextProps) {
  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        WebkitTextStroke: '1px oklch(0.52 0.01 264 / 0.3)',
        color: 'transparent',
        lineHeight: 0.85
      }}
    >
      {text}
    </div>
  );
}
