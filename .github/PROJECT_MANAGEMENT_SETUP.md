# IssueFlow Project Management Configuration Guide

## Overview

This guide documents the complete project management setup for IssueFlow, aligned with:
- **ISO 21502:2020** - Project Management Guidance
- **PMI PMBOK 7th Edition** - Agile Practices
- **GitHub Best Practices** - Project Management

---

## Project Dashboard

**URL:** https://github.com/orgs/VibeTensor/projects/2

---

## Views Configuration (Manual Setup Required)

Navigate to: https://github.com/orgs/VibeTensor/projects/2

### View 1: All Issues (Table)
- **Layout:** Table
- **Purpose:** Complete issue inventory
- **Columns:** Title, Assignees, Status, Sprint, Priority, Epic, Effort, Story Points, Target Date, Labels
- **Sorting:** By Issue Number (ascending)
- **Filters:** None (show all)

### View 2: Kanban Board
- **Layout:** Board
- **Purpose:** Daily workflow management
- **Group By:** Status
- **Columns:**
  - Todo (limit: 20)
  - In Progress (limit: 5)
  - Done (no limit)
- **Card Fields:** Title, Assignees, Priority, Story Points

### View 3: Roadmap Timeline
- **Layout:** Roadmap
- **Purpose:** Release planning visualization
- **Date Field:** Target Date
- **Markers:** Show milestones
- **Zoom:** Month view

### View 4: Sprint Board (CREATE NEW)
- **Layout:** Table
- **Purpose:** Sprint planning and tracking
- **Group By:** Sprint
- **Columns:** Title, Status, Priority, Story Points, Assignees
- **Sorting:** By Priority (P0 first)
- **Show:** Field sum for Story Points

### View 5: Priority Matrix (CREATE NEW)
- **Layout:** Board
- **Purpose:** Focus on critical items
- **Group By:** Priority
- **Columns:** P0-Critical, P1-High, P2-Medium, P3-Low
- **Sorting:** By Story Points (descending)

### View 6: Epic Overview (CREATE NEW)
- **Layout:** Table
- **Purpose:** Feature-level planning
- **Group By:** Epic
- **Columns:** Title, Sprint, Status, Story Points, Target Date
- **Show:** Field sum for Story Points per Epic

### View 7: Risk Dashboard (CREATE NEW)
- **Layout:** Board
- **Purpose:** Risk visibility
- **Group By:** Risk Level
- **Columns:** Low, Medium, High, Critical
- **Sorting:** By Priority

### View 8: My Items (CREATE NEW)
- **Layout:** Table
- **Purpose:** Personal task list
- **Filter:** Assignee = @me
- **Columns:** Title, Status, Sprint, Priority, Target Date
- **Sorting:** By Target Date

---

## Insights Charts Configuration

Navigate to: https://github.com/orgs/VibeTensor/projects/2/insights

### Chart 1: Status Distribution (EXISTS)
- **Type:** Column/Bar
- **X-Axis:** Status
- **Y-Axis:** Count
- **Purpose:** Current workflow state

### Chart 2: Sprint Progress (CREATE NEW)
- **Type:** Stacked Bar
- **X-Axis:** Sprint
- **Y-Axis:** Count
- **Stack By:** Status
- **Filter:** Sprint != Backlog
- **Purpose:** Sprint completion tracking

### Chart 3: Priority Breakdown (CREATE NEW)
- **Type:** Pie/Donut
- **Group By:** Priority
- **Y-Axis:** Count
- **Purpose:** Priority distribution

### Chart 4: Epic Progress (CREATE NEW)
- **Type:** Stacked Bar
- **X-Axis:** Epic
- **Y-Axis:** Story Points (sum)
- **Stack By:** Status
- **Purpose:** Feature completion tracking

### Chart 5: Effort Distribution (CREATE NEW)
- **Type:** Bar
- **X-Axis:** Effort
- **Y-Axis:** Count
- **Purpose:** Work sizing analysis

### Chart 6: Burnup Chart (CREATE NEW)
- **Type:** Line (cumulative)
- **X-Axis:** Date/Time
- **Y-Axis:** Story Points (sum)
- **Filter:** Status = Done
- **Purpose:** Velocity tracking

