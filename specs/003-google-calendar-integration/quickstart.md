# Quickstart & Validation Guide: Google Calendar Integration

**Feature**: `specs/003-google-calendar-integration`
**Date**: 2026-08-17

## Prerequisites

1. Frontend running on `http://localhost:5173`.
2. Backend running on `http://localhost:5145`.
3. Valid authentication session (use test account `teste@email.com` / `o#mUN9WMKps7rtCGclNu`).

---

## Validation Scenarios

### Scenario 1: Collapsible UI Panels Validation

1. Navigate to `http://localhost:5173/settings/integrations`.
2. Verify two distinct collapsible cards appear:
   - **MCP Servers**
   - **Google Calendar**
3. Click the toggle on the **MCP Servers** card: verify its contents collapse. Click again: verify its contents expand.
4. Click the toggle on the **Google Calendar** card: verify its contents collapse and expand.

### Scenario 2: Google Calendar Status Display (Disconnected)

1. With no account connected, expand the **Google Calendar** card.
2. Confirm the status badge displays "Desconectado" or similar neutral badge.
3. Confirm the "Conectar Google Calendar" button is enabled.

### Scenario 3: Google Calendar Connect Flow Trigger

1. Click "Conectar Google Calendar".
2. Verify the frontend requests `GET /api/Integrations/GoogleCalendar/auth-url` and redirects to Google OAuth consent URL.

### Scenario 4: Google Calendar Callback & Connected State

1. If redirected back to `http://localhost:5173/settings/integrations?code=...`:
2. Verify the callback is processed and status refreshes to "Conectado".
3. Verify the connected email address and formatted connection date are displayed.

### Scenario 5: Disconnect Modal and Action

1. With Google Calendar connected, click "Desconectar".
2. Verify confirmation dialog appears with cancel and confirm buttons.
3. Click confirm: verify `DELETE /api/Integrations/GoogleCalendar` is sent and UI updates to "Desconectado".

---

## Chrome MCP DevTools Automation

Use the `chrome-devtools` MCP server to navigate to `http://localhost:5173/settings/integrations`, inspect DOM snapshots, toggle collapsibles, and confirm visual layout.
