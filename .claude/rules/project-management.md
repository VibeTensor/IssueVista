# Project Management Integration Rules

## ISO 21502:2020 & PMI PMBOK 7th Edition Compliance

This document defines the project management touchpoints integrated with the SOP workflow.

---

## Overview: Three-Phase PM Integration

| Phase            | When                      | PM Actions Required            |
| ---------------- | ------------------------- | ------------------------------ |
| **PRE-ISSUE**    | Before starting any issue | Verify, validate, update board |
| **DURING-ISSUE** | While implementing        | Status updates, risk tracking  |
| **POST-ISSUE**   | After merge               | Documentation, lessons learned |

---

## PHASE 1: PRE-ISSUE Project Management Checks

### Step 0A: Verify Issue is in Project Board

```bash
# Check issue is assigned to project
gh issue view <ISSUE_NUMBER> --json projectItems --jq '.projectItems'
```

**Required Fields Must Be Set:**

- [ ] Status (should be "Todo")
- [ ] Sprint (current or planned)
- [ ] Priority (P0-P3)
- [ ] Epic (feature category)
- [ ] Story Points (1, 3, 5, 8, or 13)

**If fields are missing, set them:**

```bash
# Get project item ID
gh project item-list 2 --owner VibeTensor --format json | findstr <ISSUE_NUMBER>

# Update fields via CLI (reference PROJECT_MANAGEMENT_SETUP.md for field IDs)
gh project item-edit --project-id <PROJECT_ID> --id <ITEM_ID> --field-id <FIELD_ID> --single-select-option-id <OPTION_ID>
```

### Step 0B: Check Sprint Alignment

```bash
# View current sprint milestone
gh api repos/VibeTensor/IssueFlow/milestones --jq '.[] | select(.state=="open") | {title, due_on, open_issues}'
```

**Verify:**

- [ ] Issue milestone matches current sprint
- [ ] Issue priority aligns with sprint goals
- [ ] No blocking dependencies from other issues

### Step 0C: Risk Assessment (For Complex Issues)

**Check RISK_REGISTER.md for:**

- Related technical risks
- Mitigation strategies to follow
- Contingency plans if needed

**Risk Levels by Issue Complexity:**
| Complexity | Risk Level | Required Action |
|------------|------------|-----------------|
| Simple (1-3 SP) | Low | Monitor only |
| Medium (5 SP) | Medium | Note in research file |
| Complex (8-13 SP) | High | Document risks before starting |

### Step 0D: Update Project Board Status

```bash
# Move issue to "In Progress" when starting
gh project item-edit --project-id <PROJECT_ID> --id <ITEM_ID> --field-id <STATUS_FIELD_ID> --single-select-option-id <IN_PROGRESS_ID>
```

**CLI Quick Reference:**

```bash
# Project ID: PVT_kwDON8nFv84A6eQg
# Status Field ID: PVTSSF_lADOCOaJzs4A6eQgzgqFXZA
# Status Options:
#   - Todo: 98236657
#   - In Progress: f75ad846
#   - Done: 8e45e91f
```

---

## PHASE 2: DURING-ISSUE Project Management Updates

### Step 5A: Mid-Implementation Status Check

At the end of Phase 5 (Core Implementation), verify:

- [ ] Still on track for original story point estimate?
- [ ] Any new risks identified? Update RISK_REGISTER.md if needed
- [ ] Any blockers? Document and escalate if necessary

### Step 5B: Scope Change Detection

If implementation reveals scope beyond original estimate:

1. **Document the scope change** in research file
2. **Consider splitting** into multiple issues if > 50% over estimate
3. **Update story points** if needed (before PR creation)

```bash
# Update story points if estimate was wrong
gh project item-edit --project-id PVT_kwDON8nFv84A6eQg --id <ITEM_ID> --field-id PVTF_lADOCOaJzs4A6eQgzgqFa4o --number <NEW_POINTS>
```

### Step 5C: Dependency Tracking

If this issue creates dependencies for other issues:

1. Add comment to dependent issues
2. Update WORK_BREAKDOWN_STRUCTURE.md if needed
3. Note in research file for lessons learned

---

## PHASE 3: POST-ISSUE Project Management Documentation

### Step 17: Update Project Board Status to Done

```bash
# After PR merge, status should auto-update via workflow
# Verify the status changed
gh project item-list 2 --owner VibeTensor --format json | findstr <ISSUE_NUMBER>
```

