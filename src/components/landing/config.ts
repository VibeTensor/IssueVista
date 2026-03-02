export const siteConfig = {
  name: 'IssueVista',
  description: 'Find Beginner-Friendly GitHub Issues',
  url: 'https://issuevista.vibetensor.com',
  repo: 'https://github.com/VibeTensor/IssueVista',
  hero: {
    title: 'IssueVista',
    description:
      'Discover unassigned GitHub issues perfect for your first open-source contribution. Smart filtering, difficulty badges, and visual clustering help you find the right issue fast.',
    cta: 'Start Searching',
    ctaLink: '/app',
    pill: 'Open Source'
  },
  features: [
    {
      name: 'GitHub GraphQL API',
      description:
        'Powered by GitHub GraphQL for fast, efficient issue discovery across any public repository.',
      icon: 'graphql'
    },
    {
      name: 'Advanced Filter DSL',
      description:
        'Boolean operators (AND, OR, NOT) let you build precise queries to find exactly the issues you want.',
      icon: 'filter'
    },
    {
      name: 'Difficulty Badges',
      description:
        'Automatic Easy, Medium, and Hard classification so you can pick issues that match your skill level.',
      icon: 'badge'
    },
    {
      name: 'Dark Mode + 6 Themes',
      description:
        'Choose from 6 color presets including Midnight, Ocean, Forest, and Sunset for a comfortable experience.',
      icon: 'palette'
    },
    {
      name: 'Export to Markdown/CSV',
      description:
        'Export your filtered results to Markdown, CSV, or plain text for offline tracking and sharing.',
      icon: 'export'
    },
    {
      name: 'Search History',
      description:
        'Your recent searches are saved locally so you can quickly revisit repositories and filters.',
      icon: 'history'
    }
  ],
  useCases: [
    {
      title: 'Issue Discovery',
      description:
        'Browse unassigned issues across any GitHub repo with smart filters for labels, language, and activity.',
      icon: 'search'
    },
    {
      title: 'Smart Filtering',
      description:
        'Use boolean operators and filter DSL to narrow down thousands of issues to the ones that matter.',
      icon: 'filter'
    },
    {
      title: 'Export & Share',
      description:
        'Export filtered results to Markdown, CSV, or plain text, and share search URLs with your team.',
      icon: 'export'
    }
  ],
  stats: [
    { value: '500+', label: 'Repos Searched' },
    { value: '10K+', label: 'Issues Discovered' },
    { value: '100%', label: 'Open Source' }
  ],
  footer: {
    socialLinks: [
      { name: 'GitHub', url: 'https://github.com/VibeTensor/IssueVista', icon: 'github' },
      { name: 'Twitter', url: 'https://twitter.com/vibetensor', icon: 'twitter' }
    ],
    links: [
      { text: 'Features', url: '#features' },
      { text: 'Use Cases', url: '#use-cases' },
      { text: 'Community', url: '#community' },
      { text: 'GitHub', url: 'https://github.com/VibeTensor/IssueVista' }
    ],
    bottomText: 'Built by VibeTensor Private Limited',
    brandText: 'ISSUEVISTA'
  }
};

export type SiteConfig = typeof siteConfig;
