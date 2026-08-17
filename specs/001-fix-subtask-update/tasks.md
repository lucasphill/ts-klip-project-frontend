# Tasks: Fix Subtask Update

**Input**: Design documents from `/specs/001-fix-subtask-update/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [task-update contract](./contracts/task-update.md), and
[quickstart.md](./quickstart.md)

**Tests**: No automated test runner is configured and TDD was not requested. Validation tasks use
the existing lint and build commands plus the browser workflow required by the constitution.

**Organization**: Tasks are grouped by user story so that each story can be implemented and
validated as an increment.

## Phase 1: Setup

**Purpose**: Prepare the authenticated project scenario needed to verify the update contract.

- [X] T001 Prepare the Parent A / Child B project scenario and local runtime prerequisites in `specs/001-fix-subtask-update/quickstart.md`

---

## Phase 2: Foundational

**Purpose**: Confirm the API boundary and establish the shared canonical hierarchy mapping before
changing either user flow.

**⚠️ CRITICAL**: Complete this phase before implementing User Stories 1 or 2.

- [X] T002 Capture the task update request and response, using the Chrome MCP when available, and record the accepted parent-property name and no-parent representation in `specs/001-fix-subtask-update/contracts/task-update.md`
- [X] T003 Define typed incoming task aliases and create a canonical task normalizer plus update-payload mapper in `src/types/apiTypes.ts` and `src/lib/taskPayload.ts`

**Checkpoint**: The project has one confirmed API contract and one canonical `parentTaskId` mapping.

---

## Phase 3: User Story 1 - Save a Task as a Subtask (Priority: P1) 🎯 MVP

**Goal**: A project member can select a valid parent and save an existing task as its subtask
without losing unrelated task data.

**Independent Test**: Edit Child B, select Parent A, save, and verify the successful update shows
Child B nested below Parent A with the selected parent ID present in the captured request.

### Implementation for User Story 1

- [X] T004 [US1] Apply the canonical task normalizer and typed update-payload mapper to project task loading, modal saves, and inline updates in `src/pages/ProjectsPage.tsx`
- [X] T005 [US1] Validate the parent selection, successful PUT payload, immediate nested display, unchanged unrelated fields, and cycle exclusion using `specs/001-fix-subtask-update/quickstart.md`

**Checkpoint**: Existing project tasks can be saved as subtasks and show the saved hierarchy in the
active project view.

---

## Phase 4: User Story 2 - Retain the Saved Hierarchy (Priority: P2)

**Goal**: The task hierarchy shown after an update is authoritative and remains visible after the
user revisits the project.

**Independent Test**: After saving Child B under Parent A, reload or revisit the project and reopen
Child B; Parent A remains selected. Then remove the parent and verify Child B returns to the root.

### Implementation for User Story 2

- [X] T006 [US2] Reconcile the active project task state with persisted data after hierarchy-save success and failure, preserving clear feedback and rollback behavior in `src/pages/ProjectsPage.tsx`
- [X] T007 [US2] Validate reload, reopen, parent removal, and failed-save recovery scenarios using `specs/001-fix-subtask-update/quickstart.md`

**Checkpoint**: The persisted hierarchy survives navigation, and failure never leaves a false local
state.

---

## Phase 5: Polish & Cross-Cutting Validation

**Purpose**: Verify quality gates and record end-to-end evidence for review.

- [X] T008 [P] Run the lint quality gate and record its result in `specs/001-fix-subtask-update/quickstart.md`
- [X] T009 [P] Run the production build quality gate and record its result in `specs/001-fix-subtask-update/quickstart.md`
- [X] T010 Run the complete browser validation, using the Chrome MCP when available, and record the successful request, refresh, and regression evidence in `specs/001-fix-subtask-update/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on T001 and blocks both user stories.
- **User Story 1 (Phase 3)**: Depends on T002 and T003; this is the MVP.
- **User Story 2 (Phase 4)**: Depends on User Story 1 because it validates persistence of the same
  saved relationship.
- **Polish (Phase 5)**: Depends on T004 through T007.

### User Story Dependencies

- **US1 (P1)**: T004 → T005. It delivers the core save-as-subtask action.
- **US2 (P2)**: T006 → T007, after US1. It adds authoritative reconciliation and persistence
  validation.

### Parallel Opportunities

- T008 and T009 can run in parallel after implementation is complete.
- No implementation tasks are marked parallel because T004 and T006 modify the same project page,
  and each validation task depends on the preceding behavior change.

## Parallel Example: Quality Gates

```text
Task: "Run lint quality gate and record result in specs/001-fix-subtask-update/quickstart.md"
Task: "Run production build quality gate and record result in specs/001-fix-subtask-update/quickstart.md"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 through T003 to verify the transport contract and add the shared mapper.
2. Complete T004 to use the mapper in the project update flow.
3. Complete T005 to validate the request and immediate hierarchy display.
4. Stop and verify the core save-as-subtask flow before starting persistence reconciliation.

### Incremental Delivery

1. Deliver US1 so users can save a selected parent relationship.
2. Deliver US2 so the relationship is reloaded from persisted data and failure is handled safely.
3. Complete cross-cutting checks and record browser evidence for review.

## Format Validation

All 10 tasks use the required checkbox, sequential task ID, applicable story label, and exact file
path format. The only parallel tasks, T008 and T009, operate independently after implementation.
