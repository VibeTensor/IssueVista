import React from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { siteConfig } from './config';
import { getIcon } from './icons';
import OrbitingCircles from './ui/orbiting-circles';

const ease = [0.16, 1, 0.3, 1] as const;

function IssueDiscoveryCard() {
  const issues = [
    { title: 'Fix typo in docs', label: 'good first issue', color: 'oklch(0.68 0.17 145)' },
    { title: 'Add unit tests', label: 'help wanted', color: 'oklch(0.78 0.13 291)' },
    { title: 'Update CI config', label: 'beginner', color: 'oklch(0.68 0.17 210)' }
  ];

  return (
    <div className="relative h-48 overflow-hidden rounded-lg p-3">
      {issues.map((issue, i) => (
        <motion.div
          key={i}
          className="mb-2 rounded-md border p-2 text-xs"
          style={{
            borderColor: 'oklch(0.91 0.008 264 / 0.5)',
            backgroundColor: 'oklch(0.96 0.004 264 / 0.5)'
          }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4, ease }}
        >
          <span className="font-medium text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.95_0.004_264)]">
            {issue.title}
          </span>
          <span
            className="ml-2 inline-block rounded-full px-1.5 py-0.5 text-[10px] text-white"
            style={{ backgroundColor: issue.color }}
          >
            {issue.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function FilterCard() {
  const filters = [
    'label:good-first-issue',
    'language:TypeScript',
    'NOT label:wontfix',
    'stars:>100'
  ];

  return (
    <div className="relative h-48 overflow-hidden rounded-lg p-3 font-mono text-xs">
      {filters.map((filter, i) => (
        <motion.div
          key={i}
          className="mb-1.5 flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4, ease }}
        >
          <span style={{ color: 'oklch(0.78 0.13 291)' }}>+</span>
          <span className="text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]">
            {filter}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ClusterCard() {
  return (
    <div className="relative h-48 flex items-center justify-center">
      <OrbitingCircles radius={60} duration={15} delay={0}>
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'oklch(0.78 0.13 291)' }} />
      </OrbitingCircles>
      <OrbitingCircles radius={60} duration={15} delay={5}>
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'oklch(0.68 0.17 145)' }} />
      </OrbitingCircles>
      <OrbitingCircles radius={60} duration={15} delay={10}>
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'oklch(0.68 0.17 210)' }} />
      </OrbitingCircles>
      <OrbitingCircles radius={35} duration={10} delay={0} reverse>
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'oklch(0.68 0.15 15)' }} />
      </OrbitingCircles>
      <OrbitingCircles radius={35} duration={10} delay={5} reverse>
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'oklch(0.68 0.17 321)' }} />
      </OrbitingCircles>
      <div
        className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
        style={{ backgroundColor: 'oklch(0.78 0.13 291)' }}
      >
        D3
      </div>
    </div>
  );
}

const cardVisuals = [IssueDiscoveryCard, FilterCard, ClusterCard];

export function UseCases() {
  return (
    <Section id="use-cases" title="Use Cases" subtitle="Three ways IssueVista helps you contribute">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        {siteConfig.useCases.map((useCase, index) => {
          const Icon = getIcon(useCase.icon);
          const Visual = cardVisuals[index];
          return (
            <motion.div
              key={index}
              className="group rounded-xl border overflow-hidden transition-all hover:shadow-lg"
              style={{
                borderColor: 'oklch(0.91 0.008 264 / 0.5)',
                backgroundColor: 'oklch(0.98 0.004 264)'
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5, ease }}
            >
              <div
                className="overflow-hidden"
                style={{ backgroundColor: 'oklch(0.96 0.004 264 / 0.5)' }}
              >
                <Visual />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color: 'oklch(0.78 0.13 291)' }} />
                  <h3 className="text-base font-semibold text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.95_0.004_264)]">
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]">
                  {useCase.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
