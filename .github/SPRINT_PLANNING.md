# Sprint Planning Guide

## PMI PMBOK Agile Sprint Management

### 1. Sprint Overview

| Parameter        | Value                       |
| ---------------- | --------------------------- |
| Sprint Duration  | 1 week                      |
| Sprint Cadence   | Continuous                  |
| Planning Meeting | Start of sprint             |
| Retrospective    | End of sprint               |
| Velocity Target  | Based on historical average |

---

### 2. Pre-Planning Checklist

Before sprint planning meeting:

- [ ] Previous sprint retrospective completed
- [ ] Backlog groomed and prioritized
- [ ] Story points estimated for top items
- [ ] Dependencies identified
- [ ] Team availability confirmed
- [ ] Blockers from previous sprint addressed

---

### 3. Sprint Planning Agenda

| Time      | Activity                        | Owner         |
| --------- | ------------------------------- | ------------- |
| 0-10 min  | Review previous sprint metrics  | Maintainer    |
| 10-20 min | Discuss sprint goal             | Project Owner |
| 20-40 min | Select and commit to stories    | Team          |
| 40-55 min | Break down tasks                | Team          |
| 55-60 min | Confirm capacity and commitment | All           |

---

### 4. Sprint Goal Template

```markdown
## Sprint [NUMBER] Goal

**Theme:** [One-line theme]

**Primary Objective:**
[Clear, measurable objective]

**Success Criteria:**

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Out of Scope:**

- Item 1
- Item 2
```

---

### 5. Capacity Planning

#### Individual Capacity Calculation

```
Available Days = Sprint Days - PTO - Meetings - Other Commitments
Capacity = Available Days x Focus Factor (0.6-0.8)
Story Points = Capacity x Historical Velocity Per Day
```

#### Team Capacity Template

| Team Member | Available Days | Focus Factor | Capacity (SP) |
| ----------- | -------------- | ------------ | ------------- |
| @username1  | X              | 0.7          | Y             |
| @username2  | X              | 0.7          | Y             |
| **Total**   |                |              | **Z**         |

---

### 6. Story Selection Criteria

#### Priority Order

1. **P0 - Critical**: Must be done this sprint
2. **P1 - High**: Should be done this sprint
3. **P2 - Medium**: Nice to have
4. **P3 - Low**: If capacity allows

#### Selection Checklist

- [ ] Story is properly defined with acceptance criteria
- [ ] Story is estimated (story points assigned)
- [ ] Dependencies are identified and resolved
- [ ] Story fits within remaining capacity
- [ ] Story aligns with sprint goal

---

### 7. Story Breakdown

For each committed story:

```markdown
### Story: [TITLE] (#ISSUE_NUMBER)

**Story Points:** X
**Priority:** PX
**Assignee:** @username

#### Tasks:

- [ ] Task 1 (X hours)
- [ ] Task 2 (X hours)
- [ ] Task 3 (X hours)

#### Acceptance Criteria:

- [ ] Criterion 1
- [ ] Criterion 2

#### Dependencies:

- Depends on: #ISSUE
- Blocks: #ISSUE

#### Risks:

- Risk 1
```

---

### 8. Sprint Commitment

```markdown
## Sprint [NUMBER] Commitment

**Sprint Goal:** [Goal statement]

**Committed Stories:**
| # | Title | Points | Assignee | Priority |
|---|-------|--------|----------|----------|
| 1 | Story 1 | X | @user | P1 |
| 2 | Story 2 | X | @user | P1 |

**Total Committed:** X story points
**Team Capacity:** Y story points
**Buffer:** Z story points (for bugs/urgent items)

**Risks and Mitigations:**

1. Risk 1 - Mitigation 1
2. Risk 2 - Mitigation 2

**Team Agreement:**

- [ ] All team members understand the sprint goal
- [ ] All team members agree to the commitment
- [ ] Dependencies are clear
- [ ] Definition of Done understood
```

---

### 9. Sprint Tracking

#### Daily Progress (Async)

Update issue status in GitHub Project:

- **Todo**: Not started
- **In Progress**: Being worked on
- **Done**: Meets Definition of Done

#### Sprint Burndown

Track daily:

- Story points remaining
- Stories completed vs planned
- Blockers and risks

---

### 10. Mid-Sprint Review

At sprint midpoint, assess:

- [ ] Are we on track for sprint goal?
- [ ] Any new blockers?
- [ ] Any scope changes needed?
- [ ] Team health check

**If behind schedule:**

1. Identify root cause
2. Consider scope reduction
3. Escalate if needed
4. Document in retrospective

---

### 11. Sprint Metrics

Track these metrics for each sprint:

| Metric                  | Definition             | Target         |
| ----------------------- | ---------------------- | -------------- |
| Velocity                | Story points completed | Stable +/- 20% |
| Commitment Accuracy     | Completed / Committed  | > 80%          |
| Carryover               | Stories not completed  | < 2 stories    |
| Bug Escape Rate         | Bugs found post-sprint | < 10%          |
| Sprint Goal Achievement | Goal met?              | Yes            |

---

### 12. Sprint Calendar

#### Week Structure

| Day       | Activities                               |
| --------- | ---------------------------------------- |
| Monday    | Sprint planning (new sprint), PR reviews |
| Tuesday   | Development, code reviews                |
| Wednesday | Development, mid-sprint check            |
| Thursday  | Development, documentation               |
| Friday    | Testing, sprint retrospective, PR merges |

---

_Document Version: 1.0_
_Last Updated: December 26, 2025_
_Compliant with: PMI PMBOK 7th Edition - Agile Practices_
