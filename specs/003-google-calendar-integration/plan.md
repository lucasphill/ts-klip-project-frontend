# Implementation Plan: Google Calendar Integration & Collapsible Integrations UI

**Branch**: `003-google-calendar-integration` | **Date**: 2026-08-17 | **Spec**: [specs/003-google-calendar-integration/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/003-google-calendar-integration/spec.md)

**Input**: Feature specification from `specs/003-google-calendar-integration/spec.md`

## Summary

Implement Google Calendar integration and collapsible section layout within the Settings > Integrations view (`/settings/integrations`). This includes creating collapsible section components for MCP Servers and Google Calendar, connecting to backend Google Calendar OAuth endpoints (`auth-url`, `callback`, `status`, and `DELETE`), handling OAuth redirect callbacks gracefully, displaying connection state, and providing a disconnect confirmation dialog.

## Technical Context

**Language/Version**: TypeScript 5.7+ / React 19

**Primary Dependencies**: React 19, React Router 7, Axios, Lucide React, date-fns, TailwindCSS, sonner (toast)

**Storage**: Local component state, backend database persistence via REST API

**Testing**: Lint (`npm run lint`), Build (`npm run build`), MCP Chrome DevTools automated browser verification

**Target Platform**: Modern desktop and mobile web browsers

**Project Type**: Single-page web application (frontend)

**Performance Goals**: Instant collapse/expand UI transition (<100ms), non-blocking background status fetching

**Constraints**: Comply with Klip Frontend Constitution, preserve Auth0 token injection in API service, maintain responsive design with light/dark theme support

**Scale/Scope**: Settings page integration module (`SettingsIntegrationsPage.tsx`, `IntegrationsManager.tsx`, `GoogleCalendarIntegration.tsx`, `src/services/api.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Type-Safe, Maintainable Frontend**: Strong TypeScript interfaces defined for DTOs and UI component props.
- [x] **II. Accessible and Consistent User Experience**: Accessible buttons, ARIA state for collapsible sections, toast alerts, theme token support.
- [x] **III. Reliable Authentication and Data Boundaries**: All API calls use existing centralized `api.ts` with Auth0 Bearer token interceptor.
- [x] **IV. Verified Behavior Before Merge**: Verification includes `npm run lint`, `npm run build`, and browser testing with Chrome DevTools MCP.
- [x] **V. Simple, Performant State and UI**: Local state scoping without unnecessary global context overhead.

## Project Structure

### Documentation (this feature)

```text
specs/003-google-calendar-integration/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Phase 0 output ($speckit-plan command)
├── data-model.md        # Phase 1 output ($speckit-plan command)
├── quickstart.md        # Phase 1 output ($speckit-plan command)
├── contracts/           # Phase 1 output ($speckit-plan command)
│   ├── google-calendar-api.contract.md
│   └── integrations-ui.contract.md
└── tasks.md             # Phase 2 output ($speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── CollapsibleSection.tsx       # Reusable collapsible card wrapper
│   ├── GoogleCalendarIntegration.tsx # Google Calendar integration panel & actions
│   └── IntegrationsManager.tsx      # MCP Servers API key management (refactored as collapsible card)
├── pages/
│   └── SettingsIntegrationsPage.tsx # Parent integrations settings page containing the collapsible cards
├── services/
│   └── api.ts                       # Added googleCalendarApi service endpoints
└── types/
    └── apiTypes.ts                  # Added GoogleCalendar DTO types
```

**Structure Decision**: Single project layout matching established repository conventions.

## Complexity Tracking

*No constitution violations or unjustified architectural patterns.*
