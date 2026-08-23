# Research: Self-Service Account Deletion with Text Confirmation

## Decision 1: API Endpoint and Contract Integration
- **Decision**: Integrate `DELETE /api/Users/me` into `src/services/api.ts` under a new export `usersApi`.
- **Rationale**: The endpoint is documented in the OpenAPI specification (`DELETE /api/Users/me`) and uses standard Auth0 Bearer authentication managed by Axios interceptors.
- **Alternatives Considered**:
  - Calling generic `api.delete('/Users/me')` inline in the component: Violates Principle I (Type-Safe, Maintainable Frontend) and Principle III (Centralized service layer).
  - Passing user ID in path `/Users/{id}`: Not supported; the backend uses the authenticated claims from the Bearer token (`/Users/me`) for safety and tenant isolation.

## Decision 2: Text Confirmation Mechanism & Safeguards
- **Decision**: Require the user to type the word `DELETAR` (or `deletar`) in a dedicated input field within `DeleteAccountModal.tsx`.
- **Rationale**: Deleting an account is permanent and irreversible (LGPD data erasure). Requiring explicit typed confirmation prevents accidental deletion via misclicks or reflexive Enter keypresses.
- **Comparison Logic**: `input.trim().toUpperCase() === 'DELETAR'` (case-insensitive with trimming) to ensure accessibility while maintaining deliberate intent.
- **Alternatives Considered**:
  - Simple OK/Cancel dialog: Insufficient safeguard for destructive account deletion.
  - Typing user email: More cumbersome and prone to typos, especially with long email addresses; typing a short explicit verb (`DELETAR`) is standard in modern developer and SaaS platforms (GitHub, Vercel, Supabase).

## Decision 3: Post-Deletion Cleanup & Session Termination
- **Decision**: Display a success notification (`toast.success`), reset any client-side caches, and invoke Auth0's `logout({ logoutParams: { returnTo: window.location.origin } })`.
- **Rationale**: Once the user account is deleted in the backend database, subsequent API requests will return 401/404. Redirecting to the public landing page via Auth0 logout ensures a clean state and terminates the Auth0 session cookie.
- **Alternatives Considered**:
  - Simply navigating to `/` with React Router: Leaves Auth0 session active in browser memory, causing auto-login attempts on subsequent visits.
