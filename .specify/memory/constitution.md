<!--
Sync Impact Report
- Version change: 1.1.0 → 1.1.1
- Modified principles: IV. Verified Behavior Before Merge (clarified browser-testing tools).
- Added sections: none.
- Removed sections: none.
- Follow-up TODOs: none.
-->
# Klip Frontend Constitution

## Core Principles

### I. Type-Safe, Maintainable Frontend
All application code MUST use TypeScript with clear domain types. Components, hooks, contexts,
and services MUST have a focused responsibility, and shared UI primitives MUST be reused instead
of duplicated. Type safety prevents data-shape mistakes and keeps the task-management domain
maintainable as it evolves.

### II. Accessible and Consistent User Experience
Every user-facing change MUST work with keyboard navigation, meaningful labels, and sufficient
visual feedback for loading, errors, and asynchronous actions. Interfaces MUST use the established
TailwindCSS and shadcn/ui patterns, including the supported light and dark themes. Consistency and
accessibility make the application usable for all users and reduce avoidable interface complexity.

### III. Reliable Authentication and Data Boundaries
Authenticated routes and API calls MUST preserve the Auth0 authentication flow and MUST NOT expose
credentials, tokens, or private user data in source code, logs, or browser storage beyond the
existing approved integration. API interactions MUST be centralized through the configured service
layer and handle failures visibly. This protects user data and keeps integration behavior predictable.

### IV. Verified Behavior Before Merge
Changes to business behavior MUST include proportionate automated verification: unit tests for
isolated logic when a test setup exists, and build, type-check, and lint checks for every change.
Changes to user workflows, state management, routing, or API contracts MUST be manually exercised
before merge when automated coverage is unavailable. Verification prevents regressions in core
project and task workflows. When browser testing is available in the environment, user-facing
changes MUST also be tested through the browser before merge, with the validated workflow recorded
in the pull request or change description. The Chrome MCP is an approved way to perform these
browser tests when it is available in the environment.

### V. Simple, Performant State and UI
Features MUST prefer the smallest solution that fits the current requirement. State MUST live in
the narrowest practical scope, with existing contexts used only for genuinely shared application
state. Rendering work, network calls, and browser persistence MUST avoid unnecessary repetition.
This protects responsiveness and avoids premature abstractions.

## Engineering Constraints

The frontend MUST remain compatible with React 19, TypeScript, Vite, React Router, Auth0,
TailwindCSS, and shadcn/ui as configured by the project. New dependencies require a documented
need and MUST not duplicate an existing capability. Environment-specific values and secrets MUST be
provided through configuration, never committed to the repository.

## Development Workflow

Each change MUST define its user-visible or technical intent before implementation. Pull requests
MUST be focused, describe relevant behavior changes, and identify any routing, API, authentication,
or persistent-storage impact. Reviewers MUST check conformance with this constitution and require
evidence that applicable checks passed. Breaking UI or API-consumption changes MUST include a
migration or compatibility plan.

## Governance

This constitution supersedes conflicting informal development practices for the Klip frontend.
Amendments MUST document the motivation and impact, be reviewed with the affected change, and
update the version using semantic versioning: MAJOR for incompatible governance redefinitions,
MINOR for new or materially expanded principles, and PATCH for clarifications. Every pull request
MUST include a proportionate compliance review; unresolved exceptions require explicit approval and
recorded rationale.

**Version**: 1.1.1 | **Ratified**: 2026-08-17 | **Last Amended**: 2026-08-17
