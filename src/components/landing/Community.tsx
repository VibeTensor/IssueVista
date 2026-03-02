import React from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { siteConfig } from './config';
import { Ripple } from './ui/ripple';
import { GitHubIcon } from './icons';

const ease = [0.16, 1, 0.3, 1] as const;

export function Community() {
  return (
    <Section id="community" title="Community" subtitle="Built in the open, for everyone">
      <div
        className="relative overflow-hidden rounded-2xl border py-20 text-center"
        style={{
          borderColor: 'oklch(0.91 0.008 264 / 0.5)',
          backgroundColor: 'oklch(0.98 0.004 264)'
        }}
      >
        <Ripple mainCircleSize={180} numCircles={6} mainCircleOpacity={0.15} />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <motion.div
            className="flex -space-x-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            {['P', 'K', 'D', 'V', 'T'].map((letter, i) => (
              <div
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold text-white"
                style={{
                  backgroundColor: `oklch(${0.58 + i * 0.04} 0.13 ${200 + i * 30})`,
                  borderColor: 'oklch(0.98 0.004 264)'
                }}
              >
                {letter}
              </div>
            ))}
          </motion.div>

          <motion.p
            className="max-w-md text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease }}
          >
            IssueVista is open source and community-driven. Star us on GitHub to show your support.
          </motion.p>

          <motion.a
            href={siteConfig.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105"
            style={{ backgroundColor: 'oklch(0.15 0.02 264)' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease }}
          >
            <GitHubIcon className="h-4 w-4" />
            Star on GitHub
          </motion.a>
        </div>
      </div>
    </Section>
  );
}
