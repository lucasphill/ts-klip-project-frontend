# Tasks: Task Deletion Choice (Cascade vs Detach Subtasks)

**Feature**: `002-delete-task-cascade`  
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Phase 1: Setup & Environment Configuration

**Purpose**: Configure local environment variables for API testing

- [X] T001 Configure `VITE_API_BASE_URL=http://localhost:5145/api` in `.env` for local testing with the running backend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API client and modal scaffolding required by all user stories

**⚠️ CRITICAL**: Must complete before user story integration begins

- [X] T002 [P] Update `tasksApi.remove` in `src/services/api.ts` to accept optional `cascade?: boolean` query parameter (`DELETE /Tasks/{id}?cascade=...`)
- [X] T003 [P] Create task deletion types (`DeleteTaskTarget`, `DeleteTaskModalProps`, `TaskDeletionStrategy`) in `src/types/taskDeletion.ts`
- [X] T004 Create base accessible `DeleteTaskModal` component scaffold with Radix UI dialog primitive in `src/components/DeleteTaskModal.tsx`

**Checkpoint**: Foundational types, API client method, and modal scaffold ready for story implementations

---

## Phase 3: User Story 1 - Delete Parent Task with All Subtasks (Cascade) (Priority: P1) 🎯 MVP

**Goal**: Allow users deleting a parent task with subtasks to choose cascade deletion, removing the parent and all child subtasks in a single action.

**Independent Test**: Delete a parent task with subtasks, select "Excluir tarefa e todas as subtarefas", verify `DELETE /Tasks/{id}?cascade=true` is sent and all tasks disappear.

### Implementation for User Story 1

- [X] T005 [US1] Implement cascade deletion option UI and selection card in `src/components/DeleteTaskModal.tsx`
- [X] T006 [US1] Integrate `DeleteTaskModal` in `src/pages/HomePage.tsx` with cascade deletion execution and optimistic removal of parent + descendants
- [X] T007 [US1] Integrate `DeleteTaskModal` in `src/pages/ProjectsPage.tsx` with cascade deletion execution and state cleanup
- [X] T008 [US1] Integrate `DeleteTaskModal` in `src/pages/MonthViewPage.tsx` with cascade deletion execution and state cleanup

**Checkpoint**: Cascade deletion workflow is fully functional and testable independently across all views

---

## Phase 4: User Story 2 - Delete Parent Task and Keep Subtasks (Detach / Standalone) (Priority: P1)

**Goal**: Allow users deleting a parent task to choose to keep subtasks as standalone tasks, removing only the parent and unlinking children.

**Independent Test**: Delete a parent task with subtasks, select "Excluir apenas o pai e manter subtarefas", verify `DELETE /Tasks/{id}?cascade=false` is sent and child tasks remain visible as standalone tasks.

### Implementation for User Story 2

- [X] T009 [US2] Implement detach/keep subtasks option UI and selection card in `src/components/DeleteTaskModal.tsx`
- [X] T010 [US2] Update local state handling in `src/pages/HomePage.tsx` to unparent and retain child tasks when `cascade=false` is executed
- [X] T011 [US2] Update local state handling in `src/pages/ProjectsPage.tsx` to unparent and retain child tasks when `cascade=false` is executed
- [X] T012 [US2] Update local state handling in `src/pages/MonthViewPage.tsx` to unparent and retain child tasks when `cascade=false` is executed

**Checkpoint**: Detach deletion workflow is functional and testable without losing child subtasks

---

## Phase 5: User Story 3 - Delete Simple Task Without Subtasks (Priority: P2)

**Goal**: Present a streamlined delete confirmation for tasks without subtasks without unnecessary cascade toggles.

**Independent Test**: Click delete on a task with 0 subtasks, verify modal renders simple confirmation and confirms deletion with single click.

### Implementation for User Story 3

- [X] T013 [US3] Implement simple task confirmation layout (single description, no subtask option cards) in `src/components/DeleteTaskModal.tsx`
- [X] T014 [US3] Ensure `HomePage.tsx`, `ProjectsPage.tsx`, and `MonthViewPage.tsx` pass `subtaskCount: 0` for simple tasks and execute standard delete

**Checkpoint**: Simple tasks delete cleanly without redundant hierarchy options

---

## Phase 6: User Story 4 - Cancel Task Deletion (Priority: P3)

**Goal**: Ensure cancellation cleanly dismisses the modal without deleting data or triggering network requests.

**Independent Test**: Open the deletion modal, click "Cancelar" or press `Escape`, verify modal closes with zero changes.

### Implementation for User Story 4

- [X] T015 [US4] Implement keyboard accessibility (`Escape`), backdrop click dismiss, and Cancel button handler in `src/components/DeleteTaskModal.tsx`

**Checkpoint**: Deletion can be safely cancelled at any point

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: UX polish, loading indicators, and quality gate verifications

- [X] T016 [P] Add loading spinner state and disable action buttons during deletion in `src/components/DeleteTaskModal.tsx`
- [X] T017 Run linter verification `npm run lint`
- [X] T018 Run build verification `npm run build`
- [X] T019 Perform browser verification of task deletion flows against API on `http://localhost:5145`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
  - User Story 1 (P1): Can start after Phase 2.
  - User Story 2 (P1): Can start after Phase 2 (or build directly onto DeleteTaskModal with US1).
  - User Story 3 (P2): Can start after Phase 2.
  - User Story 4 (P3): Can start after Phase 2.
- **Polish (Phase 7)**: Depends on all user stories being implemented.

### Parallel Opportunities

- `T002` (API service) and `T003` (types) can run in parallel.
- `T006`, `T007`, `T008` (page integrations) can proceed in parallel once `DeleteTaskModal` is ready.
- `T016` (loading state polish) and `T017` (linting) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup (`.env` configured for `http://localhost:5145/api`).
2. Complete Phase 2: Foundational (API method and modal scaffold).
3. Complete Phase 3: User Story 1 (Cascade deletion).
4. **Validate**: Test cascade deletion end-to-end.

### Incremental Delivery
1. Add User Story 2 (Detach/Keep subtasks option).
2. Add User Story 3 (Simple task confirmation).
3. Add User Story 4 (Cancel/Escape dismiss).
4. Polish (Loading indicators, lint, build, browser test).
