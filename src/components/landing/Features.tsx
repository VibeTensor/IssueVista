import React from 'react';
import { Section } from './Section';
import { siteConfig } from './config';
import { getIcon } from './icons';

export function Features() {
  return (
    <Section id="features" title="Features" subtitle="Everything you need to find your first issue">
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
        style={{ backgroundColor: 'oklch(0.91 0.008 264 / 0.5)' }}
      >
        {siteConfig.features.map((feature, index) => {
          const Icon = getIcon(feature.icon);
          return (
            <div
              key={index}
              className="flex flex-col items-center gap-3 p-6 text-center transition-colors"
              style={{ backgroundColor: 'oklch(0.98 0.004 264)' }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                style={{
                  background:
                    'linear-gradient(to bottom, oklch(0.78 0.13 291), oklch(0.68 0.13 291))'
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.95_0.004_264)]">
                {feature.name}
              </h3>
              <p className="text-sm leading-relaxed text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
