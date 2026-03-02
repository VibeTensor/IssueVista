import React from 'react';
import { motion } from 'framer-motion';
import { AuroraText } from './ui/aurora-text';
import { Section } from './Section';
import { siteConfig } from './config';
import { ArrowRightIcon } from './icons';

const ease = [0.16, 1, 0.3, 1] as const;

function HeroPill() {
  return (
    <motion.div
      className="flex items-center gap-2 rounded-full px-3 py-1 text-sm"
      style={{
        backgroundColor: 'oklch(0.78 0.13 291 / 0.15)',
        border: '1px solid oklch(0.78 0.13 291 / 0.3)'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease }}
    >
      <span
        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: 'oklch(0.78 0.13 291)' }}
      >
        Open Source
      </span>
      <span className="text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]">
        Find beginner-friendly issues
      </span>
    </motion.div>
  );
}

function HeroTitles() {
  return (
    <div className="flex w-full max-w-3xl flex-col pt-8">
      <motion.h1
        className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
        animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
        transition={{ duration: 1, ease }}
      >
        <motion.span
          className="inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
        >
          <AuroraText className="leading-normal font-bold">{siteConfig.hero.title}</AuroraText>
        </motion.span>
      </motion.h1>
      <motion.p
        className="mt-4 max-w-xl text-lg leading-relaxed text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease }}
      >
        {siteConfig.hero.description}
      </motion.p>
    </div>
  );
}

function HeroCTA() {
  return (
    <motion.div
      className="mt-8 flex flex-col sm:flex-row items-start gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease }}
    >
      <a
        href="/app"
        className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium text-white transition-transform hover:scale-105"
        style={{ backgroundColor: 'oklch(0.78 0.13 291)' }}
      >
        {siteConfig.hero.cta}
        <ArrowRightIcon className="h-4 w-4" />
      </a>
      <a
        href={siteConfig.repo}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-base font-medium transition-colors"
        style={{
          borderColor: 'oklch(0.91 0.008 264)',
          color: 'oklch(0.15 0.02 264)'
        }}
      >
        View on GitHub
      </a>
    </motion.div>
  );
}

function HeroVisual() {
  return (
    <motion.div
      className="relative hidden lg:flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.8, ease }}
    >
      <div
        className="relative w-80 rounded-xl border p-4 shadow-lg"
        style={{
          backgroundColor: 'oklch(0.98 0.004 264 / 0.9)',
          borderColor: 'oklch(0.91 0.008 264)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div
          className="flex items-center gap-2 mb-3 pb-3"
          style={{ borderBottom: '1px solid oklch(0.91 0.008 264)' }}
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: 'oklch(0.68 0.15 15)' }}
          />
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: 'oklch(0.78 0.17 85)' }}
          />
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: 'oklch(0.68 0.17 145)' }}
          />
        </div>
        {[
          {
            label: 'good first issue',
            color: 'oklch(0.68 0.17 145)',
            title: 'Add dark mode toggle'
          },
          { label: 'help wanted', color: 'oklch(0.78 0.13 291)', title: 'Fix pagination logic' },
          { label: 'beginner', color: 'oklch(0.68 0.17 210)', title: 'Update README docs' }
        ].map((issue, i) => (
          <motion.div
            key={i}
            className="rounded-lg border p-3 mb-2 last:mb-0"
            style={{
              borderColor: 'oklch(0.91 0.008 264 / 0.7)',
              backgroundColor: 'oklch(0.96 0.004 264 / 0.5)'
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + i * 0.15, duration: 0.5, ease }}
          >
            <p className="text-sm font-medium text-[oklch(0.15_0.02_264)]">{issue.title}</p>
            <span
              className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: issue.color }}
            >
              {issue.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <Section id="hero">
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 w-full pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="flex flex-col justify-start items-start">
          <HeroPill />
          <HeroTitles />
          <HeroCTA />
        </div>
        <HeroVisual />
      </div>
    </Section>
  );
}
