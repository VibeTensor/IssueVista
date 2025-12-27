# Change Management Process

## ISO 21502:2020 Compliant Change Control

### 1. Overview

This document defines the change management process for IssueFlow, ensuring all changes are properly evaluated, approved, and tracked in accordance with ISO 21502:2020 Project Management Guidance.

---

### 2. Change Categories

| Category     | Description                               | Approval Level         | Turnaround |
| ------------ | ----------------------------------------- | ---------------------- | ---------- |
| **Critical** | Security vulnerabilities, data loss risks | Project Owner          | 24 hours   |
| **Major**    | Architecture changes, breaking changes    | Project Owner + Review | 3-5 days   |
| **Standard** | New features, enhancements                | Maintainer             | 1-3 days   |
| **Minor**    | Bug fixes, documentation, typos           | Any Contributor        | Same day   |

---

### 3. Change Request Process

#### Step 1: Submit Change Request

```
Create GitHub Issue using appropriate template:
- Feature Request → [FEATURE]
- Bug Fix → [FIX]
- Enhancement → [ENHANCEMENT]
- Refactoring → [REFACTOR]
```

#### Step 2: Impact Assessment

**Technical Impact:**

- [ ] Files affected (list all)
- [ ] Dependencies impacted
- [ ] Breaking changes (Y/N)
- [ ] Performance implications
- [ ] Security considerations

**Business Impact:**

- [ ] User experience changes
- [ ] Documentation updates required
- [ ] Release notes needed

#### Step 3: Review and Approval

| Role        | Responsibility                           |
| ----------- | ---------------------------------------- |
| Submitter   | Complete issue template, provide context |
| Reviewer    | Assess technical feasibility, impact     |
| Approver    | Final authorization to proceed           |
| Implementer | Execute the change                       |

#### Step 4: Implementation

1. Create feature branch: `<type>/<issue-number>-<description>`
2. Implement changes following coding standards
3. Submit Pull Request with linked issue
4. Pass CI/CD checks
5. Address CodeRabbit review comments
6. Obtain approval

#### Step 5: Verification

- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No regression introduced

#### Step 6: Deployment

```bash
# Merge to master using --merge (never --squash)
gh pr merge <PR_NUMBER> --merge --delete-branch
```

---

### 4. Emergency Change Process

For critical security issues or production incidents:

1. **Immediate**: Create issue with `[SECURITY]` prefix and `security` label
2. **Assessment**: Evaluate severity (CVSS score if applicable)
3. **Fast-track**: Skip standard review for critical fixes
4. **Implementation**: Hotfix branch from master
5. **Post-mortem**: Document in Lessons Learned

---

### 5. Change Log Maintenance

All changes are documented in:

- `CHANGELOG.md` - User-facing changes
- Git commit history - Technical changes
- GitHub Releases - Version milestones

### Change Entry Format

```markdown
## [Version] - YYYY-MM-DD

### Added

- New feature description (#issue)

### Changed

- Modified behavior description (#issue)

### Fixed

- Bug fix description (#issue)

### Security

- Security fix description (#issue)
```

---

### 6. Rollback Procedure

If a change causes issues:

1. **Identify**: Confirm the problematic change
2. **Revert**: `git revert <commit-sha>`
3. **Deploy**: Push revert to master
4. **Document**: Create post-mortem issue
5. **Fix**: Create new issue for proper fix

---

### 7. Metrics and Reporting

Track the following metrics:

| Metric              | Target        | Frequency |
| ------------------- | ------------- | --------- |
| Change success rate | >95%          | Weekly    |
| Average review time | <48 hours     | Weekly    |
| Rollback rate       | <5%           | Monthly   |
| Emergency changes   | <10% of total | Monthly   |

---

### 8. Roles and Responsibilities

| Role              | Responsibilities                          |
| ----------------- | ----------------------------------------- |
| **Project Owner** | Final approval authority, major decisions |
| **Maintainer**    | Technical review, standard approvals      |
| **Contributor**   | Submit changes, address feedback          |
| **Reviewer**      | Code review, impact assessment            |

---

_Document Version: 1.0_
_Last Updated: December 26, 2025_
_Compliant with: ISO 21502:2020 Section 6.4_
