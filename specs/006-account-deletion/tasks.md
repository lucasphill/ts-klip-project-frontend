# Tasks: Self-Service Account Deletion with Text Confirmation

**Feature**: Self-Service Account Deletion with Text Confirmation
**Branch**: `006-account-deletion`
**Spec**: [specs/006-account-deletion/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/006-account-deletion/spec.md)
**Plan**: [specs/006-account-deletion/plan.md](file:///D:/Dev/ts-klip-project-frontend/specs/006-account-deletion/plan.md)

---

## Phase 1: Setup & Foundational (Prerequisites)

**Purpose**: Establish API services and types required for account deletion

- [X] T001 [P] Create user types and modal interfaces in `src/types/userTypes.ts`
- [X] T002 Implement `usersApi.deleteMe()` calling `DELETE /api/Users/me` in `src/services/api.ts`

---

## Phase 2: User Story 1 - Self-Service Account Deletion with Text Confirmation (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to permanently delete their account from Settings Profile with mandatory typed confirmation (`DELETAR`), followed by session logout and redirect.

**Independent Test**: Navigate to Settings > Profile, click "Excluir Conta", verify typing `DELETAR` unlocks the confirm button, click confirm, and verify the user is logged out and redirected to `/`.

### Implementation for User Story 1

- [X] T003 [US1] Create `src/components/DeleteAccountModal.tsx` with dialog header, warning copy, confirmation input, and action buttons
- [X] T004 [US1] Implement typed phrase matching (`DELETAR` / `deletar`, case-insensitive trimmed) to conditionally enable the confirmation button in `src/components/DeleteAccountModal.tsx`
- [X] T005 [US1] Add the "Zona de Perigo" (Danger Zone) card and "Excluir Conta" button to the bottom of `src/pages/SettingsProfilePage.tsx`
- [X] T006 [US1] Connect `DeleteAccountModal` in `src/pages/SettingsProfilePage.tsx` to invoke `usersApi.deleteMe()`, show a success toast, and trigger `logout({ logoutParams: { returnTo: window.location.origin } })`

**Checkpoint**: User Story 1 is fully functional — users can delete their account by typing `DELETAR` and get logged out cleanly.

---

## Phase 3: User Story 2 - Resilient Error Handling and Cancellation (Priority: P2)

**Goal**: Guarantee that cancellation dismisses the modal and resets inputs safely, and that API errors display feedback without logging the user out.

**Independent Test**: Open modal, type text, click "Cancelar" and verify clean reset. Then trigger an error response and verify `toast.error()` is shown and session remains active.

### Implementation for User Story 2

- [X] T007 [US2] Implement input reset and prevent dismissal during active deletion in `src/components/DeleteAccountModal.tsx`
- [X] T008 [US2] Add try/catch error handling with fallback error messages and `toast.error()` in `src/pages/SettingsProfilePage.tsx`

**Checkpoint**: User Stories 1 and 2 are functional, resilient, and safe against accidental triggers or network errors.

---

## Phase 4: Polish & Validation

**Purpose**: Code quality, compliance, and end-to-end validation

- [X] T009 [P] Run project linter and build verification (`npm run lint && npm run build`)
- [X] T010 Validate complete deletion flow against scenarios in `specs/006-account-deletion/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Foundational)**: Prerequisite for all User Stories.
- **Phase 2 (User Story 1 - MVP)**: Depends on Phase 1 completion.
- **Phase 3 (User Story 2)**: Integrates with and hardens User Story 1 components.
- **Phase 4 (Polish & Validation)**: Depends on Phases 1–3 completion.

### Parallel Opportunities
- T001 and T002 can be started concurrently.
- T009 can be executed immediately after implementation tasks.

---

## Implementation Strategy

### MVP First (User Story 1)
1. Complete Phase 1 (types & API service).
2. Complete Phase 2 (modal & danger zone on profile page).
3. Complete Phase 3 (error handling & cancellation).
4. Run Phase 4 (quality checks & build).
