import React, { forwardRef } from 'react';
import FlickeringGrid from './ui/flickering-grid';

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { id, title, subtitle, description, children, className },
  ref
) {
  return (
    <section id={id} ref={ref}>
      <div className={`relative mx-auto w-full max-w-[1000px] px-4 ${className || ''}`}>
        {(title || subtitle || description) && (
          <div className="relative mx-auto overflow-hidden py-8 md:py-12 text-center">
            {title && (
              <h2 className="text-sm font-semibold tracking-wide uppercase text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <h3 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.95_0.004_264)]">
                {subtitle}
              </h3>
            )}
            {description && (
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]">
                {description}
              </p>
            )}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-full w-full bg-gradient-to-t from-[oklch(0.98_0.004_264)] dark:from-[oklch(0.1648_0.0075_270.93)] from-50% -z-10" />
            <FlickeringGrid
              squareSize={4}
              gridGap={4}
              color="#6B7280"
              maxOpacity={0.15}
              flickerChance={0.1}
              className="-z-20 absolute inset-0 w-full h-full"
            />
          </div>
        )}
        {children}
      </div>
    </section>
  );
});
