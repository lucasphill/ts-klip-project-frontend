# Implementation Plan: Self-Service Account Deletion with Text Confirmation

**Branch**: `006-account-deletion` | **Date**: 2026-08-23 | **Spec**: [specs/006-account-deletion/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/006-account-deletion/spec.md)

**Input**: Feature specification from `specs/006-account-deletion/spec.md`

## Summary

Implement a secure self-service account deletion flow on the Profile Settings page (`SettingsProfilePage.tsx`). A dedicated "Zona de Perigo" (Danger Zone) card provides access to a destructive action modal (`DeleteAccountModal.tsx`) requiring the user to explicitly type a confirmation phrase (`DELETAR`) before enabling the deletion button. When confirmed, the frontend invokes `DELETE /api/Users/me` via `usersApi`, displays a success toast, clears local session state, and invokes Auth0 `logout()` with redirection to `/`.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19

**Primary Dependencies**: React Router v7, `@auth0/auth0-react`, TailwindCSS 4, shadcn/ui (`Dialog`, `Button`, `Input`), `lucide-react`, `sonner`, `axios`.

**Storage**: Auth0 session cookie + Browser `localStorage` (cleaned upon logout).

**Testing**: Linter (`npm run lint`), TypeScript build check (`npm run build`), and automated/manual browser verification.

**Target Platform**: Modern web browsers (desktop and mobile responsive).

**Project Type**: Single-page application (SPA frontend).

**Performance Goals**: Instant UI responsiveness; modal render < 50ms; deletion & session termination completed in < 2s.

**Constraints**: Must prevent accidental deletion through typed text validation; must handle API errors without unexpected logout.

**Scale/Scope**: 1 new modal component (`DeleteAccountModal.tsx`), 1 updated page (`SettingsProfilePage.tsx`), 1 new service method in `api.ts`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Type-Safe, Maintainable Frontend)**: PASS — Strongly typed props (`DeleteAccountModalProps`) and API response types (`ResponseModelDto<boolean>`).
- **Principle II (Accessible and Consistent User Experience)**: PASS — Accessible dialog with keyboard navigation (Esc to cancel), clear focus management, visible loading state on deletion, and responsive styling matching the theme.
- **Principle III (Reliable Authentication, Data Boundaries and Privacy)**: PASS — Uses authenticated Bearer token via `api.ts`; exercises user right to erasure (LGPD/GDPR); clean session termination via Auth0 `logout()`.
- **Principle IV (Verified Behavior Before Merge)**: PASS — Checked with `npm run lint`, `npm run build`, and browser flow verification.
- **Principle V (Simple, Performant State and UI)**: PASS — Self-contained modal state (`isOpen`, `inputText`, `isSubmitting`); no unnecessary global contexts created.

## Project Structure

### Documentation (this feature)

```text
specs/006-account-deletion/
├── plan.md              # This file
├── research.md          # Technical research and decisions
├── data-model.md        # State transitions and interface definitions
├── quickstart.md        # Validation scenarios and test guide
├── contracts/           # API contracts (delete-user.md)
└── checklists/          # Requirements and quality checklists
```

### Source Code (repository root)

```text
src/
├── components/
│   └── DeleteAccountModal.tsx   # New modal dialog with type-to-confirm safeguard
├── pages/
│   └── SettingsProfilePage.tsx  # Added Danger Zone section and delete account button
├── services/
│   └── api.ts                   # Added usersApi.deleteMe() calling DELETE /api/Users/me
└── types/
    └── apiTypes.ts              # Ensure response types for user deletion
```

**Structure Decision**: Single React SPA layout reusing existing shadcn/ui dialogs and centralized Axios client.

## Complexity Tracking

*No violations. Design strictly adheres to constitution principles.*
