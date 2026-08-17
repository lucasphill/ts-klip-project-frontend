# Implementation Plan: Fix Subtask Update

**Branch**: `001-fix-subtask-update` | **Date**: 2026-08-17 | **Spec**:
[spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-fix-subtask-update/spec.md`

## Summary

Ensure that updating a project task reliably preserves its selected parent-task relationship.
The frontend will establish one canonical task hierarchy field at the API boundary, serialize that
field explicitly in update payloads, and reconcile the project view with persisted data after a
successful hierarchy update. The implementation will validate the live request and response
contract before finalizing the mapper, then verify the complete flow in the browser when available.

## Technical Context

**Language/Version**: TypeScript 5.9

**Primary Dependencies**: React 19, React Router 7, Axios, TailwindCSS, shadcn/ui, Sonner

**Storage**: Remote authenticated task and project API; no frontend database

**Testing**: ESLint, production build, and manual browser validation; use the Chrome MCP to inspect
the update request and exercise the user flow when it is available

**Target Platform**: Modern desktop web browsers

**Project Type**: Single-page web application

**Performance Goals**: Saving a hierarchy change gives a clear success or error result without
blocking unrelated interactions; the refreshed project view shows the persisted hierarchy promptly
after saving.

**Constraints**: Preserve Auth0-authenticated API access, use the existing API service layer, keep
the parent-selection controls accessible, avoid exposing task data in logs, and run lint and build
before merge.

**Scale/Scope**: One project-task update flow and its hierarchy display, including edit, refresh,
error recovery, and parent removal behavior; creation and unrelated task flows remain unchanged.

## Constitution Check

*GATE: Passed before Phase 0 research and re-checked after Phase 1 design.*

- **Type-safe, maintainable frontend**: PASS. Define one typed, canonical parent relationship at
  the API boundary rather than scatter aliases and casts across the project page.
- **Accessible, consistent UX**: PASS. Retain the existing parent selector and success/error
  feedback, and ensure the visible hierarchy reflects the saved result.
- **Authentication and data boundaries**: PASS. Continue to use the authenticated task API service;
  do not introduce credentials or direct network calls from UI components.
- **Verified behavior before merge**: PASS. Run lint and build; when available, validate the edit,
  request, reload, removal, and failure paths through the browser using the Chrome MCP.
- **Simple, performant state and UI**: PASS. Limit changes to task normalization, payload creation,
  and reconciliation of the affected project view; avoid new global state or dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-subtask-update/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── task-update.md
└── tasks.md                 # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── AddTaskModal.tsx     # Parent selection and submission
│   └── TaskTable.tsx        # Hierarchy rendering
├── lib/
│   └── taskHierarchy.ts     # Hierarchy normalization and cycle prevention
├── pages/
│   └── ProjectsPage.tsx     # Project task loading, update, and reconciliation
├── services/
│   └── api.ts               # Authenticated task update service
└── types/
    └── apiTypes.ts          # Task request and response contracts
```

**Structure Decision**: Keep the fix within the existing single frontend application. Reuse the
current task hierarchy utility and API service, adding a small shared normalizer or payload helper
only if it removes duplicated parent-field handling in the affected flow.

## Complexity Tracking

No constitution violations or additional complexity require justification.
