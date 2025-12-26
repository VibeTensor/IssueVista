# Definition of Done (DoD)

## PMI PMBOK Agile Quality Standards

### Purpose
This document defines the criteria that must be met before any work item can be considered "Done". Adherence to DoD ensures consistent quality across all deliverables.

---

## Story Level DoD

### Code Quality
- [ ] Code follows project coding standards (see `CONTRIBUTING.md`)
- [ ] TypeScript strict mode - no type errors
- [ ] ESLint passes with 0 errors
- [ ] Prettier formatting applied
- [ ] No console.log statements (except in development utilities)
- [ ] No commented-out code
- [ ] No hardcoded secrets or credentials

### Functionality
- [ ] All acceptance criteria met
- [ ] Feature works as described in issue
- [ ] Edge cases handled appropriately
- [ ] Error states handled gracefully
- [ ] Loading states implemented (if applicable)

### Testing
- [ ] Unit tests written for new code
- [ ] Existing tests pass
- [ ] Test coverage maintained or improved
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI change)

### Documentation
- [ ] Code comments where logic is complex
- [ ] JSDoc for public functions
- [ ] README updated (if public API changed)
- [ ] CHANGELOG entry added (if user-facing)

### Review
- [ ] Self-review completed
- [ ] PR created with description
- [ ] CodeRabbit review passed
- [ ] All review comments addressed
- [ ] At least one approval received

### CI/CD
- [ ] All CI checks pass
- [ ] Build succeeds
- [ ] No security vulnerabilities introduced
- [ ] Bundle size acceptable

---

## Sprint Level DoD

### Completion Criteria
- [ ] All committed stories meet Story DoD
- [ ] Sprint goal achieved
- [ ] No critical bugs remaining
- [ ] Sprint retrospective completed
- [ ] Sprint metrics captured

### Documentation
- [ ] Sprint retrospective documented
- [ ] Lessons learned updated
- [ ] Risk register reviewed

---

## Release Level DoD

### Pre-Release Checklist
- [ ] All sprint DoDs met for included sprints
- [ ] Version number updated (semantic versioning)
- [ ] CHANGELOG.md complete for version
- [ ] README.md reflects current state
- [ ] All dependencies up to date
- [ ] Security audit passed

### Testing
- [ ] Full regression test suite passes
- [ ] E2E tests pass
- [ ] Performance benchmarks acceptable
- [ ] Accessibility audit passed (WCAG 2.1 AA)

### Release Artifacts
- [ ] Git tag created
- [ ] GitHub Release published
- [ ] Release notes written
- [ ] Migration guide (if breaking changes)

---

## Definition of Done by Issue Type

### Feature
- [ ] Story DoD complete
- [ ] Feature documentation added
- [ ] Feature flag removed (if applicable)
- [ ] Analytics/tracking implemented (if required)

### Bug Fix
- [ ] Story DoD complete
- [ ] Root cause identified
- [ ] Regression test added
- [ ] Related bugs checked

### Enhancement
- [ ] Story DoD complete
- [ ] Backward compatibility maintained
- [ ] Performance impact assessed

### Documentation
- [ ] Content accurate and complete
- [ ] Spelling and grammar checked
- [ ] Links verified
- [ ] Screenshots updated (if applicable)

### Refactoring
- [ ] Story DoD complete
- [ ] No behavior changes (unless intentional)
- [ ] Performance maintained or improved
- [ ] All tests pass

### Security
- [ ] Story DoD complete
- [ ] Vulnerability patched
- [ ] Security advisory published (if applicable)
- [ ] Dependent systems notified

---

## Quality Gates

### Gate 1: Development Complete
- [ ] Code written and self-reviewed
- [ ] Local tests pass
- [ ] PR created

### Gate 2: Review Complete
- [ ] CodeRabbit approved
- [ ] Human review approved
- [ ] CI checks pass

### Gate 3: Ready for Merge
- [ ] All DoD criteria met
- [ ] No unresolved conversations
- [ ] Branch up to date with master

### Gate 4: Done
- [ ] Merged to master
- [ ] Issue closed
- [ ] Verified in production (if applicable)

---

## Exceptions Process

If DoD cannot be fully met:

1. **Document** the exception and reason
2. **Assess** risk and impact
3. **Get approval** from Tech Lead or Project Owner
4. **Create** follow-up issue for remediation
5. **Track** as technical debt

---

## DoD Review

The Definition of Done is reviewed and updated:
- At the start of each quarter
- After significant project changes
- When quality issues are identified

---

*Document Version: 1.0*
*Last Updated: December 26, 2025*
*Compliant with: PMI PMBOK 7th Edition - Quality Management*
