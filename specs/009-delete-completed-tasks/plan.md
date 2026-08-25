# Implementation Plan: Exclusão em Lote de Tarefas Concluídas

**Branch**: `009-delete-completed-tasks` | **Date**: 2026-08-25 | **Spec**: [specs/009-delete-completed-tasks/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/009-delete-completed-tasks/spec.md)

**Input**: Feature specification from `specs/009-delete-completed-tasks/spec.md`

## Summary

Implement bulk completed tasks deletion across the user's account and within individual projects. In Settings (`SettingsProfilePage.tsx`), a Danger Zone action enables global deletion of all completed tasks. Within project pages (`ProjectsPage.tsx` / `TaskViewLayout.tsx`), a project header action enables scoped deletion of completed tasks belonging to that project. Both flows enforce safeguard confirmation by requiring the user to type `DELETAR` in a dedicated modal (`DeleteCompletedTasksModal.tsx`) before invoking the API endpoint `DELETE /api/Tasks/completed` (optionally with `?projectId=`). Upon completion, local and global task states (`TasksContext`) are updated synchronously without requiring a full page reload.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19

**Primary Dependencies**: React Router v7, `@auth0/auth0-react`, TailwindCSS 4, shadcn/ui (`Dialog`, `Button`, `Input`), `lucide-react`, `sonner`, `axios`.

**Storage**: In-memory React State & Context (`TasksContext`), synced with backend via REST API.

**Testing**: Linter (`npm run lint`), TypeScript build check (`npm run build`), and automated/manual browser verification.

**Target Platform**: Modern web browsers (desktop and mobile responsive).

**Project Type**: Single-page application (SPA frontend).

**Performance Goals**: Instant UI response; modal open < 50ms; local state reconciliation < 100ms; toast notification immediately upon API response.

**Constraints**: Accidental deletion prevented via strict typed text confirmation (`DELETAR`); concurrent double-submissions prevented via `isSubmitting` disable guard; no external dependencies added without explicit permission.

**Scale/Scope**:
- 1 new modal component (`src/components/DeleteCompletedTasksModal.tsx`)
- 1 updated service method (`tasksApi.deleteCompleted` in `src/services/api.ts`)
- 1 updated types interface (`DeleteCompletedTasksResponseDto` in `src/types/apiTypes.ts`)
- 1 updated layout component (`src/components/TaskViewLayout.tsx` for header actions slot)
- 1 updated settings page (`src/pages/SettingsProfilePage.tsx`)
- 1 updated project page (`src/pages/ProjectsPage.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Type-Safe, Maintainable Frontend)**: PASS — Strongly typed DTO (`DeleteCompletedTasksResponseDto`) and modal props (`DeleteCompletedTasksModalProps`). Centralized service method in `tasksApi`.
- **Principle II (Accessible and Consistent User Experience)**: PASS — Accessible modal dialog using shadcn/ui with keyboard navigation (`Esc` to dismiss, `Enter` to confirm), clear input focus, visible loading spinner (`Loader2`), and consistent light/dark theme variables.
- **Principle III (Reliable Authentication, Data Boundaries and Privacy)**: PASS — All requests pass through the authenticated Axios instance with Bearer token; respect user data management boundaries and project scoping.
- **Principle IV (Verified Behavior Before Merge)**: PASS — Validated with `npm run lint`, `npm run build`, and structured test scenarios in `quickstart.md`.
- **Principle V (Simple, Performant State and UI)**: PASS — State is updated locally through `removeTasksLocal` avoiding full page refreshes; modal state is locally scoped.

## Project Structure

### Documentation (this feature)

```text
specs/009-delete-completed-tasks/
├── plan.md              # This file ($speckit-plan output)
├── research.md          # Technical decisions and design choices
├── data-model.md        # State transitions, interfaces, and sequence diagrams
├── quickstart.md        # Step-by-step verification guide
├── contracts/           # API contract documentation
│   └── delete-completed-tasks.contract.md
└── checklists/          # Requirements validation checklists
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── DeleteCompletedTasksModal.tsx  # New modal with DELETAR typed confirmation
│   └── TaskViewLayout.tsx             # Extended header actions support
├── pages/
│   ├── SettingsProfilePage.tsx        # Danger zone action for global delete
│   └── ProjectsPage.tsx               # Project header action for project cleanup
├── services/
│   └── api.ts                         # tasksApi.deleteCompleted(projectId?)
└── types/
    └── apiTypes.ts                    # DeleteCompletedTasksResponseDto
```

**Structure Decision**: Reuses established components pattern and centralized API client.

## Complexity Tracking

*No violations. Design strictly adheres to constitution principles.*
