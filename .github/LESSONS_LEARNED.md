# Lessons Learned Register

## ISO 21502:2020 Knowledge Management

### Purpose

This document captures lessons learned throughout the IssueFlow project lifecycle, enabling continuous improvement and knowledge transfer.

---

## Template for New Entries

```markdown
### LL-[NUMBER]: [Title]

**Date:** YYYY-MM-DD
**Sprint:** Sprint X
**Category:** Technical / Process / Communication / Resource
**Impact:** High / Medium / Low

#### Context

[What was the situation?]

#### What Happened

[Describe the event or outcome]

#### Root Cause

[Why did this happen?]

#### Lesson Learned

[What should be done differently?]

#### Action Items

- [ ] Action 1
- [ ] Action 2

#### Applicable To

[Future situations where this applies]
```

---

## Lessons Learned Log

### LL-001: GraphQL API Field Mapping

**Date:** December 26, 2025
**Sprint:** Sprint 1
**Category:** Technical
**Impact:** Medium

#### Context

Setting up automated project board field updates via GitHub CLI.

#### What Happened

Initial attempts to update project fields failed due to incorrect field option IDs.

#### Root Cause

GitHub Projects V2 uses unique option IDs for single-select fields, not display values.

#### Lesson Learned

Always retrieve field option IDs via `gh project field-list` before attempting updates.

#### Action Items

- [x] Document field ID retrieval process
- [x] Create reusable scripts for field updates

#### Applicable To

Any future project board automation tasks.

---

### LL-002: View and Chart API Limitations

**Date:** December 26, 2025
**Sprint:** Sprint 1
**Category:** Technical
**Impact:** Low

#### Context

Attempting to create project views and insight charts via CLI.

#### What Happened

GitHub Projects V2 API does not support creating views or charts programmatically.

#### Root Cause

API limitation - these features are UI-only.

#### Lesson Learned

Research API capabilities before planning automation. Some features require manual UI configuration.

#### Action Items

- [x] Document manual setup instructions
- [x] Create PROJECT_MANAGEMENT_SETUP.md guide

#### Applicable To

Future GitHub Projects automation planning.

---

### LL-003: PowerShell vs Bash on Windows

**Date:** December 26, 2025
**Sprint:** Sprint 1
**Category:** Technical
**Impact:** Low

#### Context

Running batch operations on Windows development environment.

#### What Happened

`jq` command not available on Windows, causing script failures.

#### Root Cause

Platform-specific tooling differences.

#### Lesson Learned

Use PowerShell native JSON parsing (`ConvertFrom-Json`) on Windows instead of jq.

#### Action Items

- [x] Create PowerShell-compatible scripts
- [x] Document platform considerations

#### Applicable To

Cross-platform script development.

---

### LL-004: CSS Custom Properties Architecture for Theme Systems

**Date:** December 30, 2025
**Sprint:** Sprint 2
**Category:** Technical
**Impact:** High
**Related Issue:** #180 (Light/Dark Theme Toggle)

#### Context

Implementing a comprehensive light/dark theme system with custom theme presets required careful CSS architecture decisions.

#### What Happened

Initial approach using Tailwind dark mode classes became unwieldy with multiple theme variants. Switching to CSS custom properties (CSS variables) enabled:
- Runtime theme switching without page reload
- Support for multiple theme presets beyond light/dark
- Reduced bundle size by avoiding duplicate utility classes
- Better maintainability with centralized color definitions

#### Root Cause

Tailwind's utility-first approach works well for binary dark mode but doesn't scale to multiple theme presets without excessive class generation.

#### Lesson Learned

For theme systems with more than 2 variants, use CSS custom properties as the foundation:
1. Define semantic color tokens (--color-bg-primary, --color-text-primary)
2. Map tokens to theme-specific values in :root and [data-theme="dark"]
3. Use UnoCSS/Tailwind for layout, spacing, and responsive design
4. Keep color values in CSS variables for runtime flexibility

#### Action Items

- [x] Document CSS custom properties pattern in codebase
- [x] Create theme presets system architecture
- [ ] Consider adding theme builder for user customization

#### Applicable To

Any feature requiring runtime style changes, user preference systems, or multi-variant design systems.

---

### LL-005: Svelte 5 Runes for Complex State Management

**Date:** December 25, 2025
**Sprint:** Sprint 1
**Category:** Technical
**Impact:** High
**Related Issue:** #62 (Search History with localStorage)

#### Context

