# Feature Specification: Self-Service Account Deletion with Text Confirmation

**Feature Branch**: `006-account-deletion`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "/speckit-specify verifique na documentação da API que agora temos a rota delete /api/Users/me https://api.klip.app.br/scalar. implemente na tela de configurações um botão para exclusão da conta com confirmação do usuário tendo que digitar um texto como "Deletar" ou "Excluir conta" ou algo do tipo"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Self-Service Account Deletion with Text Confirmation (Priority: P1)

As an authenticated user, I want to be able to permanently delete my account and all associated data from the Profile Settings page by typing a specific confirmation phrase in a modal, so that I can exercise my right to data erasure (LGPD/GDPR) securely and prevent accidental account deletion.

**Why this priority**: Account deletion is a critical self-service capability, a regulatory requirement (LGPD/GDPR), and must be implemented with high safeguards against accidental execution.

**Independent Test**: Navigate to Settings > Profile, click "Excluir Conta", verify the confirmation modal requires typing the confirmation text (e.g. `DELETAR` or `Excluir conta`) before enabling deletion, submit the confirmation, and verify the user is logged out and redirected to `/`.

**Acceptance Scenarios**:

1. **Given** an authenticated user in Settings > Profile, **When** they scroll to the bottom of the page, **Then** they see a dedicated "Zona de Perigo" / "Exclusão de Conta" section with clear warnings about the irreversibility of the action and an "Excluir Conta" button.
2. **Given** the user clicks "Excluir Conta", **When** the modal opens, **Then** it clearly lists what will be permanently erased (tasks, projects, custom fields, API keys, and Google Calendar tokens), displays a text input, and keeps the "Confirmar Exclusão" action button disabled.
3. **Given** the confirmation modal is open, **When** the user types the exact required confirmation phrase, **Then** the "Confirmar Exclusão" button becomes enabled.
4. **Given** the user clicks "Confirmar Exclusão", **When** the request is sent to `DELETE /api/Users/me`, **Then** a loading spinner is displayed, inputs are disabled, and upon success, a confirmation toast is shown and the user is logged out and redirected to the home/landing page (`/`).

---

### User Story 2 - Resilient Error Handling and Cancellation (Priority: P2)

As a user reviewing or attempting account deletion, I want to be able to cancel the operation at any time without side effects, and receive clear error feedback if the backend deletion request fails, so that my account remains accessible and no data is lost prematurely.

**Why this priority**: Ensures that network failures or server errors do not leave the frontend in an inconsistent or prematurely logged-out state.

**Independent Test**: Open the deletion modal, click "Cancelar" and verify no action occurs. Then simulate a failed request and verify an error toast is shown and the user remains logged in.

**Acceptance Scenarios**:

1. **Given** the deletion modal is open, **When** the user clicks "Cancelar" or closes the dialog, **Then** the modal closes, the input field is reset, no API call is made, and the user remains on the Profile Settings page.
2. **Given** the user confirms deletion with valid text, **When** the API call to `DELETE /api/Users/me` returns an error (400, 500, or network failure), **Then** the loading state ends, an informative error message is displayed via toast, the modal remains accessible for retry or cancellation, and the user is NOT logged out.

---

### Edge Cases

- **Case Insensitivity vs Exact Match**: The confirmation text comparison should allow case-insensitive matching for standard inputs (e.g. `DELETAR` or `deletar`) while ignoring leading/trailing whitespace to prevent user frustration.
- **In-flight Request Prevention**: Once "Confirmar Exclusão" is clicked, all modal controls (input, cancel, confirm) are disabled to prevent duplicate submissions or race conditions.
- **Active OAuth & Calendar Connections**: The deletion endpoint handles backend cleanup; the frontend clears all local contexts, caches, and storage upon successful completion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Profile Settings page (`SettingsProfilePage.tsx`) MUST feature a prominent "Zona de Perigo" (Danger Zone) card at the bottom of the profile view.
- **FR-002**: The Danger Zone card MUST contain an "Excluir Conta" button styled with destructive visual hierarchy.
- **FR-003**: Clicking "Excluir Conta" MUST open a dedicated confirmation dialog (`DeleteAccountModal.tsx` or modal component).
- **FR-004**: The confirmation modal MUST display an explicit explanation that deleting the account is permanent and will irreversibly erase all tasks, projects, custom fields, and linked integrations.
- **FR-005**: The confirmation modal MUST contain a text input requiring the user to type a confirmation keyword (e.g. `DELETAR`) to unlock the destructive button.
- **FR-006**: The "Confirmar Exclusão" button MUST remain disabled until the input value matches the confirmation keyword (trimmed).
- **FR-007**: The frontend API service (`api.ts`) MUST expose a `usersApi.deleteMe()` method calling `DELETE /api/Users/me` with the authenticated Bearer token.
- **FR-008**: Upon confirmation, the application MUST call `usersApi.deleteMe()`, show a loading indicator on the button, and disable dialog dismissal during the request.
- **FR-009**: On HTTP 200 success, the application MUST display a success toast and invoke `logout()` from `AuthContext` to terminate the session and redirect to `/`.
- **FR-010**: On request failure, the application MUST display an error toast with the returned message (or default fallback) and keep the user logged in.

### Key Entities

- **Account Deletion Request**: An authorized operation sent to `DELETE /api/Users/me` that permanently deletes the current user's profile, data, and third-party linkages.
- **Account Deletion Modal State**: Local state tracking dialog visibility (`isOpen`), user input text (`confirmationText`), confirmation validity (`isMatch`), and submission loading state (`isDeleting`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of account deletion attempts require valid text confirmation before sending the deletion request.
- **SC-002**: On confirmed deletion, the account is deleted via API and the user is logged out and redirected to `/` in under 3 seconds.
- **SC-003**: 0% accidental account deletions caused by single-click or misclicks.
- **SC-004**: In the event of an API error, 100% of failure cases display clear feedback without logging the user out prematurely.

## Assumptions

- The backend API provides `DELETE /api/Users/me` secured with Auth0 Bearer authentication.
- The backend cascades deletion to all user-owned entities (tasks, subtasks, projects, custom field definitions, custom field values, API keys, Google Calendar tokens).
- The confirmation keyword is `DELETAR` (or `deletar`, case-insensitive trimmed).
- The user is already authenticated when accessing Settings > Profile.
