# Tasks: Task Notes Markdown Rich Editor

**Feature**: Task Notes Markdown Rich Editor  
**Branch**: `015-task-notes-markdown-editor` | **Date**: 2026-08-31 | **Spec**: [spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/015-task-notes-markdown-editor/spec.md) | **Plan**: [plan.md](file:///D:/Dev/ts-klip-project-frontend/specs/015-task-notes-markdown-editor/plan.md)

---

## Phase 1: Setup (Dependencies & Infrastructure)

**Purpose**: Document required packages and obtain explicit user authorization for dependency installation per project standards.

- [x] T001 Request explicit user authorization and install Plate.js dependencies (`platejs`, `@platejs/markdown`, `@platejs/basic-nodes`) in `package.json`

---

## Phase 2: Foundational (Core Utilities & Reusable Editor)

**Purpose**: Core Markdown serialization utilities and the reusable Plate.js editor component that all user stories depend on.

**⚠️ CRITICAL**: Foundational tasks must be completed before integrating into user story components.

- [x] T002 [P] Implement Markdown serialization, deserialization, and plain text stripping utilities in `src/lib/markdown.ts`
- [x] T003 [P] Implement accessible formatting toolbar with active state toggles in `src/components/ui/markdown-editor/EditorToolbar.tsx`
- [x] T004 Implement reusable `MarkdownEditor` component with Plate.js plugins, live markdown shortcuts (`- `, `1. `, `[] `, `## `), and `Ctrl+Enter` shortcut in `src/components/ui/markdown-editor/MarkdownEditor.tsx`
- [x] T005 [P] Create barrel export for markdown editor components in `src/components/ui/markdown-editor/index.ts`

**Checkpoint**: Foundation ready — `MarkdownEditor` component and markdown utilities ready for UI integration.

---

## Phase 3: User Story 1 - Quick Note Editing & Formatting via Table Popover (Priority: P1) 🎯 MVP

**Goal**: Enable users to view, format (bullets, checklists, headings, marks, links), and edit notes directly from the task table row popover with comfortable width and instant `Ctrl+Enter` saving.

**Independent Test**: Click the notes icon on any task in `TaskTable`, type `- [ ] Test item` or use the toolbar to format text, press `Ctrl+Enter` or click "Salvar", and reopen to verify the formatted checklist and styling are preserved.

### Implementation for User Story 1

- [x] T006 [US1] Update `src/components/TaskNotePopover.tsx` popover container to wider layout (`w-[420px]`), integrating `MarkdownEditor` with `min-h-[120px]`, `max-h-[260px]`, and explicit save/cancel handlers
- [x] T007 [US1] Wire keyboard shortcut handling (`Ctrl+Enter`/`Cmd+Enter` to save, `Escape` to close) and loading state in `src/components/TaskNotePopover.tsx`
- [x] T008 [US1] Verify and ensure inline notes save propagation in `src/components/TaskTable.tsx`, `src/pages/HomePage.tsx`, `src/pages/ProjectsPage.tsx`, and `src/pages/MonthViewPage.tsx`

**Checkpoint**: At this point, User Story 1 is fully functional and delivers the core MVP capability directly in table views.

---

## Phase 4: User Story 2 - Rich Note Editing in Add/Edit Task Sheet & Modal (Priority: P2)

**Goal**: Provide the identical rich Markdown editing experience inside the Add Task / Edit Task sheet (`AddTaskModal`) when authoring or updating complete task details.

**Independent Test**: Open the Add Task modal, enter a title, type formatted notes with headings and checklists into the notes field, submit the task form, and verify the notes are correctly persisted and formatted.

### Implementation for User Story 2

- [x] T009 [US2] Replace the plain `<Textarea>` notes field with `<MarkdownEditor />` in `src/components/AddTaskModal.tsx`
- [x] T010 [US2] Ensure bidirectional form synchronization between `formData.notes` and `MarkdownEditor` in `src/components/AddTaskModal.tsx` during task creation and editing modes

**Checkpoint**: User Stories 1 AND 2 are functional, offering a unified rich notes experience across popovers and modals.

---

## Phase 5: User Story 3 - Backward Compatibility & Tooltip Sanitization (Priority: P3)

**Goal**: Guarantee existing legacy plain text notes load cleanly as paragraph blocks without data corruption, and ensure native table row hover tooltips display clean text without raw Markdown markup.

**Independent Test**: Hover over the note icon of a task with Markdown formatting to verify the tooltip displays clean text preview, and open a legacy task with multi-line plain text to verify clean paragraph rendering.

### Implementation for User Story 3

- [x] T011 [US3] Update table row note trigger button in `src/components/TaskNotePopover.tsx` to use `stripMarkdown()` for clean `title` and `aria-label` tooltips
- [x] T012 [US3] Verify backward compatibility edge cases (empty notes, whitespace-only notes, legacy multi-line strings) in `src/lib/markdown.ts` and `src/components/ui/markdown-editor/MarkdownEditor.tsx`

**Checkpoint**: All user stories are complete and fully compatible with legacy and edge-case data.

---

## Phase 6: Polish & Quality Verification

**Purpose**: Cross-cutting quality checks, theme consistency, and project standards verification.

- [x] T013 Verify light and dark mode styles for editor surface, toolbar, and checklist checkboxes
- [x] T014 Run linter check via `npm run lint` and fix any reported warnings/errors
- [x] T015 Run TypeScript build check via `npm run build` and ensure zero compilation errors
- [x] T016 Execute end-to-end validation following `specs/015-task-notes-markdown-editor/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately (requires user confirmation before npm install).
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories.
- **User Story 1 (Phase 3 - MVP)**: Depends on Phase 2 completion.
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion (can run in parallel with US1).
- **User Story 3 (Phase 5)**: Depends on Phase 2 and US1 completion.
- **Polish (Phase 6)**: Depends on all user stories being completed.

### Parallel Opportunities

- **Within Phase 2**: T002 (`markdown.ts`), T003 (`EditorToolbar.tsx`), and T005 (`index.ts`) can be developed in parallel.
- **Across User Stories**: T006/T007 (US1: Popover) and T009/T010 (US2: Modal) touch separate components and can be developed in parallel once Phase 2 is complete.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup (Phase 1) + Foundational (Phase 2).
2. Implement User Story 1 (Phase 3: `TaskNotePopover`).
3. **Validate MVP**: Test table row quick note editing and shortcut saving.

### Incremental Delivery
1. Add User Story 2 (`AddTaskModal`).
2. Add User Story 3 (Tooltip sanitization and legacy verification).
3. Run complete verification (`npm run lint`, `npm run build`, and quickstart scenarios).