Implementing search history required complex state management with localStorage persistence, array manipulation, and reactive updates.

#### What Happened

Svelte 5 runes ($state, $derived, $effect) provided cleaner patterns than Svelte 4 stores:
- `$state()` for reactive arrays with automatic tracking
- `$effect()` for localStorage sync without explicit subscriptions
- `$derived()` for computed values like filtered/sorted history
- No need for .set() or .update() methods

#### Root Cause

Svelte 4 stores required verbose boilerplate for complex state. Runes provide more intuitive, JavaScript-native reactivity.

#### Lesson Learned

Svelte 5 runes best practices:
1. Use `$state()` for any mutable data, including arrays and objects
2. Use `$effect()` for side effects (localStorage, API calls, DOM manipulation)
3. Use `$derived()` for any computed values to avoid recalculation
4. Avoid mixing old store syntax with runes in same component

#### Action Items

- [x] Migrate all components to runes syntax
- [x] Document runes patterns in coding standards
- [ ] Create reusable composable patterns library

#### Applicable To

All new Svelte 5 component development, especially features with complex state.

---

### LL-006: Accessibility-First Badge and Label Design

**Date:** December 29, 2025
**Sprint:** Sprint 2
**Category:** Technical
**Impact:** Medium
**Related Issue:** #181 (Good First Issue Badge)

#### Context

Adding visual badges for "Good First Issue" required careful accessibility consideration to ensure screen reader compatibility and color contrast compliance.

#### What Happened

Initial badge design relied solely on color, which failed:
- Color contrast requirements (WCAG 2.1 AA: 4.5:1 ratio)
- Color blindness accessibility (8% of males affected)
- Screen reader announcement of badge meaning

Solution implemented:
- Added aria-label describing badge purpose
- Used icon + text combination, not color alone
- Ensured 4.5:1 contrast ratio in both themes
- Added focus indicators for keyboard navigation

#### Root Cause

Visual design often prioritizes aesthetics over accessibility. Badges are particularly prone to contrast issues.

#### Lesson Learned

Badge/label accessibility checklist:
1. Never rely on color alone to convey meaning
2. Include text or aria-label describing the badge
3. Test contrast ratios in all theme variants
4. Verify screen reader announcements
5. Add visible focus indicators if interactive

#### Action Items

- [x] Audit all existing badges for accessibility
- [x] Add accessibility checklist to Definition of Done
- [ ] Implement automated contrast ratio checking in CI

#### Applicable To

Any visual indicator, status badge, or label component.

---

### LL-007: Keyboard Shortcut UX Patterns

**Date:** December 28, 2025
**Sprint:** Sprint 2
**Category:** Technical
**Impact:** Medium
**Related Issue:** #166 (Keyboard Shortcut Hint)

#### Context

Adding keyboard shortcut hints (like "Press Enter to search") required balancing discoverability with visual clutter.

#### What Happened

First implementation showed shortcuts always, leading to:
- Visual noise for experienced users
- Accessibility concerns with too much on-screen text
- Inconsistent placement across components

Improved approach:
- Show hints only when input is focused
- Use subtle, dismissible hint styling
- Consistent positioning (inside input, right-aligned)
- Respect prefers-reduced-motion for animations

#### Root Cause

No established pattern for keyboard hint UX in the codebase. Each implementation was ad-hoc.

#### Lesson Learned

Keyboard shortcut hint best practices:
1. Context-sensitive visibility (show on focus/hover)
2. Consistent visual language across all shortcuts
3. Use `<kbd>` element for semantic meaning
4. Provide escape hatch to dismiss hints
5. Document all shortcuts in help modal

#### Action Items

- [x] Create reusable KeyboardHint component
- [x] Add keyboard shortcuts to help popup
- [ ] Implement global keyboard shortcut handler

#### Applicable To

Any feature adding keyboard shortcuts or accelerators.

---

### LL-008: Virtual List Performance for Large Datasets

**Date:** December 31, 2025
**Sprint:** Sprint 2
**Category:** Technical
**Impact:** High
**Related Issue:** #131 (Infinite Scroll with Virtual List)

#### Context

Implementing infinite scroll for potentially thousands of GitHub issues required virtual list rendering to maintain performance.

#### What Happened

Initial infinite scroll loaded all items into DOM, causing:
- Memory issues with 500+ items
- Scroll jank and dropped frames
- Mobile browser crashes

Virtual list solution:
- Only render visible items + buffer
- Recycle DOM nodes during scroll
- Maintain scroll position accuracy
- Handle variable height items

