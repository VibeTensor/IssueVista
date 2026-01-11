# IssueFlow Project Memory

## Project Overview

IssueFlow is a GitHub issue discovery tool that helps developers find beginner-friendly issues.

- **Repository**: VibeTensor/IssueFlow
- **URL**: [https://github.com/VibeTensor/IssueFlow](https://github.com/VibeTensor/IssueFlow)
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

```text
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
- `src/lib/search-history.ts` - localStorage-based search history utility
- `src/components/results/ResultsContainer.svelte` - Main results component
- `src/components/shared/SearchHistory.svelte` - Search history dropdown component
- `eslint.config.js` - ESLint flat config
- `.prettierrc` - Prettier configuration

## Modular Rules (v3.0)

See `.claude/rules/` for detailed rules:

- @.claude/rules/sop-workflow.md - Complete 9-phase SOP implementation (20 steps)
- @.claude/rules/project-management.md - ISO 21502/PMI PMBOK integration (NEW)
- @.claude/rules/coderabbit.md - CodeRabbit review process (issue + PR threads)
- @.claude/rules/merge-policy.md - Git merge requirements (--merge ONLY)
- @.claude/rules/post-merge.md - Post-merge workflow (video, Uplift, earnings, PM docs)
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

## Pre-Issue Checklist (Step 0)

1. Verify issue in project board with all fields set
2. Check sprint alignment and milestone
3. Risk assessment (for complex issues SP >= 8)
4. Update status to "In Progress"

## Post-Merge Checklist

**Git & Video:**

1. Sync local: `git checkout master && git pull`
2. Verify git graph shows branch/merge pattern
3. Confirm video recording is off

**Trackers:** 4. Provide Uplift Tracker data (issue, PR, commits, video) 5. Update Uplift Tracker (6/6 fields) 6. Update earnings tracker CSV

**Project Management (ISO 21502/PMI):** 7. Verify project board status = "Done" 8. Add lessons learned (if applicable) 9. Update risk register (if new risks found) 10. Track sprint metrics (at sprint end)

## Project Management Documents

| Document                      | Location                                   | When to Update                 |
| ----------------------------- | ------------------------------------------ | ------------------------------ |
| Lessons Learned               | `.github/LESSONS_LEARNED.md`               | After unexpected challenges    |
| Risk Register                 | `.github/RISK_REGISTER.md`                 | When risks found/mitigated     |
| Sprint Retrospective          | `.github/SPRINT_RETROSPECTIVE.md`          | Template - use for new sprints |
| Sprint Retrospectives Archive | `.github/SPRINT_RETROSPECTIVES_ARCHIVE.md` | After each sprint completion   |

## ISO 21502:2020 Compliance Status

| Requirement                  | Document                              | Status    |
| ---------------------------- | ------------------------------------- | --------- |
| Governance (Section 5)       | `.github/GOVERNANCE.md`               | Compliant |
| Scope Management (6.1)       | `.github/WORK_BREAKDOWN_STRUCTURE.md` | Compliant |
| Stakeholder Management (6.2) | `.github/STAKEHOLDER_REGISTER.md`     | Compliant |
| Resource Management (6.3)    | `.github/RACI_MATRIX.md`              | Compliant |
| Change Management (6.4)      | `.github/CHANGE_MANAGEMENT.md`        | Compliant |
| Communication (6.5)          | `.github/COMMUNICATION_PLAN.md`       | Compliant |
| Risk Management (6.7)        | `.github/RISK_REGISTER.md`            | Compliant |
| Knowledge Management (6.9)   | `.github/LESSONS_LEARNED.md`          | Compliant |

## Sprint Metrics Summary

| Metric              | Sprint 1 | Sprint 2 | Average |
| ------------------- | -------- | -------- | ------- |
| Story Points        | 32 SP    | 89 SP    | 60.5 SP |
| Issues Completed    | 9        | 29       | 19      |
| Commitment Accuracy | 91%      | 105%     | 98%     |
| Team Health         | 4.0/5    | 4.0/5    | 4.0/5   |

See `.github/SPRINT_RETROSPECTIVES_ARCHIVE.md` for detailed velocity trends and retrospective data.