If not auto-updated:

```bash
gh project item-edit --project-id PVT_kwDON8nFv84A6eQg --id <ITEM_ID> --field-id PVTSSF_lADOCOaJzs4A6eQgzgqFXZA --single-select-option-id 8e45e91f
```

### Step 18: Update Lessons Learned (If Applicable)

**Add entry to `.github/LESSONS_LEARNED.md` when:**

- [ ] Unexpected technical challenge encountered
- [ ] New pattern or approach discovered
- [ ] Tool limitation found
- [ ] Process improvement identified

**Entry Template:**

```markdown
### LL-XXX: [Title]

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

#### Applicable To

[Future situations where this applies]
```

### Step 19: Update Sprint Metrics (End of Sprint)

At the end of each sprint, update:

1. **Velocity calculation** in SPRINT_RETROSPECTIVE.md
2. **Burndown data** if tracking manually
3. **Sprint goal achievement** status

### Step 20: Risk Register Review

If issue revealed or mitigated any risks:

1. Update risk status in `.github/RISK_REGISTER.md`
2. Add new risks if discovered
3. Close resolved risks

---

## Quick Reference: Project Management CLI Commands

### View Project Board

```bash
# List all items in project
gh project item-list 2 --owner VibeTensor --limit 200

# View specific issue in project
gh issue view <ISSUE_NUMBER> --json projectItems
```

### Update Issue Fields

```bash
# Get field IDs
gh project field-list 2 --owner VibeTensor

# Update status
gh project item-edit --project-id PVT_kwDON8nFv84A6eQg --id <ITEM_ID> --field-id PVTSSF_lADOCOaJzs4A6eQgzgqFXZA --single-select-option-id <OPTION_ID>
```

### View Sprint/Milestone

```bash
# List milestones
gh api repos/VibeTensor/IssueFlow/milestones

# View specific milestone
gh api repos/VibeTensor/IssueFlow/milestones/<NUMBER>
```

---

## Field IDs Reference

| Field        | Field ID                       | Type          |
| ------------ | ------------------------------ | ------------- |
| Status       | PVTSSF_lADOCOaJzs4A6eQgzgqFXZA | Single Select |
| Sprint       | PVTSSF_lADOCOaJzs4A6eQgzgqFXcY | Single Select |
| Priority     | PVTSSF_lADOCOaJzs4A6eQgzgqFXdo | Single Select |
| Epic         | PVTSSF_lADOCOaJzs4A6eQgzgqFXfA | Single Select |
| Effort       | PVTSSF_lADOCOaJzs4A6eQgzgqFXfk | Single Select |
| Risk Level   | PVTSSF_lADOCOaJzs4A6eQgzgqFXgQ | Single Select |
| Category     | PVTSSF_lADOCOaJzs4A6eQgzgqFXg4 | Single Select |
| Story Points | PVTF_lADOCOaJzs4A6eQgzgqFa4o   | Number        |
| Target Date  | PVTF_lADOCOaJzs4A6eQgzgqFbRI   | Date          |

---

## Status Option IDs

| Status      | Option ID |
| ----------- | --------- |
| Todo        | 98236657  |
| In Progress | f75ad846  |
| Done        | 8e45e91f  |

---

## Integration with Views

After completing issues, verify in project views:

| View            | What to Check                   |
| --------------- | ------------------------------- |
| Kanban Board    | Issue moved to Done column      |
| Sprint Board    | Sprint story points updated     |
| Roadmap         | Timeline reflects completion    |
| Priority Matrix | Issue removed from active queue |

---

## Compliance Checklist

### ISO 21502:2020 Requirements

- [ ] Issue tracked in project management system
- [ ] Risk assessment performed (for complex issues)
- [ ] Lessons learned captured
- [ ] Documentation updated

### PMI PMBOK Agile Requirements

- [ ] Sprint backlog updated
- [ ] Story points accurate
- [ ] Definition of Done verified
- [ ] Velocity data captured

### GitHub Best Practices

- [ ] Issue closed with PR link
- [ ] Labels accurate
- [ ] Milestone assigned
- [ ] Project board updated

---

_Document Version: 1.0_
_Last Updated: December 26, 2025_
_Compliant with: ISO 21502:2020, PMI PMBOK 7th Edition_
