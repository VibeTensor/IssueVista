# Issue #30: Empty State System Implementation Plan

## Issue Summary
**Title:** Create comprehensive empty state system with illustrations and suggestions
**Issue URL:** https://github.com/VibeTensor/IssueFlow/issues/30
**Assigned to:** @ascender1729
**Labels:** `enhancement`, `good first issue`
**Estimated Time (with AI):** 480 minutes
**Estimated Time (without AI):** 930 minutes

---

## Problem Statement

Currently, IssueFlow lacks proper empty state handling. When users:
- First visit the app (no search performed)
- Search a repo with no unassigned issues
- Encounter API errors or rate limits

They see blank/confusing screens with no guidance on what to do next.

**Impact:** 88% of users won't return after one bad experience. Empty states are critical UX touchpoints.

---

## Research Summary

### Best Practices Gathered From:
- [GitHub Primer Design System](https://primer.style/ui-patterns/empty-states/)
- [PatternFly Empty State](https://www.patternfly.org/components/empty-state/design-guidelines/)
- [Carbon Design System](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- [NN/g Empty State Guidelines](https://www.nngroup.com/articles/empty-state-interface-design/)
- [Mobbin - 4,000+ Examples](https://mobbin.com/glossary/empty-state)

### Key Principles:
1. **Never leave users at a dead end** - Always provide next steps
2. **One idea per empty state** - Avoid cognitive overload (Hick's Law)
3. **Match tone to context** - Playful for success, matter-of-fact for errors
4. **Use ARIA live regions** - For accessibility announcements
5. **Replace content entirely** - Don't show empty containers/headers

### Top Implementation References:
- **GitHub:** Post-completion Octocat illustration, encouraging break
- **Notion:** Minimalist, monochrome, subtle suggestions
- **Linear:** Simple illustrations blending into interface
- **Spotify:** Smart suggestions in empty playlists

---

## Acceptance Criteria (from Issue)

- [ ] Friendly empty state illustration displayed
- [ ] Different messages for different contexts
- [ ] Suggestion buttons provided
- [ ] Subtle animation on illustration
- [ ] Help link available
- [ ] Reusable component created
- [ ] Unit tests for state logic
- [ ] E2E tests for all empty state scenarios

---

## Technical Architecture

### Empty State Variants

| Variant | Trigger | Use Case |
|---------|---------|----------|
| `initial` | Page load, no search yet | First-time user experience |
| `no-results` | Search returns 0 issues | Valid repo but no matching issues |
| `error` | API error, invalid repo | Something went wrong |
| `rate-limited` | GitHub API 403 response | Rate limit exceeded |
| `success` | All issues reviewed (future) | Completion celebration |

### Component Props Interface

```typescript
interface EmptyStateProps {
  variant: 'initial' | 'no-results' | 'error' | 'rate-limited' | 'success';
  customTitle?: string;
  customDescription?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  showIllustration?: boolean;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/shared/EmptyState.svelte` | Main reusable component |
| `src/lib/empty-state-utils.ts` | Configuration, state detection |
| `src/components/shared/illustrations/` | SVG illustration components |
| `tests/empty-state-utils.test.ts` | Unit tests |
| `tests/e2e/empty-state.spec.ts` | E2E tests |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/ResultsList.svelte` | Integrate EmptyState component |
| `src/components/shared/index.ts` | Export EmptyState |

---

## Content Strategy

### Variant: `initial`
- **Illustration:** Magnifying glass with code brackets `{ }`
- **Title:** "Ready to find issues?"
- **Description:** "Enter a GitHub repository URL above to discover unassigned issues waiting for contributors"
- **Primary CTA:** "Try Popular Repos" (dropdown/suggestions)
- **Secondary CTA:** "How it works" (link to help)

### Variant: `no-results`
- **Illustration:** Empty folder/box with question mark
- **Title:** "No issues found"
- **Description:** "This repository has no unassigned issues without pull requests. Try another repository or adjust filters"
- **Primary CTA:** "Clear Filters" (if filters active) OR "Search Another Repo"
- **Secondary CTA:** "Browse popular repositories"

### Variant: `error`
- **Illustration:** Warning triangle with exclamation
- **Title:** "Something went wrong"
- **Description:** "We couldn't fetch issues from this repository. Please check the URL and try again"
- **Primary CTA:** "Retry"
- **Secondary CTA:** "Report Issue" (link to GitHub issues)

### Variant: `rate-limited`
- **Illustration:** Clock/hourglass
- **Title:** "API limit reached"
- **Description:** "GitHub's rate limit was exceeded. Please wait a moment and try again"
- **Primary CTA:** "Retry" (with countdown if possible)
- **Secondary CTA:** "Learn about rate limits" (GitHub docs)

### Variant: `success`
- **Illustration:** Checkmark with celebration elements
- **Title:** "All caught up!"
- **Description:** "You've reviewed all the issues. Time for a well-deserved break!"
- **Primary CTA:** "Search Another Repo"
- **Secondary CTA:** None

---

## Design Specifications

### Visual Style
- Match existing sketch/hand-drawn aesthetic
- Use `filter: url(#sketch)` from SVGFilters
- Monochrome illustrations (slate colors)
- Consistent with Footer component design

### Layout
```
┌─────────────────────────────────────────────────┐
│                                                 │
│            ┌─────────────────┐                  │
│            │   Illustration  │                  │
│            │    (120x120)    │                  │
│            └─────────────────┘                  │
│                                                 │
│              Primary Heading                    │
│            (text-xl, font-bold)                 │
│                                                 │
│            Secondary Description                │
│         (text-sm, text-slate-400)               │
│                                                 │
│         ┌─────────────────────┐                 │
│         │   Primary Button    │                 │
│         └─────────────────────┘                 │
│                                                 │
│              Secondary Link                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Spacing (following PatternFly guidelines)
- Container: `py-12 px-6`
- Illustration to title: `mb-6`
- Title to description: `mb-2`
- Description to actions: `mb-6`
- Primary to secondary: `mt-3`

### Animation
- Subtle floating animation on illustration (2-3s ease-in-out)
- Fade-in on component mount
- Respect `prefers-reduced-motion: reduce`

---

## Accessibility Requirements

### WCAG Compliance
- **4.1.3 Status Messages:** Use `aria-live="polite"` for state changes
- **1.1.1 Non-text Content:** Decorative images have `aria-hidden="true"`
- **2.1.1 Keyboard:** All interactive elements keyboard accessible
- **2.4.6 Headings:** Proper heading hierarchy (h2 for title)

### Implementation
```svelte
<div
  class="empty-state"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  <div class="illustration" aria-hidden="true">
    <!-- SVG illustration -->
  </div>
  <h2 class="title">{title}</h2>
  <p class="description">{description}</p>
  <!-- Actions -->
</div>
```

---

## Implementation Phases

### Phase 0: Setup & Planning (This Document)
- [x] Research best practices
- [x] Define acceptance criteria mapping
- [x] Create implementation plan
- [ ] Create feature branch

### Phase 1: Core Component (~60 min)
- Create `EmptyState.svelte` with basic structure
- Implement props interface
- Add base styling matching app design
- Create sketch-style container

### Phase 2: Utilities (~30 min)
- Create `empty-state-utils.ts`
- Define variant configurations
- Implement `detectEmptyStateVariant()` function
- Export constants and types

### Phase 3: Illustrations (~45 min)
- Create 4 SVG illustrations:
  - `InitialIllustration.svelte` (magnifying glass + code)
  - `NoResultsIllustration.svelte` (empty folder)
  - `ErrorIllustration.svelte` (warning triangle)
  - `RateLimitIllustration.svelte` (clock)
- Apply sketch filter styling

### Phase 4: Integration (~30 min)
- Modify `ResultsList.svelte` to use EmptyState
- Wire up state detection logic
- Connect CTA actions (retry, clear filters, etc.)
- Test all integration points

### Phase 5: Animations (~20 min)
- Add floating animation to illustrations
- Add fade-in transition on mount
- Implement `prefers-reduced-motion` support
- Test animation performance

### Phase 6: Unit Tests (~45 min)
- Test `getEmptyStateConfig()` for all variants
- Test `detectEmptyStateVariant()` logic
- Test edge cases (null, undefined inputs)
- Aim for 90%+ coverage

### Phase 7: E2E Tests (~60 min)
- Test initial state on page load
- Test no-results after valid search
- Test error state with invalid repo
- Test accessibility (ARIA, keyboard)
- Test responsive layout
- Test reduced motion

### Phase 8: PR & Review (~30 min)
- Create PR with detailed description
- Address CodeRabbit feedback
- Final testing and merge

---

## Testing Strategy

### Unit Tests (Vitest)
```typescript
describe('Empty State Utils', () => {
  describe('getEmptyStateConfig', () => {
    it('returns correct config for initial variant');
    it('returns correct config for no-results variant');
    it('returns correct config for error variant');
    it('returns correct config for rate-limited variant');
    it('returns correct config for success variant');
  });

  describe('detectEmptyStateVariant', () => {
    it('returns null when loading');
    it('returns initial when not searched');
    it('returns no-results when searched with 0 results');
    it('returns error on API error');
    it('returns rate-limited on rate limit error');
  });
});
```

### E2E Tests (Playwright)
```typescript
describe('Empty State E2E', () => {
  test('displays initial state on page load');
  test('displays no-results after empty search');
  test('displays error state on invalid repo');
  test('has correct ARIA attributes');
  test('primary CTA is clickable');
  test('secondary CTA opens correct link');
  test('respects reduced motion preference');
  test('is responsive on mobile');
});
```

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| SVG illustrations don't match design | Use existing SVGFilters, review with screenshots |
| Animation performance issues | Use CSS transforms only, test on low-end devices |
| State detection edge cases | Comprehensive unit tests for all scenarios |
| Accessibility issues | Test with screen reader, use ARIA live regions |

---

## Success Metrics

1. All 8 acceptance criteria met
2. Unit test coverage > 90%
3. E2E tests passing for all variants
4. No accessibility violations (axe-core)
5. CodeRabbit review approved
6. Matches existing app design aesthetic

---

## References

- [GitHub Primer Empty States](https://primer.style/ui-patterns/empty-states/)
- [PatternFly Empty State Guidelines](https://www.patternfly.org/components/empty-state/design-guidelines/)
- [Carbon Design System Empty States](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- [unDraw Illustrations](https://undraw.co/)
- [LottieFiles Empty State Animations](https://lottiefiles.com/search?q=empty+state)
- [WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)

---

## Timeline

| Phase | Estimated Time | Cumulative |
|-------|---------------|------------|
| Phase 0 | 30 min | 30 min |
| Phase 1 | 60 min | 90 min |
| Phase 2 | 30 min | 120 min |
| Phase 3 | 45 min | 165 min |
| Phase 4 | 30 min | 195 min |
| Phase 5 | 20 min | 215 min |
| Phase 6 | 45 min | 260 min |
| Phase 7 | 60 min | 320 min |
| Phase 8 | 30 min | 350 min |
| **Total** | **~350 min** | (~5.8 hours) |

---

*Plan created: 2025-11-30*
*Issue #30 - IssueFlow*

---

# Phase 1: Detailed Implementation Plan

## Research Summary (Web Search Findings)

### Svelte 5 Best Practices Applied

#### 1. Props with $props() Rune
Source: [Svelte Docs - $props](https://svelte.dev/docs/svelte/$props)

```typescript
interface Props {
  variant: EmptyStateVariant;
  customTitle?: string;
  customDescription?: string;
  onPrimaryAction?: () => void;
  // ... more props
}

let {
  variant,
  customTitle,
  onPrimaryAction,
  ...rest
}: Props = $props();
```

#### 2. Scoped CSS Styling
Source: [Svelte Docs - Scoped Styles](https://svelte.dev/docs/svelte/scoped-styles)

- CSS is automatically scoped to component
- Svelte adds unique class hash (e.g., `svelte-abc123`)
- Use `:global()` only as escape hatch
- CSS variables for dynamic theming

#### 3. Component Composition Pattern
Source: [Render Blog - Svelte Design Patterns](https://render.com/blog/svelte-design-patterns)

- Break into smaller pieces for flexibility
- Use children snippet for content projection
- Context API for state sharing (if needed)

### Accessibility Implementation

#### ARIA Live Regions
Sources:
- [MDN - ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- [Sara Soueidan - Accessible Notifications](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/)
- [A11Y Collective - ARIA Live Guide](https://www.a11y-collective.com/blog/aria-live/)

**Key Requirements:**
1. Live region must be empty on page load
2. Content is injected after region exists in DOM
3. Wait ~2 seconds before injecting if dynamically added
4. Use `aria-atomic="true"` for iOS VoiceOver compatibility

```html
<!-- Must exist in DOM before content change -->
<div role="status" aria-live="polite" aria-atomic="true">
  <!-- Content injected here -->
</div>
```

### Hand-Drawn Border Styling

Sources:
- [Stack Overflow - Sketched Borders](https://stackoverflow.com/questions/43694588/can-i-use-css-to-distort-borders-so-they-look-like-sketched)
- [CodePen - Hand Drawn Border Effects](https://codepen.io/tmrDevelops/pen/NPXodB)
- [GitHub - DoodleCSS](https://github.com/chr15m/DoodleCSS)
- [CodeMyUI - Hand-Drawn Buttons](https://codemyui.com/hand-drawn-border-buttons-css/)

**IssueFlow Existing Pattern (from Footer.svelte):**
```css
.element::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: inherit;
  filter: url(#sketch-light);  /* SVGFilters */
  pointer-events: none;
}
```

---

## Component Structure

### File: `src/components/shared/EmptyState.svelte`

```
EmptyState.svelte
├── Script (TypeScript)
│   ├── Props Interface
│   │   ├── variant: EmptyStateVariant (required)
│   │   ├── customTitle?: string
│   │   ├── customDescription?: string
│   │   ├── onPrimaryAction?: () => void
│   │   ├── onSecondaryAction?: () => void
│   │   ├── primaryActionLabel?: string
│   │   ├── secondaryActionLabel?: string
│   │   ├── secondaryActionHref?: string
│   │   └── showIllustration?: boolean (default: true)
│   ├── Imports
│   │   └── getEmptyStateConfig from empty-state-utils
│   └── Derived State
│       ├── config = getEmptyStateConfig(variant)
│       ├── title = customTitle || config.title
│       └── description = customDescription || config.description
│
├── HTML Template
│   ├── Container (role="status", aria-live="polite")
│   │   ├── Illustration Slot (aria-hidden="true")
│   │   │   └── {#if showIllustration} SVG based on variant
│   │   ├── Title (h2)
│   │   ├── Description (p)
│   │   └── Actions
│   │       ├── Primary Button (if onPrimaryAction or config.primaryAction)
│   │       └── Secondary Link (if secondaryActionHref)
│
└── Styles (Scoped CSS)
    ├── Container styles (sketch card design)
    ├── Illustration styles (centered, sized)
    ├── Typography (title, description)
    ├── Button styles (matches footer-link pattern)
    ├── Responsive breakpoints
    └── Reduced motion support
```

---

## Props Interface Definition

```typescript
// Types
export type EmptyStateVariant =
  | 'initial'
  | 'no-results'
  | 'error'
  | 'rate-limited'
  | 'success';

// Props Interface
interface Props {
  /** The type of empty state to display */
  variant: EmptyStateVariant;

  /** Override the default title */
  customTitle?: string;

  /** Override the default description */
  customDescription?: string;

  /** Handler for primary action button click */
  onPrimaryAction?: () => void;

  /** Handler for secondary action (if not using href) */
  onSecondaryAction?: () => void;

  /** Override primary button label */
  primaryActionLabel?: string;

  /** Override secondary action label */
  secondaryActionLabel?: string;

  /** URL for secondary action (opens in new tab) */
  secondaryActionHref?: string;

  /** Whether to show the illustration (default: true) */
  showIllustration?: boolean;
}
```

---

## CSS Design Tokens

Based on existing IssueFlow patterns (Footer.svelte):

```css
/* Color Palette (Slate) */
--color-text-primary: #e2e8f0;     /* slate-200 */
--color-text-secondary: #94a3b8;   /* slate-400 */
--color-bg-gradient-from: #475569; /* slate-600 */
--color-bg-gradient-to: #334155;   /* slate-700 */
--color-border: rgba(148, 163, 184, 0.25);
--color-focus: #4ade80;            /* green-400 */

/* Spacing */
--spacing-container: 3rem 1.5rem;  /* py-12 px-6 */
--spacing-illustration: 1.5rem;    /* mb-6 */
--spacing-title: 0.5rem;           /* mb-2 */
--spacing-actions: 1.5rem;         /* mt-6 */

/* Typography */
--font-size-title: 1.25rem;        /* text-xl */
--font-size-description: 0.875rem; /* text-sm */
--font-weight-title: 600;
--font-weight-description: 400;

/* Illustration */
--illustration-size: 120px;

/* Transitions */
--transition-default: all 0.2s ease;
```

---

## Responsive Breakpoints

```css
/* Mobile First */
.empty-state-container {
  padding: 2rem 1rem;
  max-width: 100%;
}

/* Tablet and up (md: 768px) */
@media (min-width: 768px) {
  .empty-state-container {
    padding: 3rem 2rem;
    max-width: 480px;
  }
}

/* Desktop (lg: 1024px) */
@media (min-width: 1024px) {
  .empty-state-container {
    max-width: 520px;
  }
}
```

---

## Animation Specifications

### Illustration Float Animation
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.illustration {
  animation: float 3s ease-in-out infinite;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .illustration {
    animation: none;
  }
}
```

### Fade-In on Mount
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state-container {
  animation: fadeIn 0.3s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .empty-state-container {
    animation: none;
  }
}
```

---

## Accessibility Checklist for Phase 1

| Requirement | Implementation |
|-------------|----------------|
| WCAG 4.1.3 Status Messages | `role="status"` + `aria-live="polite"` |
| WCAG 1.1.1 Non-text Content | `aria-hidden="true"` on illustrations |
| WCAG 2.1.1 Keyboard | Focus management on buttons/links |
| WCAG 2.4.6 Headings | Use `<h2>` for title |
| WCAG 2.4.7 Focus Visible | `:focus-visible` outline styles |
| Screen Reader | `aria-atomic="true"` for full announcement |
| Reduced Motion | `prefers-reduced-motion` media query |

---

## File Dependencies

```
Phase 1 Creates:
└── src/components/shared/EmptyState.svelte

Phase 1 Depends On:
├── src/components/shared/SVGFilters.svelte (existing - for sketch filter)
└── src/lib/empty-state-utils.ts (Phase 2 - but can use inline config initially)

Phase 1 Updates:
└── src/components/shared/index.ts (add export)
```

---

## Implementation Checklist for Phase 1

- [ ] Create `EmptyState.svelte` file
- [ ] Define TypeScript Props interface
- [ ] Implement $props() destructuring
- [ ] Create HTML template structure
- [ ] Add ARIA accessibility attributes
- [ ] Implement scoped CSS styles
- [ ] Add sketch-style border (::before pseudo-element)
- [ ] Add responsive breakpoints
- [ ] Add float animation with reduced motion support
- [ ] Add fade-in animation with reduced motion support
- [ ] Export from `shared/index.ts`
- [ ] Basic smoke test (render without errors)

---

## Estimated Time: 60 minutes

| Task | Time |
|------|------|
| File setup + Props interface | 10 min |
| HTML template structure | 10 min |
| ARIA accessibility | 5 min |
| CSS styling (matching Footer) | 20 min |
| Animations + reduced motion | 10 min |
| Export + smoke test | 5 min |

---

# Phase 2: Detailed Implementation Plan

## Research Summary (Web Search Findings)

### TypeScript Utility Module Best Practices

Sources:
- [Bacancy - TypeScript Best Practices 2025](https://www.bacancytechnology.com/blog/typescript-best-practices)
- [DEV.to - TypeScript Best Practices 2025](https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3)
- [Medium - ES Modules Best Practices](https://medium.com/@robinviktorsson/typescript-and-es-modules-best-practices-for-imports-and-exports-9ce200e75a88)

**Key Principles:**
1. **Named exports** for utilities (better tree-shaking)
2. **Pure functions** for testability (no side effects)
3. **Single responsibility** per function
4. **Consistent documentation** with JSDoc

### Configuration Object Pattern: `as const` vs Enum

Sources:
- [DEV.to - TypeScript Enums Showdown](https://dev.to/maximlogunov/typescript-enums-showdown-const-enum-vs-enum-vs-object-as-const-4dg8)
- [Medium - Objects + const assertion](https://medium.com/@taitasciore/typescript-better-enums-may-very-well-mean-no-enums-use-objects-const-assertion-7c5624fb2f0d)
- [LogRocket - Record Types](https://blog.logrocket.com/typescript-record-types/)

**Decision:** Use `Record<EmptyStateVariant, Config>` pattern
- Type-safe configuration lookup
- Runtime access to values
- Zero extra generated code
- Matches existing `footer-utils.ts` pattern

### Pure Functions for Testability

Sources:
- [Mark Heath - Testable Code with Pure Functions](https://markheath.net/post/testable-code-with-pure-functions)
- [CloudDevs - Unit Testing in TypeScript](https://clouddevs.com/typescript/unit-testing/)
- [Medium - Functional Programming Pure Functions](https://medium.com/ableneo/testable-javascript-functional-programming-pure-functions-756e049bfd4a)

**Key Insight:** "Pure functions have no side effects - output depends only on input. This makes testing trivial: same input = same output, always."

### Discriminated Union Pattern for State Detection

Sources:
- [TypeScript Deep Dive - Discriminated Unions](https://basarat.gitbook.io/typescript/type-system/discriminated-unions)
- [DEV.to - Understanding Discriminated Unions](https://dev.to/tigawanna/understanding-discriminated-unions-in-typescript-1n0h)
- [Medium - Pattern Matching with Discriminated Unions](https://angelogentileiii.medium.com/pattern-matching-how-discriminated-unions-enhance-your-typescript-development-cef417ef8b01)

**Use Case:** The `detectEmptyStateVariant()` function uses discriminated logic to determine which empty state to show based on multiple inputs.

---

## Purpose of Phase 2

Although the EmptyState component (Phase 1) includes inline configurations, extracting utilities provides:

1. **Testability** - Pure functions can be unit tested independently
2. **Reusability** - Configs can be used elsewhere (analytics, logging)
3. **Maintainability** - Single source of truth for empty state text
4. **Consistency** - Matches existing `footer-utils.ts` and `issue-utils.ts` patterns

---

## File Structure

### File: `src/lib/empty-state-utils.ts`

```
empty-state-utils.ts
├── Type Exports
│   ├── EmptyStateVariant (union type)
│   └── EmptyStateConfig (interface)
├── Constants
│   ├── EMPTY_STATE_CONFIGS (Record<Variant, Config>)
│   └── URL constants (README, issues, rate limit docs)
├── Pure Functions
│   ├── getEmptyStateConfig(variant) → Config
│   ├── detectEmptyStateVariant(state) → Variant | null
│   ├── isErrorState(error) → boolean
│   ├── isRateLimitError(error) → boolean
│   └── getEmptyStateAnnouncement(variant) → string (for screen readers)
└── Exports (named)
```

---

## Type Definitions

```typescript
/**
 * Empty state variant types
 * Matches the visual/UX states in EmptyState.svelte
 */
export type EmptyStateVariant =
  | 'initial'      // First visit, no search yet
  | 'no-results'   // Search completed, zero issues found
  | 'error'        // API error, invalid repo, network failure
  | 'rate-limited' // GitHub API rate limit exceeded
  | 'success';     // All issues reviewed (future use)

/**
 * Configuration for each empty state variant
 */
export interface EmptyStateConfig {
  /** Primary heading text */
  title: string;
  /** Descriptive secondary text */
  description: string;
  /** Label for primary action button */
  primaryActionLabel?: string;
  /** Label for secondary action link */
  secondaryActionLabel?: string;
  /** URL for secondary action (external link) */
  secondaryActionHref?: string;
  /** Screen reader announcement for state change */
  announcement: string;
}

/**
 * Input state for variant detection
 */
export interface EmptyStateDetectionInput {
  /** Whether a search has been performed */
  hasSearched: boolean;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Current error (if any) */
  error: Error | string | null;
  /** Number of results returned */
  resultsCount: number;
}
```

---

## Configuration Object

Using `Record<EmptyStateVariant, EmptyStateConfig>` pattern:

```typescript
export const EMPTY_STATE_CONFIGS: Record<EmptyStateVariant, EmptyStateConfig> = {
  initial: {
    title: 'Ready to find issues?',
    description: 'Enter a GitHub repository URL above to discover unassigned issues waiting for contributors',
    primaryActionLabel: 'Try Popular Repos',
    secondaryActionLabel: 'How it works',
    secondaryActionHref: 'https://github.com/VibeTensor/IssueFlow#readme',
    announcement: 'Ready to search. Enter a GitHub repository URL to find issues.'
  },
  'no-results': {
    title: 'No issues found',
    description: 'This repository has no unassigned issues without pull requests. Try another repository or adjust filters',
    primaryActionLabel: 'Clear Filters',
    secondaryActionLabel: 'Try another repo',
    announcement: 'No issues found for this repository.'
  },
  error: {
    title: 'Something went wrong',
    description: "We couldn't fetch issues from this repository. Please check the URL and try again",
    primaryActionLabel: 'Retry',
    secondaryActionLabel: 'Report Issue',
    secondaryActionHref: 'https://github.com/VibeTensor/IssueFlow/issues',
    announcement: 'Error loading issues. Please try again.'
  },
  'rate-limited': {
    title: 'API limit reached',
    description: "GitHub's rate limit was exceeded. Please wait a moment and try again",
    primaryActionLabel: 'Retry',
    secondaryActionLabel: 'Learn about rate limits',
    secondaryActionHref: 'https://docs.github.com/en/rest/rate-limit',
    announcement: 'GitHub API rate limit exceeded. Please wait before retrying.'
  },
  success: {
    title: 'All caught up!',
    description: "You've reviewed all the issues. Time for a well-deserved break!",
    primaryActionLabel: 'Search Another Repo',
    announcement: 'All issues reviewed. Great job!'
  }
} as const;
```

---

## Pure Functions

### 1. getEmptyStateConfig

```typescript
/**
 * Get configuration for a specific empty state variant
 * Pure function - same input always returns same output
 *
 * @param variant - The empty state variant type
 * @returns Configuration object for the variant
 */
export function getEmptyStateConfig(variant: EmptyStateVariant): EmptyStateConfig {
  return EMPTY_STATE_CONFIGS[variant];
}
```

### 2. detectEmptyStateVariant

```typescript
/**
 * Detect which empty state variant to display based on current state
 * Pure function implementing state detection logic
 *
 * @param input - Current application state
 * @returns Variant to display, or null if content should be shown
 */
export function detectEmptyStateVariant(
  input: EmptyStateDetectionInput
): EmptyStateVariant | null {
  const { hasSearched, isLoading, error, resultsCount } = input;

  // Don't show empty state while loading
  if (isLoading) {
    return null;
  }

  // Check for rate limit error first (specific error type)
  if (error && isRateLimitError(error)) {
    return 'rate-limited';
  }

  // Check for general error
  if (error) {
    return 'error';
  }

  // Initial state - no search performed yet
  if (!hasSearched) {
    return 'initial';
  }

  // Search completed but no results
  if (resultsCount === 0) {
    return 'no-results';
  }

  // Has results - don't show empty state
  return null;
}
```

### 3. Error Detection Helpers

```typescript
/**
 * Check if an error indicates GitHub API rate limiting
 *
 * @param error - Error to check
 * @returns true if error is rate limit related
 */
export function isRateLimitError(error: Error | string | null): boolean {
  if (!error) return false;

  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  return (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('rate_limit') ||
    lowerMessage.includes('403') ||
    lowerMessage.includes('api limit')
  );
}

/**
 * Check if value represents an error state
 *
 * @param error - Value to check
 * @returns true if error exists
 */
export function isErrorState(error: unknown): boolean {
  return error !== null && error !== undefined && error !== '';
}
```

### 4. Accessibility Helper

```typescript
/**
 * Get screen reader announcement for an empty state variant
 * Used for ARIA live region updates
 *
 * @param variant - Empty state variant
 * @returns Announcement text for screen readers
 */
export function getEmptyStateAnnouncement(variant: EmptyStateVariant): string {
  return EMPTY_STATE_CONFIGS[variant].announcement;
}
```

---

## Comparison with Existing Patterns

| Pattern | footer-utils.ts | issue-utils.ts | empty-state-utils.ts |
|---------|-----------------|----------------|----------------------|
| Constants | `REPO_URL`, `SITE_URL` | `LOW_COMMENT_THRESHOLD` | `EMPTY_STATE_CONFIGS` |
| Types | (none) | `CommentLevel`, `CommentSortOrder` | `EmptyStateVariant`, `EmptyStateConfig` |
| Pure Functions | `getTwitterShareUrl()`, `isValidUrl()` | `isZeroComment()`, `getCommentLevel()` | `detectEmptyStateVariant()`, `isRateLimitError()` |
| JSDoc | ✅ | ✅ | ✅ |
| Named Exports | ✅ | ✅ | ✅ |

---

## Testing Strategy Preview

Each function will have dedicated unit tests:

```typescript
describe('empty-state-utils', () => {
  describe('getEmptyStateConfig', () => {
    it('returns correct config for each variant');
    it('config has all required properties');
  });

  describe('detectEmptyStateVariant', () => {
    it('returns null when loading');
    it('returns "initial" when not searched');
    it('returns "no-results" when searched with 0 results');
    it('returns "error" on generic error');
    it('returns "rate-limited" on rate limit error');
    it('returns null when results exist');
  });

  describe('isRateLimitError', () => {
    it('returns true for "rate limit" message');
    it('returns true for 403 status');
    it('returns false for null');
    it('returns false for unrelated errors');
  });
});
```

---

## Implementation Checklist for Phase 2

- [ ] Create `src/lib/empty-state-utils.ts` file
- [ ] Define `EmptyStateVariant` union type
- [ ] Define `EmptyStateConfig` interface
- [ ] Define `EmptyStateDetectionInput` interface
- [ ] Create `EMPTY_STATE_CONFIGS` constant
- [ ] Implement `getEmptyStateConfig()` function
- [ ] Implement `detectEmptyStateVariant()` function
- [ ] Implement `isRateLimitError()` helper
- [ ] Implement `isErrorState()` helper
- [ ] Implement `getEmptyStateAnnouncement()` helper
- [ ] Add JSDoc documentation to all exports
- [ ] Verify build passes

---

## Estimated Time: 30 minutes

| Task | Time |
|------|------|
| File setup + type definitions | 8 min |
| Configuration object | 7 min |
| Pure functions implementation | 10 min |
| JSDoc documentation | 3 min |
| Build verification | 2 min |
