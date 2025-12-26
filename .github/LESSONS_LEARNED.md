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

## Categories Summary

| Category | Count | Trend |
|----------|-------|-------|
| Technical | 3 | - |
| Process | 0 | - |
| Communication | 0 | - |
| Resource | 0 | - |

---

## Review Schedule

| Review Type | Frequency | Participants |
|-------------|-----------|--------------|
| Sprint Retrospective | Bi-weekly | All contributors |
| Quarterly Review | Quarterly | Project owner, maintainers |
| Annual Assessment | Yearly | All stakeholders |

---

## Knowledge Transfer

Lessons are shared through:
1. This document (primary source)
2. Sprint retrospective meetings
3. Onboarding documentation
4. Code comments where applicable

---

*Document Version: 1.0*
*Last Updated: December 26, 2025*
*Compliant with: ISO 21502:2020 Section 6.9*
