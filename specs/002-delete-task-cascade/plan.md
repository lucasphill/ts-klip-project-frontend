# Implementation Plan: Task Deletion Choice (Cascade vs Detach Subtasks)

**Branch**: `002-delete-task-cascade` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-delete-task-cascade/spec.md`

## Summary

Implement a rich, accessible confirmation dialog (`DeleteTaskModal`) that replaces browser-native `window.confirm` across task views (`HomePage.tsx`, `ProjectsPage.tsx`, `MonthViewPage.tsx`). When deleting a task that has child subtasks, the modal allows the user to choose between cascade deletion (`DELETE /Tasks/{id}?cascade=true`) and detaching subtasks as standalone tasks (`DELETE /Tasks/{id}?cascade=false`). For simple tasks without subtasks, a streamlined confirmation dialog is presented.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19  
**Primary Dependencies**: React Router 7, Axios, Radix UI Dialog primitives, Lucide React, TailwindCSS, Sonner  
**Storage**: React Context (`TasksContext`), local component state, REST API backend (ASP.NET Core)  
**Testing**: Typecheck (`tsc`), Vite build (`npm run build`), ESLint (`npm run lint`), Chrome MCP / browser testing  
**Target Platform**: Web browsers (desktop and mobile)  
**Project Type**: Single-page Web Application (React + Vite + TypeScript)  
**Performance Goals**: Sub-50ms modal opening time, optimistic state updates upon deletion  
**Constraints**: Zero regression on existing task management flows, accessible dialog patterns compliant with Klip Frontend Constitution  
**Scale/Scope**: Impacts task deletion across Home, Projects, and Month views  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Type-Safe, Maintainable Frontend**: Full TypeScript domain types for deletion targets, options, and props (`DeleteTaskTarget`, `DeleteTaskModalProps`).
- [x] **II. Accessible and Consistent User Experience**: Uses Radix UI Dialog primitive with proper keyboard focus trapping, Esc handling, aria attributes, and brand Tailwind design tokens.
- [x] **III. Reliable Authentication and Data Boundaries**: Communicates with backend exclusively via `tasksApi.remove` in `src/services/api.ts` through authenticated Axios client.
- [x] **IV. Verified Behavior Before Merge**: Verified via `npm run lint`, `npm run build`, and browser testing.
- [x] **V. Simple, Performant State and UI**: Centralized modal component, minimal re-renders, optimistic local state updates.

## Project Structure

### Documentation (this feature)

```text
specs/002-delete-task-cascade/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── tasks-api.contract.md
│   └── delete-task-dialog.contract.md
└── checklists/
    └── requirements.md
```

### Source Code Layout

```text
src/
├── components/
│   ├── DeleteTaskModal.tsx      # [NEW] Reusable deletion dialog component
│   ├── TaskTable.tsx            # Updated delete trigger integration
│   └── ui/dialog.tsx            # Radix UI dialog primitive (reused)
├── services/
│   └── api.ts                   # Updated tasksApi.remove(taskId, cascade)
├── pages/
│   ├── HomePage.tsx             # Integrated DeleteTaskModal & cascade/detach logic
│   ├── ProjectsPage.tsx         # Integrated DeleteTaskModal & cascade/detach logic
│   └── MonthViewPage.tsx        # Integrated DeleteTaskModal & cascade/detach logic
└── contexts/
    └── TasksContext.tsx         # Context helpers for removing tasks/updating parents
```

**Structure Decision**: Single React web application. Reusable `DeleteTaskModal` component placed in `src/components/`, integrated into page views with updated `tasksApi.remove` parameter support in `src/services/api.ts`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| *None* | N/A | N/A |
