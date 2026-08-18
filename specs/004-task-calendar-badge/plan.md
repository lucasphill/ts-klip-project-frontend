# Implementation Plan: Google Calendar Synchronization Indicator on Tasks

**Branch**: `004-task-calendar-badge` | **Date**: 2026-08-17 | **Spec**: [specs/004-task-calendar-badge/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/004-task-calendar-badge/spec.md)

**Input**: Feature specification from `specs/004-task-calendar-badge/spec.md`

## Summary

Render a subtle Google Calendar synchronization indicator (amber calendar icon with tooltip) in the task table next to task titles for any task or subtask that has an active `googleCalendarEventId`.

## Technical Context

**Language/Version**: TypeScript 5.7+ / React 19

**Primary Dependencies**: React 19, Lucide React (`Calendar`), TailwindCSS

**Storage**: In-memory task state from `TasksContext` / backend API response

**Testing**: Lint (`npm run lint`), Build (`npm run build`), and Chrome DevTools MCP browser testing

**Target Platform**: Modern desktop and mobile browsers

**Project Type**: Single-page web application (frontend)

**Performance Goals**: Zero additional API overhead; instant badge rendering alongside task data

**Constraints**: Comply with Klip Frontend Constitution, preserve clean layout on mobile and table cell truncation

**Scale/Scope**: `src/types/apiTypes.ts` and `src/components/TaskTable.tsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Type-Safe, Maintainable Frontend**: `googleCalendarEventId` typed in `GetTasksDto` and `GetTasksWithCustomFieldsDto`.
- [x] **II. Accessible and Consistent User Experience**: Accessible `title` and `aria-label` tooltips, amber palette matching Google Calendar branding.
- [x] **III. Reliable Authentication and Data Boundaries**: Purely display layer based on authenticated task data.
- [x] **IV. Verified Behavior Before Merge**: Linter, build, and browser verification with Chrome MCP.
- [x] **V. Simple, Performant State and UI**: Inline conditional render without extra components or state overhead.

## Project Structure

### Documentation (this feature)

```text
specs/004-task-calendar-badge/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Phase 0 output ($speckit-plan command)
├── data-model.md        # Phase 1 output ($speckit-plan command)
├── quickstart.md        # Phase 1 output ($speckit-plan command)
├── contracts/           # Phase 1 output ($speckit-plan command)
│   └── task-sync-ui.contract.md
└── tasks.md             # Phase 2 output ($speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── TaskTable.tsx        # Render Google Calendar sync badge in task title column
└── types/
    └── apiTypes.ts          # Include googleCalendarEventId in GetTasksDto
```

**Structure Decision**: Single project layout matching established repository conventions.

## Complexity Tracking

*No constitution violations or unjustified architectural patterns.*
