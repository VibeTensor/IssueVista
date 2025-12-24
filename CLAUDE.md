# IssueFlow Project Memory

## Project Overview

IssueFlow is a GitHub issue discovery tool that helps developers find beginner-friendly issues.

- **Repository**: VibeTensor/IssueFlow
- **URL**: https://github.com/VibeTensor/IssueFlow
- **Stack**: Astro 5, Svelte 5, TypeScript, UnoCSS

## Tech Stack

| Component  | Technology          | Version                                |
| ---------- | ------------------- | -------------------------------------- |
| Framework  | Astro               | 5.x                                    |
| UI         | Svelte              | 5.x (runes: $state, $derived, $effect) |
| Language   | TypeScript          | Strict mode                            |
| Styling    | UnoCSS              | Tailwind-compatible                    |
| Linting    | ESLint              | Flat config (eslint.config.js)         |
| Formatting | Prettier            | With Svelte/Astro plugins              |
| Testing    | Vitest + Playwright | Unit + E2E                             |

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint (0 errors required)
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```

## Directory Structure

```
src/
├── components/
│   ├── results/      # Issue display components
│   └── shared/       # Reusable components
├── lib/              # Utilities and API functions
├── layouts/          # Astro layouts
└── pages/            # Astro pages
tests/
├── *.test.ts         # Unit tests (Vitest)
└── e2e/              # E2E tests (Playwright)
.claude/
└── rules/            # Modular Claude rules
```

## Forbidden Directories (Don't Read)

- node_modules/
- dist/
- .astro/
- coverage/
- .git/

## Key Files

- `src/lib/github-graphql.ts` - GitHub API integration
- `src/components/results/ResultsContainer.svelte` - Main results component
- `eslint.config.js` - ESLint flat config
- `.prettierrc` - Prettier configuration

## Modular Rules (v2.6)

See `.claude/rules/` for detailed rules:

- @.claude/rules/sop-workflow.md - Complete 9-phase SOP implementation (16 steps)
- @.claude/rules/coderabbit.md - CodeRabbit review process (issue + PR threads)
- @.claude/rules/merge-policy.md - Git merge requirements (--merge ONLY)
- @.claude/rules/post-merge.md - Post-merge workflow (video, Uplift, earnings)
- @.claude/rules/testing.md - Testing requirements and commands
- @.claude/rules/error-recovery.md - Error handling and recovery procedures
- @.claude/rules/coding-standards.md - Code style guidelines (Svelte 5, TypeScript)

## Quick Reference

- Always use `--merge` for PRs, NEVER `--squash`
- Check CodeRabbit comments on both issue AND PR threads
- Web search 5-10 times per phase (mandatory)
- User confirmation required after each phase
- Research document: `.internal/research/issue_XX_research.txt`
- Earnings tracker: `.internal/trackers/december_2025_earnings_tracker.csv`
- SOP document: `.internal/planning/SOP_ISSUE_IMPLEMENTATION.txt`

## Post-Merge Checklist

1. Sync local: `git checkout master && git pull`
2. Verify git graph shows branch/merge pattern
3. Confirm video recording is off
4. Provide Uplift Tracker data (issue, PR, commits, video)
5. Update Uplift Tracker (6/6 fields)
6. Update earnings tracker CSV
