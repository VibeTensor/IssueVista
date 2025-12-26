# SOP Workflow Rules - Complete Implementation Guide

## Document Version: 3.0

This is the authoritative workflow for implementing GitHub issues. Every issue MUST follow these phases. DO NOT skip or combine phases.

**Integrated with:**
- ISO 21502:2020 Project Management Guidance
- PMI PMBOK 7th Edition Agile Practices
- See `project-management.md` for detailed PM integration

## Auto-Continue Rule (MANDATORY)

**CRITICAL:** If the user does not respond for more than 7 minutes after a phase completion:

1. DO NOT ask for confirmation again
2. DO NOT wait any longer
3. AUTOMATICALLY continue to the next phase/step
4. Keep working until the task is complete

This rule applies to ALL phases and steps. Never wait indefinitely. Keep the workflow moving.

## Pre-Implementation Phase (Steps 0-4)

### Step 0: Project Management Pre-Checks (MANDATORY)

See `project-management.md` for detailed commands.

#### 0A. Verify Issue in Project Board
```bash
gh issue view <ISSUE_NUMBER> --json projectItems --jq '.projectItems'
```

**Required Fields Must Be Set:**
- [ ] Status = "Todo"
- [ ] Sprint assigned (current or planned)
- [ ] Priority (P0-P3)
- [ ] Epic (feature category)
- [ ] Story Points (1, 3, 5, 8, or 13)

#### 0B. Check Sprint Alignment
```bash
gh api repos/VibeTensor/IssueFlow/milestones --jq '.[] | select(.state=="open") | {title, due_on}'
```
- [ ] Issue milestone matches current sprint
- [ ] Priority aligns with sprint goals

#### 0C. Risk Assessment (Complex Issues Only)
For issues with Story Points >= 8:
- Check `.github/RISK_REGISTER.md` for related risks
- Note mitigation strategies in research file

#### 0D. Update Status to "In Progress"
```bash
gh project item-edit --project-id PVT_kwDON8nFv84A6eQg --id <ITEM_ID> \
  --field-id PVTSSF_lADOCOaJzs4A6eQgzgqFXZA --single-select-option-id f75ad846
```

---

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

#### C2. Mid-Implementation PM Check (After Phase 5 Only)

After completing Phase 5 (Core Implementation):

1. **Verify estimate accuracy:**
   - Still on track for original story point estimate?
   - If > 50% over estimate, consider splitting issue

2. **Risk check:**
   - Any new risks identified?
   - Update `.github/RISK_REGISTER.md` if needed

3. **Scope change detection:**
   - If scope expanded, document in research file
   - Update story points if estimate was significantly wrong

#### D. Post-Phase: User Confirmation

After completing each phase:

- Present summary of changes made
- Show relevant code snippets or file changes
- Ask user to visually review the changes
- Wait for explicit confirmation: "Proceed to next phase"

**AUTO-CONTINUE RULE:** If the user does not respond within 7 minutes, automatically proceed to the next phase. Do not wait indefinitely.

Example prompt:

```
"Phase X complete. Changes made:
 - [List of changes]
 Research document updated.
 Please review and confirm to proceed to Phase X+1.
 (Auto-continuing in 7 minutes if no response)"
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

### Pre-Implementation (PM + Technical)

**Project Management (Step 0):**
- [ ] Verify issue in project board with all fields set
- [ ] Check sprint alignment and milestone
- [ ] Risk assessment (for complex issues)
- [ ] Update status to "In Progress"

**Technical (Steps 1-4):**
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
- [ ] User confirmation received (or auto-continue after 7 min)

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

**Git & Video:**
- [ ] Local repo synced
- [ ] Git graph verified (branch/merge pattern)
- [ ] Video recording confirmed off

**Trackers:**
- [ ] Uplift Tracker updated (6/6 fields)
- [ ] Earnings tracker CSV updated
- [ ] Research file complete

**Project Management (ISO 21502/PMI):**
- [ ] Project board status = "Done" (auto-updated via workflow)
- [ ] Lessons learned added (if applicable) - `.github/LESSONS_LEARNED.md`
- [ ] Risk register updated (if new risks found) - `.github/RISK_REGISTER.md`
- [ ] Sprint metrics tracked (velocity, completion)