#### Root Cause

Naive infinite scroll implementations don't account for DOM node limits. Each issue card with badges, tags, and actions is DOM-heavy.

#### Lesson Learned

Virtual list implementation requirements:
1. Calculate visible viewport and buffer zones
2. Use CSS transforms for scroll position (not margin/padding)
3. Handle resize and orientation changes
4. Provide loading skeletons for buffer items
5. Test with 1000+ items on low-end devices

#### Action Items

- [x] Implement virtual scrolling for issue list
- [x] Add performance monitoring for scroll events
- [ ] Consider using dedicated virtual list library for complex cases

#### Applicable To

Any list or grid with potentially unbounded items (search results, feeds, logs).

---

### LL-009: Sustainable Development Velocity

**Date:** January 1, 2026
**Sprint:** Sprint 2
**Category:** Process
**Impact:** Critical
**Related Issue:** N/A (Sprint-wide observation)

#### Context

Sprint 2 achieved 89 story points in 6 days, requiring 19+ hour workdays with minimal sleep.

#### What Happened

While the sprint was technically successful:
- 38 issues completed in December
- All CI checks passing
- High code quality maintained

The cost was unsustainable:
- 4-5 hours sleep per night for 12 days
- Physical and mental exhaustion
- Reduced code review thoroughness toward sprint end
- Recovery time needed post-sprint

#### Root Cause

Aggressive target (INR 10.5 Lakh in 12 days) required unsustainable pace. No velocity cap or sustainability check in planning.

#### Lesson Learned

Sustainable velocity guidelines:
1. Maximum 50 SP/week for solo developer
2. Cap at 10 hours/day (50 hours/week)
3. Include buffer for CodeRabbit review cycles
4. Plan recovery sprints after intensive periods
5. Velocity != productivity; quality and health matter

#### Action Items

- [x] Document sustainable velocity in sprint planning guide
- [ ] Set velocity cap in project board
- [ ] Schedule recovery sprint after intensive period
- [ ] Add burnout risk to risk register

#### Applicable To

All sprint planning, especially solo development or small teams.

---

### LL-010: Autocomplete Search UX Complexity

**Date:** December 31, 2025
**Sprint:** Sprint 2
**Category:** Technical
**Impact:** Medium
**Related Issue:** #129 (Intelligent Search Autocomplete)

#### Context

Implementing intelligent autocomplete for repository search combined multiple data sources: search history, popular repositories, and GitHub API suggestions.

#### What Happened

Challenges encountered:
- Race conditions between local and API suggestions
- Keyboard navigation conflicts with input behavior
- Mobile virtual keyboard interactions
- Debouncing without perceived latency

Solutions applied:
- Priority-based suggestion merging (local first, then API)
- Aria-activedescendant for accessible keyboard navigation
- Touch-friendly hit targets for mobile
- Optimistic UI with background API enrichment

#### Root Cause

Autocomplete is deceptively complex, combining async data fetching, keyboard handling, accessibility, and performance concerns.

#### Lesson Learned

Autocomplete implementation checklist:
1. Define clear priority order for suggestion sources
2. Implement proper debouncing (150-300ms typical)
3. Use aria-activedescendant, not focus, for option highlighting
4. Handle both mouse and keyboard selection
5. Support mobile tap-to-select without keyboard
6. Show loading state for async suggestions
7. Cache recent API responses

#### Action Items

- [x] Document autocomplete pattern
- [x] Ensure WCAG compliance for combobox pattern
- [ ] Extract reusable Autocomplete component

#### Applicable To

Any search, filter, or selection component with suggestions.

---

## Categories Summary

| Category      | Count | Trend |
| ------------- | ----- | ----- |
| Technical     | 9     | +6    |
| Process       | 1     | +1    |
| Communication | 0     | -     |
| Resource      | 0     | -     |

---

## Review Schedule

| Review Type          | Frequency | Participants               |
| -------------------- | --------- | -------------------------- |
| Sprint Retrospective | Bi-weekly | All contributors           |
| Quarterly Review     | Quarterly | Project owner, maintainers |
| Annual Assessment    | Yearly    | All stakeholders           |

---

## Knowledge Transfer

Lessons are shared through:

1. This document (primary source)
2. Sprint retrospective meetings
3. Onboarding documentation
4. Code comments where applicable

---

_Document Version: 2.0_
_Last Updated: January 9, 2026_
_Compliant with: ISO 21502:2020 Section 6.9_
