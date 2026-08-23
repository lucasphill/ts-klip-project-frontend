# Tasks: Public Privacy Policy & Terms of Service (Google Calendar & Indie App)

**Feature**: `005-privacy-and-terms`
**Date**: 2026-08-23
**Spec**: [spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/005-privacy-and-terms/spec.md)
**Plan**: [plan.md](file:///D:/Dev/ts-klip-project-frontend/specs/005-privacy-and-terms/plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define TypeScript types, metadata constants, and contact information for legal documents.

- [X] T001 [P] Create legal types and contact constants in `src/types/legalTypes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI layout component required by both legal pages.

**⚠️ CRITICAL**: Must be completed before implementing specific legal pages and routes.

- [X] T002 [P] Create shared `LegalLayout` component in `src/components/LegalLayout.tsx` with Klip logo, smart back navigation (Dashboard / Home), theme toggle, and responsive typography container

**Checkpoint**: Foundation ready - legal pages and routing implementation can proceed.

---

## Phase 3: User Story 1 - Public Access & Route Architecture (Priority: P1) 🎯 MVP

**Goal**: Enable unauthenticated and authenticated users (and Google OAuth crawlers) to access `/privacy`, `/terms`, and aliases without Auth0 login redirects.

**Independent Test**: Open an unauthenticated browser window, navigate to `/privacy`, `/terms`, `/politica-de-privacidade`, and `/termos-de-uso`, and confirm the pages render immediately without Auth0 login redirection.

- [X] T003 [US1] Create initial page shells for `src/pages/PrivacyPolicyPage.tsx` and `src/pages/TermsOfServicePage.tsx` utilizing `LegalLayout`
- [X] T004 [US1] Configure top-level public routes and alias redirects (`/privacy`, `/terms`, `/politica-de-privacidade`, `/privacy-policy`, `/termos-de-uso`, `/terms-of-service`) in `src/App.tsx`

**Checkpoint**: User Story 1 complete. Public legal routes are accessible without authentication.

---

## Phase 4: User Story 2 - Comprehensive Legal Content & Google Limited Use Disclosures (Priority: P1)

**Goal**: Deliver full, legally compliant PT-BR legal texts with explicit Google API Services User Data Policy (Limited Use) disclosures, developer identity, data retention, and deletion procedures.

**Independent Test**: Review `/privacy` and `/terms` in the browser to ensure all sections, developer identification (Lucas Phill), contact email (`contato@klip.app.br` / `lucasphill.dev@gmail.com`), Google Limited Use clause, and data deletion workflows are rendered.

- [X] T005 [P] [US2] Implement comprehensive Privacy Policy content in `src/pages/PrivacyPolicyPage.tsx` with developer identity, Auth0 data handling, Google Calendar event sync purpose, mandatory Google Limited Use clause, and data retention/deletion instructions
- [X] T006 [P] [US2] Implement comprehensive Terms of Service content in `src/pages/TermsOfServicePage.tsx` with indie project nature, "as-is" disclaimer, limitation of liability, user responsibilities, and Brazilian governing law

**Checkpoint**: User Story 2 complete. Both legal documents are fully populated and compliant with Google verification standards.

---

## Phase 5: User Story 3 - Contextual UI Links in Footer and Integrations (Priority: P2)

**Goal**: Expose visible, contextual links to `/terms` and `/privacy` in the global `Footer` and inside the Google Calendar integration panel in Settings.

**Independent Test**: Navigate through the Landing Page, authenticated dashboard, and Settings > Integrations > Google Calendar panel, verifying that all legal links are present and functional.

- [X] T007 [P] [US3] Update `src/components/Footer.tsx` to render clickable links for "Termos de Uso" (`/terms`) and "Política de Privacidade" (`/privacy`)
- [X] T008 [P] [US3] Update `src/components/GoogleCalendarIntegration.tsx` to add consent notice linking to `/terms` and `/privacy` in the Google Calendar connection card

**Checkpoint**: User Story 3 complete. Legal links are accessible across the entire application interface.

---

## Phase 6: User Story 4 - Responsive & Theme-Aware Reading Interface Polish (Priority: P3)

**Goal**: Ensure legal pages adhere to Klip's design system, support dark/light mode transitions, and provide clean print-friendly rendering.

**Independent Test**: Toggle theme modes and resize browser viewport to mobile dimensions; trigger print preview (`Ctrl+P`) to verify print styles.

- [X] T009 [US4] Add visual polish, callout styling for key disclosures, and print media CSS (`@media print`) in `src/components/LegalLayout.tsx`

**Checkpoint**: User Story 4 complete. Responsive, theme-aware, and printable presentation verified.

---

## Phase 7: Polish & Verification

**Purpose**: Execute project verification checks, linter, build validation, and end-to-end quickstart scenarios.

- [X] T010 Execute linter verification via `npm run lint` and resolve any warnings/errors
- [X] T011 Execute production build verification via `npm run build` (`tsc -b && vite build`)
- [X] T012 Validate all quickstart test scenarios from `specs/005-privacy-and-terms/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 (types).
- **User Story 1 (Phase 3)**: Depends on Phase 2 (`LegalLayout`).
- **User Story 2 (Phase 4)**: Depends on Phase 3 (page shells and routing).
- **User Story 3 (Phase 5)**: Depends on Phase 3 (route paths active).
- **User Story 4 (Phase 6)**: Depends on Phase 4 & Phase 5.
- **Polish & Verification (Phase 7)**: Depends on all implementation tasks (T001–T009).

### Parallel Opportunities

- `T001` and `T002` can be authored in parallel.
- `T005` (Privacy Policy) and `T006` (Terms of Service) can be implemented in parallel.
- `T007` (`Footer.tsx`) and `T008` (`GoogleCalendarIntegration.tsx`) can be implemented in parallel.

---

## Implementation Strategy

### MVP Scope (User Story 1 & User Story 2)
1. Complete Phase 1 (Setup) & Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 - Public Routes).
3. Complete Phase 4 (User Story 2 - Full Legal Texts & Google Disclosures).
4. **MVP Validation**: Both `/privacy` and `/terms` can be loaded publicly without login, with complete Google verification clauses.

### Full Delivery
1. Complete Phase 5 (Footer & Google Calendar Integration Links).
2. Complete Phase 6 (Theme & Print Polish).
3. Run Phase 7 (Lint, Build, and Quickstart Verification).
