# Changelog

All notable changes to IssueVista will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Nothing yet

## [1.2.0] - 2026-01-20

### Added

- **Topic Cluster Visualization** (#154): D3-powered issue clustering by labels
  - Bubble-chart visualization grouping issues by shared labels
  - Server-side force simulation via Cloudflare Pages Function
  - Smooth client-side animation and interactivity
  - Click-to-filter: clicking a cluster filters results to that label
  - Zoom controls (zoom in, zoom out, reset)
  - Tooltip showing cluster details on hover
  - Responsive canvas sizing with viewBox scaling
  - Debounced resizing for performance
  - ARIA live regions for accessibility
  - Loading indicator with accessibility announcements
  - CORS whitelist and input validation for security

- **ExportMenu Accessibility Improvements** (#216): WCAG 2.1 compliance
  - Proper focus management (focus trap within menu)
  - aria-expanded and aria-haspopup attributes
  - Screen reader announcements for export actions
  - Keyboard navigation (arrow keys, Enter, Escape)
  - Focus returns to trigger button on close

- **Enhanced Dark Mode with Custom Themes** (#142): Multiple theme presets
  - 6 theme presets: Light, Dark, Midnight, Ocean, Forest, Sunset
  - Each dark theme has unique color palette (indigo, blue, green, orange)
  - ThemeSelector popover UI with floating trigger button
  - System preference toggle for automatic theme detection
  - CSS custom properties for consistent theming across components
  - Full keyboard navigation (arrow keys, Enter, Escape)
  - ARIA radiogroup pattern for accessibility (WCAG 2.1 compliant)
  - Click-outside-to-close behavior
  - localStorage persistence with legacy migration support

- **Authentication State Indicator** (#187): Visual auth status in header
  - Emerald pulsing dot when authenticated with GitHub
  - CSS tooltip on hover showing "Authenticated with GitHub"
  - Cross-tab sync via storage event listener
  - Same-tab sync via custom event dispatch
  - Accessible with role="status" and sr-only text (WCAG 2.1 compliant)
  - prefers-reduced-motion support (disables pulse animation)

- **Header Branding** (#190): Site header with IssueVista branding
  - Sticky header with product name, version badge, and tagline
  - GitHub repository and star links in navigation
  - Matches Footer component styling (dark/light mode support)
  - Responsive design with hidden tagline on mobile
  - Accessible with ARIA labels and semantic HTML

- **RateLimitDisplay Accessibility** (#215): WCAG 2.1 compliant rate limit status
  - role="status" for semantic live region (implicit aria-live and aria-atomic)
  - aria-label for descriptive screen reader context
  - Screen reader warning when API rate limit is low (<10 requests)

- **Visual Issue Difficulty Badges** (#145): Color-coded difficulty indicators
  - Automatic difficulty calculation (Easy/Medium/Hard)
  - Weighted scoring: Labels (40%), Comments (30%), Body Length (30%)
  - Green badge for Easy, Amber for Medium, Red for Hard issues
  - Tooltip with difficulty explanation on hover
  - Recognizes beginner-friendly labels (good first issue, documentation, etc.)
  - Accessible with aria-label and text labels (not color-only)
  - Integrated in both mobile and desktop IssueCard layouts

- **Repository Statistics Summary Panel** (#147): Collapsible stats display
  - Stars, forks, open issues, and watchers count at a glance
  - Number formatting with K/M suffix for large numbers
  - Collapsible panel with smooth expand/collapse animation
  - Loading skeleton with shimmer effect during fetch
  - Language badge showing primary repository language
  - Parallel API fetch (stats load alongside issues)
  - Graceful fallback (panel hidden if stats unavailable)
  - Full keyboard navigation (Enter/Space to toggle)
  - ARIA accessibility (aria-expanded, aria-controls)
  - Responsive 2-column grid on mobile devices
  - prefers-reduced-motion support

- **Visual Issue Complexity Meter** (#152): Progress bar showing issue complexity
  - Linear progress bar visualization (0-100% scale)
  - Gradient colors: Green (easy), Amber (medium), Red (hard)
  - Reuses difficulty scoring from Issue #145
  - Tooltip with complexity percentage and breakdown
  - Integrated alongside DifficultyBadge in IssueCard
  - WCAG 2.1 accessible with progressbar role
  - Responsive sizing for mobile and desktop layouts
  - Light mode support with CSS overrides

- **Language Filter Chips** (#153): Multi-select programming language filters
  - Extracts languages from issue labels automatically
  - GitHub Linguist colors for 40+ programming languages
  - Devicon CDN icons with graceful fallback to colored dots
  - Multi-select toggle with visual selected state
  - Frequency count badges showing issues per language
  - ARIA listbox pattern with multiselectable support
  - Keyboard navigation (Tab, Space/Enter to toggle)
  - Clear button to reset language selections
  - Integrated in sidebar filter panel below Labels
  - SvelteSet for optimal reactive state management
  - maxChips prop to limit displayed languages (default: 10)
  - prefers-reduced-motion support for animations

- **Search Autocomplete** (#129): Intelligent suggestions while typing
  - Combines search history with popular repository suggestions
  - Prefix-based filtering with case-insensitive matching
  - Text highlighting for matching portions
  - History items ranked by recency (clock icon)
  - Popular repos shown with trending icon (fire)
  - Screen reader announcements via aria-live region
  - "No matches" empty state with helpful hint
  - Full keyboard navigation (arrow keys, Enter, Escape)
  - WAI-ARIA combobox pattern for accessibility

- **Infinite Scroll** (#131): Seamless pagination for large result sets
  - IntersectionObserver-based scroll detection with 200px preload
  - Cursor-based pagination for GraphQL API
  - REST API fallback with page-based pagination
  - Skeleton loading cards during fetch
  - Error retry mechanism with retry button
  - Debounce protection to prevent duplicate API calls
  - Dynamic footer showing progress (X of Y issues)

- **Toast Notification System** (#174): Visual feedback for copy actions
  - Brief "Copied to clipboard!" toast notification
  - 2-second auto-dismiss with fade animation
  - Accessible with aria-live region (WCAG 2.1 4.1.3 compliant)
  - prefers-reduced-motion support
  - Teal gradient styling matching brand design

- **Quick Actions Context Menu** (#139): Right-click actions for issues
  - Copy issue link, open in new tab, bookmark options
  - Context-aware positioning (viewport boundaries)
  - Click-outside-to-close behavior
  - Keyboard accessible with Escape to close

- **Light/Dark Theme Toggle** (#180): Quick theme switching
  - Floating toggle button in corner
  - Smooth transition between themes
  - localStorage persistence
  - System preference detection

- **Fade-in Animation for Issue Cards** (#183): Visual polish
  - Staggered animation on search results load
  - CSS-only implementation for performance
  - prefers-reduced-motion support

- **Shareable Search URLs** (#140): Link to search results
  - Query parameters for repository and filters
  - URL updates on search
  - Direct linking to specific searches
  - Browser back/forward navigation support

- **Good First Issue Badge** (#181): Beginner-friendly indicators
  - Visual badge for issues with beginner labels
  - Recognizes common labels (good first issue, beginner, etc.)
  - Integrated in IssueCard component

- **Interactive Tag Cloud** (#137): Visual label exploration
  - Animated tag cloud visualization
  - Click to filter by label
  - Size based on frequency
  - Hover effects and tooltips

- **Scroll-to-Top Button** (#178): Quick navigation
  - Appears after scrolling down
  - Smooth scroll animation
  - Accessible button with aria-label

- **Loading Skeleton Cards** (#172): Perceived performance
  - Skeleton placeholder during search
  - Shimmer animation effect
  - Matches IssueCard layout

- **Search Clear Button** (#177): Input UX improvement
  - X button to clear search input
  - Appears when input has value
  - Focus remains on input after clear

- **Interactive Issue Preview Card** (#125): Enhanced issue display
  - Hover effects and animations
  - Expandable details on click
  - Smooth transitions

- **Smart Search Sorting** (#122): Intelligent result ordering
  - Relevance scoring algorithm
  - Multiple sort options (date, comments, relevance)
  - Visual sort indicators

- **Advanced Search Filters** (#121): Boolean operators
  - AND, OR, NOT operators
  - Label-based filtering
  - Date range filters
  - Filter builder UI

- **Keyboard Shortcut Hint** (#166): Discoverability
  - Visual hint showing Enter key for search
  - Appears in search input
  - Accessible with aria-label

- **Results Count Header** (#163): Search feedback
  - Total issues found displayed in header
  - Updates dynamically with filters
  - Clear formatting with number separators

- **Placeholder Examples** (#162): Onboarding help
  - Example repository suggestions in placeholder
  - Popular repos shown as hints
  - Clickable to auto-fill input

- **Save Last Repository** (#188): Convenience feature
  - localStorage persistence of last search
  - Auto-fills on page return
  - Clear option available

- **Copy Repository URL** (#161): Quick sharing
  - Copy button next to repo input
  - Visual feedback on copy
  - Tooltip with action label

- **ESC Key to Close Help Popup** (#160): Keyboard UX
  - Global Escape key handler
  - Closes help popup when open
  - Focus management on close

- **Search History Export** (#127): Data portability
  - Export to JSON format
  - Export to CSV format
  - Download as file

- **Search History** (#62): History tracking
  - localStorage persistence
  - Recent searches dropdown
  - Quick re-search on click
  - Delete individual entries

- **Loading Progress with Cancel** (#23): Search control
  - Progress indicator during search
  - Status messages (fetching, processing)
  - Cancel button to abort search

### Changed

- **Code Style Guide** (#196): Documentation for contributors
  - TypeScript conventions
  - Svelte 5 patterns
  - Testing guidelines
  - Formatting rules

### Technical

- **ESLint and Prettier Configuration** (#74): Code quality tooling
- **TypeScript CI Check** (#50): Stricter type checking in CI
- **EditorConfig** (#48): Consistent formatting across editors
- **Security Policy** (#45): SECURITY.md with vulnerability reporting
- **Hacktoberfest Labels** (#52): Community contribution support

### Security

- **h3 Request Smuggling Vulnerability** (GHSA-mp2g-9vg9-f4cg): Fixed dependency vulnerability

## [1.1.0] - 2025-11-30

### Added

- **Empty State System** (#30): Comprehensive empty state with context-aware illustrations
  - 5 variants: initial, no-results, error, rate-limited, success
  - Custom SVG illustrations matching sketch-style design
  - Animated floating illustrations with CSS animations
  - WCAG 2.1 accessible with ARIA live regions
  - prefers-reduced-motion support

- **Footer Component** (#21): Professional footer with links and social sharing
  - Version display synced with package.json
  - Social sharing buttons (Twitter, LinkedIn, copy link)
  - VibeTensor Private Limited attribution
  - External links with proper accessibility attributes

- **Zero-Comment Highlighting** (#20): Visual indicators for issues with no comments
  - Green badge for zero-comment issues (great for first-timers)
  - Filter toggle to show only zero-comment issues
  - Sort option by comment count

- **Smart Relative Time Display** (#17): Human-friendly date formatting
  - Relative time display (Today, Yesterday, X days ago)
  - Freshness indicators (green/amber/gray dots)
  - Tooltip with exact date on hover
  - Screen reader accessible

- **Auto-Focus & URL Validation** (#16): Improved search UX
  - Auto-focus on repository URL input on page load
  - Real-time URL validation with debouncing
  - Visual feedback (green checkmark/red warning)
  - Accessible error messages

- **Export Issues Feature** (#10): Download issue links
  - Export to Markdown format
  - Export to JSON format
  - Export to plain text
  - Copy all links to clipboard

- **Copy Issue Link Button** (#14): One-click copy for individual issues
  - Copy button on each issue card
  - Visual feedback on copy success
  - Keyboard accessible

- **Help Button Animation** (#2): Improved discoverability for new users
  - Pulse animation on help button
  - Pure CSS implementation for performance
  - Animation pauses on hover
  - prefers-reduced-motion support

### Changed

- **Brand Redesign**: New IssueVista identity
  - New logo: Issues flowing through pipeline (S-curve with three nodes)
  - Monochromatic teal color palette (#0d9488, #14b8a6)
  - Updated favicon and Open Graph image
  - Streamlined documentation

- **Component Architecture** (#35): Improved code organization
  - Decomposed ResultsList.svelte into modular components
  - SearchForm, IssueCard, ExportMenu, FilterControls separated
  - Better maintainability and testability

### Technical

- 403 unit tests covering all utility functions
- 54+ E2E tests for browser-based validation
- Improved test coverage for edge cases
- Updated .gitignore for cleaner repository

---

## [1.0.0] - 2025-01-10

### Added

- Initial release of IssueVista
- GitHub issue finder with smart filtering (open, unassigned, no PRs)
- Multiple authentication options (GitHub OAuth, Personal Access Token, No Auth)
- GraphQL API support for authenticated users (5000 req/hr)
- REST API fallback for unauthenticated users (60 req/hr)
- Mobile-responsive design with hand-drawn sketch aesthetic
- Interactive help popup with step-by-step token generation guide
- Rate limit display and tracking
- Privacy-first approach (local token storage only)
- Monochromatic slate color scheme
- Support for GitHub OAuth Device Flow
- Comprehensive documentation (README, CONTRIBUTING, OAUTH_SETUP, DEPLOYMENT)
- MIT License
- Issue and PR templates for contributors

### Features

- **Smart Filtering**: Automatically filters for open, unassigned issues without pull requests
- **Authentication Options**: OAuth, Personal Token, or No Auth
- **Performance Optimized**: Built with Astro 5.x, Svelte, and UnoCSS
- **Mobile-First**: Fully responsive design tested on all devices
- **Help Guide**: Interactive popup with detailed instructions
- **Rate Limit Friendly**: Clear display of remaining requests

### Technical

- Astro 5.x for static site generation
- Svelte 5 for interactive components
- UnoCSS for atomic CSS
- GitHub GraphQL API integration
- GitHub REST API fallback
- TypeScript for type safety
- Cloudflare Pages deployment

### Documentation

- README.md with quick start guide
- CONTRIBUTING.md with contribution guidelines
- OAUTH_SETUP.md with OAuth configuration
- DEPLOYMENT.md with deployment instructions
- GitHub issue and PR templates

---

## Release Notes

### Version 1.0.0

This is the initial public release of IssueVista, a tool designed to help developers find unassigned GitHub issues ready for contribution.

**Key Highlights:**

- Clean, intuitive interface
- Works with or without authentication
- Fast performance with GraphQL API
- Mobile-responsive design
- Privacy-focused (no server-side data storage)
- Open source under MIT License

**Live Demo:** [https://issuevista.vibetensor.com](https://issuevista.vibetensor.com)

**Repository:** [https://github.com/VibeTensor/IssueVista](https://github.com/VibeTensor/IssueVista)

---

## Future Roadmap

Planned features for future releases:

- [ ] Save favorite repositories
- [x] Advanced filtering options (labels, date ranges) - Added in v1.2.0 (#153)
- [ ] Browser extension
- [x] Dark/Light theme toggle - Added in v1.2.0 (#142)
- [ ] Issue bookmarking
- [ ] Multi-repository search
- [ ] GitHub trending integration
- [ ] Contribution analytics
- [ ] Keyboard shortcuts
- [ ] Offline support (PWA)
- [x] Issue difficulty estimation - Added in v1.2.0 (#145, #152)

---

For detailed information about changes in each version, see the [Git commit history](https://github.com/VibeTensor/IssueVista/commits/master).

[1.2.0]: https://github.com/VibeTensor/IssueVista/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/VibeTensor/IssueVista/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/VibeTensor/IssueVista/releases/tag/v1.0.0
