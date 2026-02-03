# AI-Allowed Issues Workflow

## Document Version: 1.0

This document defines the streamlined workflow for AI-ALLOWED issues in the Uplift tracker.

**Parent Document:** @.claude/rules/sop-workflow.md (Full 9-Phase SOP)

> **Note:** This is a streamlined workflow for AI-allowed issues. For the complete 9-phase SOP with mandatory web searches, cooldowns, and PM integration, see the parent document.

---

## Key Differences from AI-Disallowed

| Aspect        | AI-Allowed                   | AI-Disallowed                |
| ------------- | ---------------------------- | ---------------------------- |
| AI Assistance | Full Claude Code usage       | Manual typing only           |
| Session       | New Claude session per issue | N/A                          |
| Documentation | Implementation Report        | Manual research notes        |
| Transcript    | Auto-saved by Claude         | N/A                          |
| Naming        | `issue_XXX_report.txt`       | `issue_XXX_manual_steps.txt` |

---

## Pre-Issue Setup (MANDATORY)

### Step 1: Start New Claude Code Session

**CRITICAL:** Start a FRESH Claude Code session for each AI-allowed issue.

```bash
# Close current Claude session (Ctrl+C or type /exit)
# Then start new session:
claude
```

**Why?** Clean transcript separation for METR study reporting.

### Step 2: Announce Issue at Session Start

First message in new session MUST be:

```
Working on Issue #XXX - [Issue Title]
Type: AI-ALLOWED
Uplift Tracker URL: https://github.com/VibeTensor/IssueVista/issues/XXX
```

### Step 3: Start Recording

- Start Loom recording
- Start timer/stopwatch

---

## Implementation Workflow

### Phase 1: Issue Analysis

```bash
gh issue view <ISSUE_NUMBER> --repo VibeTensor/IssueVista
```

- Read acceptance criteria
- Identify technical requirements
- Note dependencies

### Phase 2: Create Branch

```bash
git checkout master
git pull origin master
git checkout -b <type>/<issue-number>-<description>
```

### Phase 3: Implementation

- Let Claude Code assist with coding
- Review each change before accepting
- Test as you go

### Phase 4: Testing & Validation

```bash
npm run build
npm run lint
npm run test
```

### Phase 5: Commit & Push

```bash
git add <files>
git commit -m "[TYPE] Description (#ISSUE_NUMBER)"
git push -u origin <branch-name>
```

### Phase 6: Create PR

```bash
gh pr create --title "[TYPE] Title (#ISSUE_NUMBER)" --body "## Summary
- Change 1
- Change 2

Closes #ISSUE_NUMBER"
```

### Phase 7: CI & Review

```bash
gh pr checks <PR_NUMBER> --watch
```

Address CodeRabbit comments if any.

### Phase 8: Merge

```bash
gh pr merge <PR_NUMBER> --merge --delete-branch
```

### Phase 9: Sync & Report

```bash
git checkout master
git pull origin master
```

---

## Post-Implementation Report

### File Location

`.internal/reports/issue_XXX_report.txt`

### Report Template

```
================================================================================
ISSUE #XXX IMPLEMENTATION REPORT
================================================================================
Title: [Issue Title]
Type: AI-ALLOWED
Date: YYYY-MM-DD
Session: [Claude session ID if available]

================================================================================
SUMMARY
================================================================================

Implementation Time: XX minutes
Perceived Effort: X/5
PR Number: #XXX

================================================================================
CHANGES MADE
================================================================================

Files Created:
- path/to/file1.ts
- path/to/file2.svelte

Files Modified:
- path/to/existing.ts (lines XX-YY)

================================================================================
TECHNICAL DETAILS
================================================================================

Approach:
[Brief description of implementation approach]

Key Decisions:
- Decision 1: [rationale]
- Decision 2: [rationale]

Challenges:
- [Any issues encountered and how resolved]

================================================================================
VERIFICATION
================================================================================

- [ ] Build passes
- [ ] Lint passes (0 errors)
- [ ] Tests pass
- [ ] PR merged with --merge

================================================================================
UPLIFT TRACKER DATA
================================================================================

PR/Commit Links:
https://github.com/VibeTensor/IssueVista/pull/XXX
https://github.com/VibeTensor/IssueVista/commit/XXXXXXX

Screen Recording:
https://www.loom.com/share/XXXXX

Initial Time: XX minutes
Post Review Time: X minutes
Est. if AI-Disallowed: XXX minutes
Perceived Effort: X/5

================================================================================
```

---

## Session Naming Convention

### Claude Code Transcripts

Transcripts are auto-saved by Claude Code in:

```
~/.claude/projects/D--Development-opensource-OSS-Collection-IssueVista/
```

### Recommended Session Workflow

1. **One issue = One session** (for clean transcript separation)
2. **Start with issue announcement** (first message identifies the issue)
3. **End with report generation** (create the report file before closing)

---

## Transcript → Report Conversion

After completing an issue, the Claude session transcript automatically becomes the implementation record. The report file (`.internal/reports/issue_XXX_report.txt`) serves as the summary.

### What Goes Where

| Content           | Location                       |
| ----------------- | ------------------------------ |
| Full conversation | Claude transcript (auto-saved) |
| Summary/metadata  | Report file                    |
| Uplift data       | Report file + Uplift Tracker   |
| Earnings          | January tracker CSV            |

---

## Quick Checklist

### Before Starting

- [ ] Close previous Claude session
- [ ] Start NEW Claude session
- [ ] Announce issue number and title
- [ ] Start Loom recording
- [ ] Start timer

### During Implementation

- [ ] Let Claude assist with code
- [ ] Review all changes
- [ ] Test frequently
- [ ] Commit with proper message format

### After Completion

- [ ] PR merged with `--merge`
- [ ] Stop Loom recording
- [ ] Stop timer
- [ ] Create report file
- [ ] Update Uplift Tracker (6/6 fields)
- [ ] Update January earnings tracker
- [ ] Close Claude session

---

## Differences from Main SOP

The main `sop-workflow.md` is designed for comprehensive ISO 21502 compliance with:

- 9-phase mandatory workflow
- 5+ web searches per phase
- 10-minute cooldowns
- Detailed research documents

**For AI-allowed issues**, this streamlined workflow is acceptable because:

1. AI assistance speeds up implementation
2. Transcript captures the full process
3. Report file provides summary
4. Uplift tracker captures metrics

---

## Integration with METR Study

### Transcript Management

AI-allowed session transcripts are suitable for METR sharing because:

- Technical content only (no personal/financial data)
- Clean session per issue
- Clear issue identification at start

### Before Sharing Transcripts

Run audit per `transcript-management.md`:

```bash
# Check for sensitive content
grep -oci "password\|payment\|salary\|bank" <transcript-file>
```

---

## Related Documents

| Document                                | Purpose                                      |
| --------------------------------------- | -------------------------------------------- |
| @.claude/rules/sop-workflow.md          | Full 9-phase SOP with mandatory requirements |
| @.claude/rules/project-management.md    | ISO 21502/PMI PMBOK integration              |
| @.claude/rules/coderabbit.md            | CodeRabbit review handling                   |
| @.claude/rules/merge-policy.md          | Git merge requirements (--merge ONLY)        |
| @.claude/rules/post-merge.md            | Post-merge checklist                         |
| @.claude/rules/transcript-management.md | METR study transcript guidelines             |

---

_Document Version: 1.0_
_Created: 2026-01-19_
_Applies to: AI-Allowed issues in Uplift Tracker_