### Chart 7: Category Breakdown (CREATE NEW)
- **Type:** Pie
- **Group By:** Category
- **Y-Axis:** Count
- **Purpose:** Issue type distribution

---

## Workflows Configuration

Navigate to: https://github.com/orgs/VibeTensor/projects/2/workflows

### Enabled Workflows (6)
1. **Item Added** - Sets new items to "Todo"
2. **Item Closed** - Sets status to "Done"
3. **Pull Request Merged** - Sets status to "Done"
4. **Pull Request Linked** - Sets status to "In Progress"
5. **Auto-Add Sub-Issues** - Adds sub-issues to project
6. **Auto-Close Issue** - Closes when "Done"

### Recommended Additional Workflows
7. **Auto-Archive** (ENABLE)
   - Trigger: Status = Done AND closed > 14 days
   - Action: Archive item

8. **Auto-Add Bugs** (ENABLE)
   - Trigger: Label = bug
   - Action: Add to project with Priority = P1

---

## Fields Reference

| Field | Type | Options |
|-------|------|---------|
| Status | Single Select | Todo, In Progress, Done |
| Sprint | Single Select | Backlog, Sprint 1-18 |
| Priority | Single Select | P0-Critical, P1-High, P2-Medium, P3-Low |
| Epic | Single Select | Core UI, Backend, PWA, AI Core, Multi-Agent, Advanced AI |
| Effort | Single Select | XS(1), S(3), M(5), L(8), XL(13) |
| Risk Level | Single Select | Low, Medium, High, Critical |
| Category | Single Select | Feature, Bug, Enhancement, Documentation, Chore, Security |
| Story Points | Number | 1, 3, 5, 8, 13 |
| Target Date | Date | Sprint end dates |
| Notes | Text | Free text |

---

## Status Updates

Navigate to project settings to add status updates:
- **Frequency:** Weekly
- **Format:**
  ```
  ## Week of [DATE]

  **Status:** On Track / At Risk / Off Track

  ### Completed
  - Item 1
  - Item 2

  ### In Progress
  - Item 3

  ### Blockers
  - None / List blockers

  ### Next Week
  - Planned items
  ```

---

## Step-by-Step Setup Instructions

### Creating a New View

1. Go to https://github.com/orgs/VibeTensor/projects/2
2. Click the **+** button next to existing tabs
3. Click **New view**
4. Name the view (e.g., "Sprint Board")
5. Click the **Layout** dropdown to select Table/Board/Roadmap
6. Click the **Group** button to group by a field
7. Click column headers to sort
8. Use **Filter** button to add filters
9. Click **Save** to preserve changes

### Creating a New Chart

1. Go to https://github.com/orgs/VibeTensor/projects/2/insights
2. Click **New chart**
3. Select chart type (Bar, Line, Stacked, etc.)
4. Configure:
   - X-axis field
   - Y-axis (Count or Sum of field)
   - Group by (optional)
   - Filters (optional)
5. Name the chart
6. Click **Save**

### Enabling a Workflow

1. Go to https://github.com/orgs/VibeTensor/projects/2/workflows
2. Find the workflow (e.g., "Auto-archive items")
3. Click on the workflow
4. Toggle **On**
5. Configure triggers and actions
6. Click **Save**

---

## Project Management Documentation

All documents are located in `.github/` directory:

