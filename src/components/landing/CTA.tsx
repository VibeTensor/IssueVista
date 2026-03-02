import React from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { ArrowRightIcon } from './icons';

const ease = [0.16, 1, 0.3, 1] as const;

export function CTA() {
  return (
    <Section id="cta">
      <div className="py-20 text-center">
        <motion.h2
          className="text-3xl font-bold tracking-tight sm:text-4xl text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.95_0.004_264)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          Ready to find your first open source issue?
        </motion.h2>
        <motion.p
          className="mx-auto mt-4 max-w-lg text-lg text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
        >
          No signup needed. Just pick a repo and start exploring.
        </motion.p>
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease }}
        >
          <a
            href="/app"
            className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-medium text-white transition-transform hover:scale-105"
            style={{ backgroundColor: 'oklch(0.78 0.13 291)' }}
          >
            Start Searching
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </Section>
  );
}
