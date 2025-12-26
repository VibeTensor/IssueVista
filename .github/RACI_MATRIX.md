# RACI Matrix

## ISO 21502:2020 Responsibility Assignment

### Legend
- **R** = Responsible (Does the work)
- **A** = Accountable (Final authority)
- **C** = Consulted (Provides input)
- **I** = Informed (Kept updated)

---

## Project Roles

| Role | Description | Current Assignee |
|------|-------------|------------------|
| Project Owner | Strategic decisions, final authority | @ascender1729 |
| Tech Lead | Architecture, technical decisions | @ascender1729 |
| Maintainer | Code review, merge authority | @ascender1729 |
| Contributor | Feature development, bug fixes | Community |
| Reviewer | Code review, quality assurance | @coderabbitai |

---

## Core Activities

### Project Management

| Activity | Project Owner | Tech Lead | Maintainer | Contributor | Reviewer |
|----------|---------------|-----------|------------|-------------|----------|
| Define project vision | A/R | C | I | I | - |
| Sprint planning | A | R | C | C | I |
| Milestone creation | A | R | C | I | - |
| Priority assignment | A | R | C | I | - |
| Resource allocation | A/R | C | I | I | - |
| Risk management | A | R | C | I | - |
| Status reporting | A | R | I | I | - |

### Development Workflow

| Activity | Project Owner | Tech Lead | Maintainer | Contributor | Reviewer |
|----------|---------------|-----------|------------|-------------|----------|
| Issue creation | I | C | C | R | - |
| Feature design | C | A | R | R | C |
| Code implementation | I | C | C | R | - |
| Code review | I | C | A | R | R |
| Testing | I | C | C | R | C |
| Documentation | I | C | C | R | C |
| PR approval | I | C | A/R | I | C |
| Deployment | A | R | R | I | I |

### Quality Assurance

| Activity | Project Owner | Tech Lead | Maintainer | Contributor | Reviewer |
|----------|---------------|-----------|------------|-------------|----------|
| Define coding standards | A | R | C | I | C |
| Enforce linting rules | I | A | R | R | - |
| Security review | A | R | C | I | R |
| Performance testing | I | A | R | R | C |
| Accessibility audit | I | A | R | R | C |
| CI/CD maintenance | I | A | R | C | - |

### Release Management

| Activity | Project Owner | Tech Lead | Maintainer | Contributor | Reviewer |
|----------|---------------|-----------|------------|-------------|----------|
| Version planning | A | R | C | I | - |
| Release notes | I | A | R | C | - |
| Changelog update | I | C | R | R | - |
| Tag creation | I | A | R | I | - |
| Production deployment | A | R | R | I | - |
| Rollback decision | A | R | C | I | - |

### Communication

| Activity | Project Owner | Tech Lead | Maintainer | Contributor | Reviewer |
|----------|---------------|-----------|------------|-------------|----------|
| Stakeholder updates | A/R | C | I | I | - |
| Community engagement | A | C | R | R | - |
| Issue triage | I | C | A/R | C | C |
| PR comments | I | C | R | R | R |
| Documentation review | I | C | A | R | C |

---

## Decision Authority Matrix

| Decision Type | Authority Level | Escalation Path |
|---------------|-----------------|-----------------|
| Bug fix approach | Maintainer | Tech Lead |
| Feature implementation | Tech Lead | Project Owner |
| Architecture change | Project Owner | - |
| Security response | Project Owner | - |
| Breaking change | Project Owner | - |
| Dependency update | Maintainer | Tech Lead |
| Release timing | Project Owner | - |

---

## Escalation Procedure

1. **Level 1**: Contributor discusses with Maintainer
2. **Level 2**: Maintainer escalates to Tech Lead
3. **Level 3**: Tech Lead escalates to Project Owner
4. **Level 4**: Project Owner makes final decision

---

## Role Transitions

| Scenario | From | To | Approval |
|----------|------|-----|----------|
| New contributor | - | Contributor | Maintainer |
| Trusted contributor | Contributor | Maintainer | Project Owner |
| Project transfer | Project Owner | New Owner | Project Owner |

---

*Document Version: 1.0*
*Last Updated: December 26, 2025*
*Compliant with: ISO 21502:2020 Section 6.3*
