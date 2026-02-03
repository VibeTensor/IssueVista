# Project Governance

## ISO 21502:2020 Governance Framework

### 1. Project Charter

#### Vision

To be the go-to tool for developers discovering beginner-friendly open source issues.

#### Mission

Provide an intuitive, accessible platform that connects new contributors with welcoming open source projects.

#### Objectives

1. Simplify GitHub issue discovery
2. Filter issues by beginner-friendliness
3. Provide AI-enhanced recommendations
4. Support multiple repository sources
5. Enable personalized search experiences

---

### 2. Governance Structure

```
┌─────────────────────────────────────────────────────────┐
│                    PROJECT OWNER                         │
│                   @ascender1729                          │
│            Strategic Direction, Final Authority          │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   TECH LEAD     │ │   MAINTAINERS   │ │   COMMUNITY     │
│  Architecture   │ │  Code Review    │ │   Engagement    │
│  Decisions      │ │  PR Merging     │ │   Support       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    CONTRIBUTORS                          │
│              Feature Development, Bug Fixes              │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Decision Making

#### Decision Categories

| Category      | Authority     | Process                         |
| ------------- | ------------- | ------------------------------- |
| Strategic     | Project Owner | Proposal + Stakeholder input    |
| Architectural | Tech Lead     | RFC + Review period             |
| Tactical      | Maintainers   | Discussion + Consensus          |
| Operational   | Contributors  | Self-directed within guidelines |

#### Decision Process

1. **Proposal**: Submit idea via GitHub Issue or Discussion
2. **Discussion**: Community feedback period (3-7 days)
3. **Review**: Technical assessment by appropriate authority
4. **Decision**: Authority makes final call
5. **Communication**: Decision documented and announced

#### Voting (when needed)

- Simple majority for minor decisions
- 2/3 majority for significant changes
- Unanimous for breaking changes

---

### 4. Roles and Responsibilities

#### Project Owner

- Set strategic direction
- Final authority on disputes
- Stakeholder management
- Resource allocation
- Release approval

#### Tech Lead

- Technical architecture decisions
- Code quality standards
- Technology selection
- Performance oversight
- Security responsibility

#### Maintainers

- Code review and approval
- PR merging
- Issue triage
- Community support
- Documentation oversight

#### Contributors

- Feature implementation
- Bug fixes
- Documentation improvements
- Testing
- Community participation

---

### 5. Contribution Path

```
Contributor → Regular Contributor → Maintainer → Tech Lead
     ↓              ↓                   ↓            ↓
  First PR      5+ PRs merged      Invited by    Appointed by
              + Active engagement   Owner        Owner
```

#### Becoming a Maintainer

1. Consistent, quality contributions (minimum 5 merged PRs)
2. Active community participation
3. Demonstrated understanding of project goals
4. Invitation from Project Owner

---

### 6. Conflict Resolution

#### Process

1. **Discussion**: Parties discuss directly
2. **Mediation**: Maintainer mediates
3. **Escalation**: Tech Lead reviews
4. **Final Decision**: Project Owner decides

#### Code of Conduct Violations

- See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Report to project owner
- Investigation within 48 hours
- Resolution within 7 days

---

### 7. Change Control

All significant changes require:

1. GitHub Issue documenting the change
2. Discussion period for community input
3. Technical review
4. Approval from appropriate authority
5. Documentation update

See [CHANGE_MANAGEMENT.md](./CHANGE_MANAGEMENT.md) for detailed process.

---

### 8. Communication Channels

| Channel            | Purpose                       | Authority    |
| ------------------ | ----------------------------- | ------------ |
| GitHub Issues      | Bug reports, feature requests | All          |
| GitHub Discussions | Q&A, ideas, announcements     | All          |
| Pull Requests      | Code contributions            | All          |
| Project Board      | Task tracking                 | Maintainers+ |

---

### 9. Transparency

We commit to:

- Public roadmap (GitHub Projects)
- Open decision-making discussions
- Documented processes
- Accessible contribution guidelines
- Clear communication

---

### 10. Amendment Process

This governance document may be amended by:

1. Proposal via GitHub Issue
2. 14-day discussion period
3. Tech Lead review
4. Project Owner approval
5. Community announcement

---

### 11. License

IssueVista is licensed under the MIT License. All contributions must be compatible with this license.

---

_Document Version: 1.0_
_Last Updated: December 26, 2025_
_Compliant with: ISO 21502:2020 Section 5_
