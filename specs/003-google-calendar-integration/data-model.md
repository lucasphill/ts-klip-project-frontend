# Data Model: Google Calendar Integration & Collapsible Integrations UI

**Feature**: `specs/003-google-calendar-integration`
**Date**: 2026-08-17

## Entities & Interfaces

### 1. GoogleCalendarStatusDto

Represents the user's connection status with Google Calendar returned by the backend.

```typescript
export interface GoogleCalendarStatusDto {
  isConnected: boolean;
  accountEmail: string | null;
  connectedAtUtc: string | null;
}
```

- **Validation Rules**:
  - `isConnected` is required (boolean).
  - When `isConnected` is `true`, `accountEmail` is a non-empty string and `connectedAtUtc` is an ISO-8601 UTC timestamp.
  - When `isConnected` is `false`, `accountEmail` and `connectedAtUtc` are `null` or `undefined`.

---

### 2. GoogleAuthUrlResponseDto

Represents the authentication redirect URL response payload from the backend.

```typescript
export interface GoogleAuthUrlResponseDto {
  authUrl: string;
}
```

- **Validation Rules**:
  - `authUrl` MUST be a valid absolute HTTPS URL string pointing to Google's OAuth 2.0 endpoint (`https://accounts.google.com/...`).

---

### 3. IntegrationCollapsibleSection

UI view-state model for collapsible integration cards.

```typescript
export interface IntegrationCollapsibleSectionState {
  isMcpOpen: boolean;
  isGoogleCalendarOpen: boolean;
}
```

- **Default State**:
  - Both sections open by default or persisted in local state for convenient access.

---

### 4. GoogleCalendarState

State management within `GoogleCalendarIntegrationCard` or parent view.

```typescript
export interface GoogleCalendarState {
  status: GoogleCalendarStatusDto | null;
  loading: boolean;
  actionLoading: boolean; // Connecting or Disconnecting in progress
  error: string | null;
  isDisconnectModalOpen: boolean;
}
```

- **State Transitions**:
  1. `Initial` -> `Loading Status` -> `Status Loaded` (`Connected` | `Disconnected`)
  2. `Disconnected` -> Click "Conectar" -> `Action Loading` -> Redirect to `authUrl`
  3. OAuth Redirect Return (`/settings/integrations?code=...`) -> `Processing Callback` -> `Status Loaded (Connected)` -> Show success toast -> Clean URL
  4. `Connected` -> Click "Desconectar" -> Open Confirm Dialog -> Confirm -> `Action Loading` -> `Status Loaded (Disconnected)` -> Show success toast
