# Release Checklist

## ISO 21502:2020 Release Management

### Pre-Release Phase

#### 1. Release Planning

- [ ] Release version determined (semantic versioning)
- [ ] Release date confirmed
- [ ] All planned features merged to master
- [ ] Feature freeze announced

#### 2. Code Freeze Verification

- [ ] All PRs for this release merged
- [ ] No pending critical PRs
- [ ] Master branch stable
- [ ] All CI checks passing

#### 3. Testing

- [ ] Full regression test suite passed
- [ ] E2E tests passed
- [ ] Performance benchmarks acceptable
- [ ] Security scan completed
- [ ] Accessibility audit passed
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified

#### 4. Documentation Review

- [ ] README.md current and accurate
- [ ] CHANGELOG.md updated with all changes
- [ ] API documentation updated
- [ ] Migration guide written (if breaking changes)
- [ ] Known issues documented

#### 5. Dependencies

- [ ] All dependencies up to date
- [ ] No known vulnerabilities
- [ ] License compliance verified
- [ ] Lock files committed

---

### Release Execution

#### 6. Version Bump

```bash
# Update version in package.json
npm version [major|minor|patch]
```

- [ ] Version updated in package.json
- [ ] Version updated in package-lock.json
- [ ] Version constant updated in code (if applicable)

#### 7. Changelog Finalization

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added

- New feature (#issue)

### Changed

- Modified behavior (#issue)

### Fixed

- Bug fix (#issue)

### Security

- Security fix (#issue)

### Deprecated

- Deprecated feature (#issue)

### Removed

- Removed feature (#issue)
```

- [ ] All changes documented
- [ ] Issue numbers linked
- [ ] Contributors credited

#### 8. Final Build

```bash
npm run build
npm run lint
npm run test
```

- [ ] Production build successful
- [ ] No lint errors
- [ ] All tests pass
- [ ] Build artifacts generated

#### 9. Create Git Tag

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

- [ ] Tag created with proper naming
- [ ] Tag pushed to remote
- [ ] Tag matches package.json version

#### 10. GitHub Release

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes-file RELEASE_NOTES.md
```

- [ ] GitHub Release created
- [ ] Release notes attached
- [ ] Assets uploaded (if applicable)
- [ ] Pre-release flag set (if beta/rc)

---

### Post-Release Phase

#### 11. Deployment Verification

- [ ] Production deployment successful
- [ ] Smoke tests passed
- [ ] Monitoring confirmed
- [ ] No error spikes detected

#### 12. Communication

- [ ] Release announcement posted
- [ ] Social media updated (if applicable)
- [ ] Stakeholders notified
- [ ] Community informed

#### 13. Documentation

- [ ] Documentation site updated
- [ ] API docs regenerated
- [ ] Tutorials updated (if needed)

#### 14. Metrics

- [ ] Release metrics captured
- [ ] Download/usage stats baseline
- [ ] Error rates baseline

#### 15. Cleanup

- [ ] Feature branches deleted
- [ ] Stale issues reviewed
- [ ] Next milestone created
- [ ] Retrospective scheduled

---

### Rollback Plan

If critical issues discovered post-release:

#### Immediate Actions (< 1 hour)

1. [ ] Assess severity of issue
2. [ ] Notify stakeholders
3. [ ] Decision: rollback or hotfix

#### Rollback Procedure

```bash
# Revert to previous release
git checkout vX.Y.Z-1
git push --force origin master  # Only if absolutely necessary

# Or deploy previous version
npm i previous-version
```

#### Hotfix Procedure

```bash
# Create hotfix branch
git checkout -b hotfix/X.Y.Z+1 vX.Y.Z

# Fix issue
# ...

# Create hotfix release
npm version patch
git push origin hotfix/X.Y.Z+1 --tags
```

---

### Release Types

| Type          | Versioning       | Testing              | Announcement     |
| ------------- | ---------------- | -------------------- | ---------------- |
| Major (X.0.0) | Breaking changes | Full regression      | Blog post, email |
| Minor (0.X.0) | New features     | Feature + regression | GitHub release   |
| Patch (0.0.X) | Bug fixes        | Targeted + smoke     | GitHub release   |
| Hotfix        | Critical fix     | Minimal + smoke      | Immediate notify |

---

### Release Schedule

| Milestone          | Target Date   | Release Type |
| ------------------ | ------------- | ------------ |
| v1.0 - MVP         | Sprint 3 end  | Major        |
| v2.0 - AI          | Sprint 11 end | Major        |
| v3.0 - Multi-Agent | Sprint 14 end | Major        |
| v4.0 - Advanced    | Sprint 18 end | Major        |

---

### Responsible Parties

| Role          | Responsibility                              |
| ------------- | ------------------------------------------- |
| Project Owner | Release approval, stakeholder communication |
| Tech Lead     | Technical verification, deployment decision |
| Maintainer    | Release execution, documentation            |
| QA            | Testing verification, sign-off              |

---

_Document Version: 1.0_
_Last Updated: December 26, 2025_
_Compliant with: ISO 21502:2020 Section 6.8_
