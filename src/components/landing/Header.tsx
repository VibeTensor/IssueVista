import React, { useState, useEffect } from 'react';
import { siteConfig } from './config';
import { LogoIcon, GitHubIcon, MenuIcon, CloseIcon } from './icons';

const navLinks = [
  { text: 'Features', href: '#features' },
  { text: 'Use Cases', href: '#use-cases' },
  { text: 'Community', href: '#community' }
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'oklch(0.98 0.004 264 / 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid oklch(0.91 0.008 264 / 0.5)' : 'none'
      }}
    >
      <div
        className="dark:hidden"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: scrolled ? 'oklch(0.98 0.004 264 / 0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px) saturate(180%)' : 'none'
        }}
      />
      <style>{`
        .dark header {
          background-color: ${scrolled ? 'oklch(0.1648 0.0075 270.93 / 0.8)' : 'transparent'} !important;
          border-bottom-color: ${scrolled ? 'oklch(0.3 0.01 264 / 0.5)' : 'transparent'} !important;
        }
      `}</style>
      <nav className="relative mx-auto flex max-w-[1000px] items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2 z-10">
          <LogoIcon className="h-6 w-6 text-[oklch(0.78_0.13_291)]" />
          <span className="text-lg font-bold text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.95_0.004_264)]">
            {siteConfig.name}
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.text}
              href={link.href}
              className="text-sm font-medium text-[oklch(0.52_0.01_264)] hover:text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.7_0.01_264)] dark:hover:text-[oklch(0.95_0.004_264)] transition-colors"
            >
              {link.text}
            </a>
          ))}
          <a
            href={siteConfig.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[oklch(0.52_0.01_264)] hover:text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.7_0.01_264)] dark:hover:text-[oklch(0.95_0.004_264)] transition-colors"
            aria-label="GitHub"
          >
            <GitHubIcon className="h-5 w-5" />
          </a>
          <a
            href="/app"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'oklch(0.78 0.13 291)' }}
          >
            Start Searching
          </a>
        </div>

        <button
          className="md:hidden z-10 text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.95_0.004_264)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>

        {mobileOpen && (
          <div
            className="absolute top-full left-0 right-0 border-b py-4 px-4 md:hidden"
            style={{
              backgroundColor: 'oklch(0.98 0.004 264 / 0.95)',
              backdropFilter: 'blur(12px)',
              borderColor: 'oklch(0.91 0.008 264 / 0.5)'
            }}
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.text}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium py-2 text-[oklch(0.52_0.01_264)]"
                >
                  {link.text}
                </a>
              ))}
              <a
                href="/app"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white text-center"
                style={{ backgroundColor: 'oklch(0.78 0.13 291)' }}
              >
                Start Searching
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
