# Research: Google Calendar Integration & Collapsible Integrations UI

**Feature**: `specs/003-google-calendar-integration`
**Date**: 2026-08-17

## Technical Context & Decisions

### 1. Collapsible UI Pattern for Integrations

- **Decision**: Implement a reusable collapsible panel card pattern for the Integrations page using existing Lucide icons (`ChevronDown`, `ChevronUp` / `ChevronRight`), TailwindCSS transition states, and accessible button headers.
- **Rationale**: The project uses TailwindCSS and shadcn/ui. Collapsible cards keep each integration isolated, manageable, and uncluttered.
- **Alternatives Considered**:
  - *Tabs*: Switching between tabs hides the overview of available integrations.
  - *Third-party accordion libraries*: Adds unnecessary dependencies; a clean, controlled/uncontrolled state component with TailwindCSS satisfies Principle V (Simple, Performant State and UI).

### 2. Google Calendar API Endpoints & Contract

- **Decision**: Integrate with the 4 backend endpoints mapped at `http://localhost:5145`:
  1. `GET /api/Integrations/GoogleCalendar/auth-url` -> Returns `{ data: { authUrl: string } }`
  2. `GET /api/Integrations/GoogleCalendar/status` -> Returns `{ data: { isConnected: boolean, accountEmail?: string | null, connectedAtUtc?: string | null } }`
  3. `DELETE /api/Integrations/GoogleCalendar` -> Unlinks the account and returns `{ data: boolean }`
  4. `GET /api/Integrations/GoogleCalendar/callback?code=...&state=...` -> Finalizes OAuth exchange (used when redirected back or routed to callback handler).
- **Rationale**: Uses standard Klip backend service pattern with `integrationsApi` service module in `src/services/api.ts`.
- **Alternatives Considered**:
  - *Direct Google client-side OAuth*: Rejected because backend manages secure token storage, refresh token handling, and background task synchronization.

### 3. OAuth Flow & Callback Handling

- **Decision**:
  - When user clicks "Conectar Google Calendar", call `integrationsApi.getGoogleCalendarAuthUrl()`, then redirect `window.location.href = authUrl`.
  - The redirect URI registered in Google / backend returns the user back to the application (either `/settings/integrations` with query params `?code=...` or `/integrations/google-calendar/callback`).
  - Upon loading `/settings/integrations`, check for `code` or `error` query params in URL:
    - If `error` is present: Display `toast.error` explaining that connection was cancelled or failed, and clean URL params via React Router `navigate` / `useSearchParams`.
    - If `code` is present: Call `integrationsApi.handleGoogleCalendarCallback(code, state)` or refresh status with `integrationsApi.getGoogleCalendarStatus()`, display `toast.success`, and clean URL query params.
- **Rationale**: Smooth, robust UX that handles both direct callback redirect and page reloads without lingering query params.

### 4. Disconnect Confirmation Flow

- **Decision**: Use a confirmation dialog/modal before executing the disconnect API call.
- **Rationale**: Prevents accidental disconnection and loss of calendar sync.
- **Alternatives Considered**: Immediate deletion on button click - rejected for safety and user experience.

### 5. UI Organization & Coexistence with MCP Servers

- **Decision**: Restructure `IntegrationsManager.tsx` (or compose into `McpServerIntegrationCard` and `GoogleCalendarIntegrationCard`) wrapped under collapsible cards in `SettingsIntegrationsPage.tsx`.
- **Rationale**: Keeps existing MCP API Key functionality 100% intact while presenting a cohesive, organized integrations hub.
