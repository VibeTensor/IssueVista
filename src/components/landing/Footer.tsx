import React from 'react';
import { siteConfig } from './config';
import { LogoIcon, GitHubIcon, TwitterIcon } from './icons';
import { BorderText } from './ui/border-text';

const socialIconMap: Record<string, React.FC<{ className?: string }>> = {
  github: GitHubIcon,
  twitter: TwitterIcon
};

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1000px] px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon className="h-5 w-5" style={{ color: 'oklch(0.78 0.13 291)' }} />
            <span className="text-lg font-bold text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.95_0.004_264)]">
              {siteConfig.name}
            </span>
          </div>

          <div className="flex gap-3">
            {siteConfig.footer.socialLinks.map((link, index) => {
              const Icon = socialIconMap[link.icon] || GitHubIcon;
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[oklch(0.52_0.01_264)] hover:text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.7_0.01_264)] dark:hover:text-[oklch(0.95_0.004_264)] transition-colors"
                  aria-label={link.name}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {siteConfig.footer.links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  className="text-sm font-medium text-[oklch(0.52_0.01_264)] hover:text-[oklch(0.15_0.02_264)] dark:text-[oklch(0.7_0.01_264)] dark:hover:text-[oklch(0.95_0.004_264)] transition-colors"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm text-[oklch(0.52_0.01_264)] dark:text-[oklch(0.7_0.01_264)]">
            {siteConfig.footer.bottomText}
          </p>
        </div>

        <BorderText
          text={siteConfig.footer.brandText}
          className="text-[clamp(3rem,15vw,10rem)] overflow-hidden font-mono tracking-tighter font-medium"
        />
      </div>
    </footer>
  );
}
