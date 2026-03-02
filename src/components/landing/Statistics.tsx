import React from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { siteConfig } from './config';
import { BorderText } from './ui/border-text';

const ease = [0.16, 1, 0.3, 1] as const;

export function Statistics() {
  return (
    <Section id="statistics">
      <div
        className="relative overflow-hidden rounded-2xl py-16 px-8 text-center"
        style={{
          background:
            'radial-gradient(ellipse at center, oklch(0.78 0.13 291 / 0.1), transparent 70%)'
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
          {siteConfig.stats.map((stat, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6, ease }}
            >
              <span
                className="text-5xl md:text-6xl font-bold tracking-tight"
                style={{ color: 'oklch(0.78 0.13 291)' }}
              >
                {stat.value}
              </span>
              <span className="mt-2 text-sm font-medium text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <BorderText
            text="ISSUEVISTA"
            className="text-[clamp(2rem,10vw,6rem)] font-mono tracking-tighter font-medium"
          />
        </motion.div>
      </div>
    </Section>
  );
}
