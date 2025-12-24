# SOP Workflow Rules - Complete Implementation Guide

## Document Version: 2.6

This is the authoritative workflow for implementing GitHub issues. Every issue MUST follow these phases. DO NOT skip or combine phases.

## Pre-Implementation Phase (Steps 1-4)

### Step 1: Read Issue Description

```bash
gh issue view <ISSUE_NUMBER> --repo VibeTensor/IssueFlow
```

Actions:

- Read the full issue description
- Identify acceptance criteria
- Note specific requirements or constraints
- Identify related issues or dependencies

### Step 2: Read CodeRabbit Comments on Issue Thread

```bash
gh api repos/VibeTensor/IssueFlow/issues/<ISSUE_NUMBER>/comments \
  --jq '.[] | {user: .user.login, body: .body}'
```

Actions:

- Check for CodeRabbit's automated analysis
- Note suggestions and implementation recommendations
- Identify related issues suggested
- Document all findings in `issue_XX_research.txt`

### Step 3: Web Search for Context (5-10 Searches)

Categories to cover:

- Official documentation (1-2 searches)
- Best practices guides (1-2 searches)
- Similar implementations (1-2 searches)
- Security considerations (1 search)
- Performance optimizations (1 search)
- Edge cases/pitfalls (1 search as needed)

Create research file immediately: `.internal/research/issue_XX_research.txt`

### Step 4: Create 9-Phase Implementation Plan (MANDATORY)

CRITICAL: You MUST create a 9-phase plan for EVERY issue. This is NON-NEGOTIABLE.

```
Phase 1: Setup & Branch Creation
Phase 2: Research & Audit Existing Code
Phase 3: Identify Affected Files/Components
Phase 4: Design Implementation Approach
Phase 5: Core Implementation
Phase 6: Additional Features/Automation (if needed)
Phase 7: Update Documentation
Phase 8: Commit & Push
Phase 9: Create PR & Review
```

FAILURE TO CREATE 9-PHASE PLAN = IMPLEMENTATION REJECTED

## Implementation Phase (9 Phases)

### For Each Phase, Follow A-D Cycle:

#### A. Pre-Phase: Mandatory Web Research (5-10 Searches)

CRITICAL: This step is NON-NEGOTIABLE.

Before starting each phase:

1. Identify 5-10 search queries relevant to the phase
2. Execute each search using WebSearch tool
3. Document in `issue_XX_research.txt`:
   - Exact search query used
   - URLs of relevant resources
   - Key insights extracted

Thorough Thinking Requirement:

- Analyze all resources critically
- Compare different approaches found
- Identify consensus patterns
- Note conflicts or trade-offs
- Document rationale for final decision

#### B. Execute Phase

- Follow coding standards (see `coding-standards.md`)
- Write clean, maintainable code
- Avoid over-engineering
- Keep changes focused on issue requirements

#### C. Document Phase Findings

Update research document with:

- Phase number and title
- Web searches performed
- Commands used
- Issues encountered and solutions
- Files modified

#### D. Post-Phase: User Confirmation

After completing each phase:

- Present summary of changes made
- Show relevant code snippets or file changes
- Ask user to visually review the changes
- Wait for explicit confirmation: "Proceed to next phase"

Example prompt:

```
"Phase X complete. Changes made:
 - [List of changes]
 Research document updated.
 Please review and confirm to proceed to Phase X+1."
```

## Post-Implementation Phase (Steps 5-6)

### Step 5: Final Confirmation Check

Before creating PR, verify:

- [ ] All 9 phases completed
- [ ] All user confirmations received
- [ ] Code follows repository standards
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated (if required)
- [ ] All files properly staged

Commands:

```bash
git status
git diff --staged
```

Ask user: "All phases complete. Ready to create PR? Please confirm."

### Step 6: Create Pull Request

```bash
# Stage and commit
git add <files>
git commit -m "[TYPE] Description (#ISSUE_NUMBER)"

# Push branch
git push -u origin <branch-name>

# Create PR
gh pr create --title "[TYPE] Title (#ISSUE_NUMBER)" --body "$(cat <<'EOF'
## Summary
- [Bullet points of changes]

## Test Plan
- [ ] Test item 1
- [ ] Test item 2

Closes #ISSUE_NUMBER
EOF
)"
```

## PR Review Phase (Steps 7-11)

### Step 7: Wait for CI Checks

```bash
gh pr checks <PR_NUMBER> --repo VibeTensor/IssueFlow --watch
```

Do NOT proceed until all checks pass.

### Step 8: Handle CodeRabbit Review

See `coderabbit.md` for detailed review handling.

### Step 9: Iterate Until CodeRabbit Satisfied

Repeat cycle:

1. Implement fixes based on feedback
2. Commit: `git commit -m "fix: Address CodeRabbit review - [description]"`
3. Push: `git push origin <branch-name>`
4. Wait for new CI checks
5. Check for new review
6. Repeat until: "Actionable comments: 0"

### Step 10: User Final Confirmation

Before merging, confirm with user:

- Show final PR state
- Show all checks passed
- Show CodeRabbit approval
- Ask: "Ready to merge?"

### Step 11: Merge PR

See `merge-policy.md` for mandatory merge requirements.

```bash
gh pr merge <PR_NUMBER> --merge --delete-branch
```

## Post-Merge Phase (Steps 12-16)

See `post-merge.md` for complete post-merge workflow.

### Step 12: Sync Local Repository

```bash
git checkout master
git pull origin master
git log --oneline --graph -10
```

### Step 13: Video Recording & Uplift Tracker Data

- Confirm video recording is turned off
- Collect video link and duration
- Provide complete Uplift Tracker data

### Step 14: Update Uplift Tracker

- Fill all 6 required fields
- Click "Finish Issue"

### Step 15: Update Earnings Tracker CSV

File: `.internal/trackers/december_2025_earnings_tracker.csv`

### Step 16: Create Research Document

Document all learnings, commands used, and statistics.

## Complexity Assessment

| Complexity | Phases | Time     | Examples                     |
| ---------- | ------ | -------- | ---------------------------- |
| Simple     | 1-3    | ~30min   | Docs, labels, single file    |
| Medium     | 5-7    | ~60min   | New component, multi-file    |
| Complex    | 9      | ~120+min | Major features, architecture |

## Quick Reference Checklists

### Pre-Implementation

- [ ] Read issue description
- [ ] Read ALL CodeRabbit issue thread comments
- [ ] Document suggestions in research file
- [ ] Web search (5-10 searches)
- [ ] Create 9-phase plan
- [ ] Start video recording
- [ ] Start time tracking

### Each Phase

- [ ] Web search (5-10 searches)
- [ ] Implement
- [ ] Document in research file
- [ ] User confirmation received

### Pre-PR

- [ ] All 9 phases complete
- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] User final confirmation

### PR Review

- [ ] CI checks pass
- [ ] All CodeRabbit comments addressed
- [ ] "Actionable comments: 0"
- [ ] User merge confirmation
- [ ] Merged with `--merge` (NEVER `--squash`)

### Post-Merge

- [ ] Local repo synced
- [ ] Git graph verified (branch/merge pattern)
- [ ] Video recording confirmed off
- [ ] Uplift Tracker updated (6/6 fields)
- [ ] Earnings tracker CSV updated
- [ ] Research file complete