| Document | Description | ISO/PMI Reference |
|----------|-------------|-------------------|
| [GOVERNANCE.md](GOVERNANCE.md) | Project governance framework | ISO 21502 Section 5 |
| [CHANGE_MANAGEMENT.md](CHANGE_MANAGEMENT.md) | Change control process | ISO 21502 Section 6.4 |
| [RISK_REGISTER.md](RISK_REGISTER.md) | Risk identification and tracking | ISO 21502 Section 6.7 |
| [STAKEHOLDER_REGISTER.md](STAKEHOLDER_REGISTER.md) | Stakeholder analysis | ISO 21502 Section 6.2 |
| [COMMUNICATION_PLAN.md](COMMUNICATION_PLAN.md) | Communication strategy | ISO 21502 Section 6.5 |
| [RACI_MATRIX.md](RACI_MATRIX.md) | Responsibility assignment | ISO 21502 Section 6.3 |
| [WORK_BREAKDOWN_STRUCTURE.md](WORK_BREAKDOWN_STRUCTURE.md) | Scope decomposition | ISO 21502 Section 6.1 |
| [SPRINT_PLANNING.md](SPRINT_PLANNING.md) | Sprint management guide | PMBOK Agile |
| [SPRINT_RETROSPECTIVE.md](SPRINT_RETROSPECTIVE.md) | Retrospective template | PMBOK Agile |
| [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) | Quality standards | PMBOK Quality |
| [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) | Release process | ISO 21502 Section 6.8 |
| [LESSONS_LEARNED.md](LESSONS_LEARNED.md) | Knowledge management | ISO 21502 Section 6.9 |

---

## Compliance Checklist

### ISO 21502:2020 Requirements

- [x] Project Charter defined ([GOVERNANCE.md](GOVERNANCE.md))
- [x] Scope Statement documented ([WORK_BREAKDOWN_STRUCTURE.md](WORK_BREAKDOWN_STRUCTURE.md))
- [x] Work Breakdown Structure ([WORK_BREAKDOWN_STRUCTURE.md](WORK_BREAKDOWN_STRUCTURE.md))
- [x] Schedule with milestones (GitHub Milestones)
- [x] Resource planning ([RACI_MATRIX.md](RACI_MATRIX.md))
- [x] Risk identification ([RISK_REGISTER.md](RISK_REGISTER.md))
- [x] Quality criteria ([DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md))
- [x] Communication plan ([COMMUNICATION_PLAN.md](COMMUNICATION_PLAN.md))
- [x] Stakeholder register ([STAKEHOLDER_REGISTER.md](STAKEHOLDER_REGISTER.md))
- [x] Change management process ([CHANGE_MANAGEMENT.md](CHANGE_MANAGEMENT.md))
- [x] Lessons learned documentation ([LESSONS_LEARNED.md](LESSONS_LEARNED.md))

### PMI PMBOK Agile Practices

- [x] Sprint-based planning (18 sprints)
- [x] Product backlog (195 items)
- [x] Sprint backlog (Sprint field)
- [x] Velocity tracking (Story Points)
- [x] Kanban board (Status workflow)
- [x] Definition of Done ([DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md))
- [x] Retrospective template ([SPRINT_RETROSPECTIVE.md](SPRINT_RETROSPECTIVE.md))
- [x] Sprint planning guide ([SPRINT_PLANNING.md](SPRINT_PLANNING.md))
- [x] Release checklist ([RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md))

### GitHub Best Practices

- [x] README with project overview
- [x] Custom fields for metadata
- [x] Multiple views for different purposes
- [x] Automated workflows
- [x] Status updates
- [x] Insights charts
- [x] Linked pull requests
- [x] Issue templates (8 templates)
- [x] Labels for categorization (21 labels)

---

## Quick Reference

| Task | Location |
|------|----------|
| View all issues | View 1: All Issues |
| Daily work | View 2: Kanban Board |
| Sprint planning | View 4: Sprint Board |
| Release planning | View 3: Roadmap |
| Risk review | View 7: Risk Dashboard |
| My tasks | View 8: My Items |
| Progress charts | Insights tab |
| Automation | Workflows tab |

---

## Resources

- [GitHub Projects Best Practices](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects)
- [ISO 21502:2020 Standard](https://www.iso.org/standard/74947.html)
- [PMI PMBOK Guide](https://www.pmi.org/pmbok-guide-standards)
- [Customizing Views](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project)
- [Project Insights](https://docs.github.com/en/issues/planning-and-tracking-with-projects/viewing-insights-from-your-project/about-insights-for-projects)

---

*Document Version: 2.0*
*Last Updated: December 26, 2025*
*Author: @ascender1729*
*Compliance: ISO 21502:2020 (11/11), PMI PMBOK 7th Edition (9/9), GitHub Best Practices (9/9)*
