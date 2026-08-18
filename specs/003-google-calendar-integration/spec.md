# Feature Specification: Google Calendar Integration & Collapsible Integrations UI

**Feature Directory**: `specs/003-google-calendar-integration`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "verifique na api que está em execucção em http://localhost:5145/scalar que agora temos integração com google calendar disponivel. faça a implementação dessa feature pelo frontend nas opções settings do menu de integrações, adicione um collapsable para mcp e adicione um novo para google calendar. faça testes locais primeiro e valide ao final utilizando mcp do chrome"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Collapsible Sections for Integrations (Priority: P1)

As a user configuring integrations in settings, I want the Integrations page to organize distinct services (MCP Servers, Google Calendar) into dedicated collapsible panels so that I can focus on one integration without being overwhelmed by cluttered configuration interfaces.

**Why this priority**: It establishes the organized structural layout for existing MCP keys and the new Google Calendar integration, allowing seamless expansion for future integrations.

**Independent Test**: Navigate to the Integrations Settings page, observe two separate collapsible cards/panels (MCP Servers and Google Calendar), and verify expanding/collapsing each section functions smoothly.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Integrations settings page, **When** the page loads, **Then** both "MCP Servers" and "Google Calendar" sections are visible as structured collapsible panels.
2. **Given** a collapsible integration section is open, **When** the user clicks its header/toggle, **Then** the section collapses, hiding its contents while preserving state.
3. **Given** a collapsed integration section, **When** the user clicks its header/toggle, **Then** the section expands and displays its controls and status.

---

### User Story 2 - Google Calendar Connection Status and Linking (Priority: P1)

As a user who wants to sync tasks with Google Calendar, I want to see whether my Google account is currently connected, and if not, be able to start the Google authorization flow to connect it.

**Why this priority**: Connecting the user's Google Calendar is the primary functional requirement of the integration.

**Independent Test**: In the Google Calendar section, when disconnected, click "Conectar Google Calendar". The system initiates the authorization process and updates the status to connected once authorized.

**Acceptance Scenarios**:

1. **Given** the user does not have Google Calendar connected, **When** they expand the Google Calendar integration panel, **Then** they see a "Disconnected" state, a clear description of the sync feature, and a "Conectar Google Calendar" action button.
2. **Given** the user clicks "Conectar Google Calendar", **When** authorization URL is generated, **Then** the user is directed to the Google consent screen to grant calendar permissions.
3. **Given** the user completes Google authentication and is redirected back to the application with callback parameters, **When** the callback is processed, **Then** the UI displays a success confirmation and updates status to "Connected".

---

### User Story 3 - View Connected Account Details and Disconnect (Priority: P2)

As a connected user, I want to see which Google account is linked and when it was connected, and have the ability to disconnect the integration whenever I wish.

**Why this priority**: Provides transparency, security, and user control over their third-party account linkages.

**Independent Test**: When Google Calendar is connected, the account email and connection date are visible, and clicking "Desconectar" prompts confirmation and removes the integration.

**Acceptance Scenarios**:

1. **Given** the user has an active Google Calendar integration, **When** they view the Google Calendar panel, **Then** they see a "Connected" badge, the linked email address, and the connection timestamp.
2. **Given** an active connection, **When** the user clicks "Desconectar" and confirms the action, **Then** the integration is unlinked, status returns to "Disconnected", and a success message is displayed.

---

### Edge Cases

- **OAuth Callback Failure or User Cancellation**: What happens when the user cancels the Google consent prompt or an error query parameter is returned? The app displays an informative error notification and keeps the status disconnected without crashing.
- **API Network Error / Backend Unavailable**: How does the system handle temporary unavailability when fetching integration status? The UI shows a friendly fallback state with a retry option without blocking other settings tabs.
- **Concurrent Session / Token Revocation**: How does the system behave if the Google token is revoked outside the app? When the status endpoint reports disconnected, the UI gracefully resets to the disconnected prompt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Integrations settings page MUST organize integration providers into collapsible panels, including MCP Servers and Google Calendar.
- **FR-002**: The MCP Servers panel MUST contain existing API Key management, key creation, and configuration guidance.
- **FR-003**: The Google Calendar panel MUST display current connection status (`isConnected`, `accountEmail`, `connectedAtUtc`).
- **FR-004**: When disconnected, the Google Calendar panel MUST provide a button to initiate the OAuth connection flow.
- **FR-005**: The application MUST handle the Google OAuth callback redirect parameters (`code`, `state`, `error`) and finalize authentication.
- **FR-006**: When connected, the Google Calendar panel MUST allow the user to disconnect the integration with confirmation.
- **FR-007**: The system MUST show appropriate loading indicators during status fetching, authorization redirect preparation, and disconnect actions.

### Key Entities

- **Integration Provider**: Represents a service provider (e.g. MCP Server, Google Calendar) with title, icon, summary, and collapsible state.
- **Google Calendar Status**: Represents the connection state for the authenticated user, containing `isConnected` (boolean), `accountEmail` (string or null), and `connectedAtUtc` (timestamp or null).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their Google Calendar connection status and initiate connection in under 2 clicks from the Integrations tab.
- **SC-002**: 100% of OAuth callbacks (success or cancellation) provide clear, immediate visual feedback to the user without broken states.
- **SC-003**: Collapsible panels toggle instantly (<100ms visual response) and retain clean readability on both desktop and mobile screens.
- **SC-004**: Disconnecting Google Calendar takes immediate effect and updates the UI state without requiring a full manual page refresh.

## Assumptions

- The backend API running at `http://localhost:5145` provides the integration endpoints (`/api/Integrations/GoogleCalendar/auth-url`, `/api/Integrations/GoogleCalendar/callback`, `/api/Integrations/GoogleCalendar/status`, and `DELETE /api/Integrations/GoogleCalendar`).
- The user is already authenticated in the Klip web application before accessing Settings > Integrations.
- Google Calendar sync logic and background processing are handled server-side once the OAuth token is linked.
