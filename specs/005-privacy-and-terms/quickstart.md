# Quickstart & Validation Guide: Public Privacy Policy & Terms of Service

**Feature**: `005-privacy-and-terms`
**Date**: 2026-08-23

## Prerequisites

- Frontend development server running or built (`npm run dev` or `npm run build && npm run preview`).
- Chrome browser or Chrome DevTools MCP available for automated verification.

---

## Validation Scenarios

### Scenario 1: Unauthenticated Direct Access to Privacy Policy

1. **Setup**: Open an incognito / private browser window (unauthenticated).
2. **Action**: Navigate to `http://localhost:5173/privacy` (or preview port).
3. **Expected Outcome**:
   - Page loads instantly without redirecting to Auth0 login.
   - Header shows Klip logo, theme toggle, and "Voltar ao Início" button.
   - Body contains full Privacy Policy text, developer identity, contact email, and the Google Limited Use clause.
   - Clicking "Voltar ao Início" navigates to `/` (Landing Page).

### Scenario 2: Unauthenticated Direct Access to Terms of Service

1. **Setup**: Unauthenticated incognito browser window.
2. **Action**: Navigate to `http://localhost:5173/terms`.
3. **Expected Outcome**:
   - Page loads instantly without auth challenge.
   - Terms of Service text with indie project disclaimer ("as-is", non-commercial) is clearly visible.
   - Theme toggle shifts cleanly between dark and light modes.

### Scenario 3: Route Aliases Redirection

1. **Setup**: Unauthenticated browser window.
2. **Action**: Navigate to each alias:
   - `http://localhost:5173/politica-de-privacidade` -> Redirects to `/privacy`.
   - `http://localhost:5173/privacy-policy` -> Redirects to `/privacy`.
   - `http://localhost:5173/termos-de-uso` -> Redirects to `/terms`.
   - `http://localhost:5173/terms-of-service` -> Redirects to `/terms`.
3. **Expected Outcome**: All aliases immediately resolve to canonical pages without 404 or login redirect.

### Scenario 4: Authenticated Access and Navigation Flow

1. **Setup**: Log in to Klip (using test credentials `teste@email.com`).
2. **Action**: Navigate to `http://localhost:5173/privacy` from within the application or via direct URL.
3. **Expected Outcome**:
   - Legal document loads cleanly.
   - Header displays "Voltar ao Dashboard".
   - Clicking "Voltar ao Dashboard" returns directly to the authenticated task inbox (`/`) with session intact.

### Scenario 5: Footer & Google Calendar Consent Links

1. **Action**: View Footer on Landing Page and authenticated dashboard.
2. **Expected Outcome**: Footer contains "Termos de Uso" and "Política de Privacidade" links.
3. **Action**: Go to *Configurações > Integrações > Google Calendar*.
4. **Expected Outcome**: Notice text includes direct links to `/terms` and `/privacy`.
