# Feature Specification: Public Privacy Policy & Terms of Service (Google Calendar & Indie App)

**Feature Branch**: `005-privacy-and-terms`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "/speckit-specify para utilizar o google calendar eu preciso ter publicado uma politica de privacidade e termos de serviço. ambos os termos precisam ser publicos e pretendo colocá-los no frontend. nunca fiz nenhum dos dois termos e preciso de ajuda tanto para desenvolver o texto quanto para publicalos na aplicação sem precisar de nenhuma autenticação. utilize /grill-me e me pergunte tudo que for pertinente para o desenvolvimento dos termos, lembre-se que é uma aplicação indie sem objetivos financeiros e sem objetivos de processamento de dados."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Public Access to Privacy Policy and Terms of Service (Priority: P1)

As an unauthenticated visitor, application user, or Google OAuth verification reviewer, I want to access `/privacy` and `/terms` (and their Portuguese aliases) directly in my browser without being challenged by login prompts or redirects, so that I can review Klip's data handling practices, Google integration terms, and conditions of service freely.

**Why this priority**: Public unauthenticated accessibility of the Privacy Policy and Terms of Service is an absolute prerequisite for Google Calendar OAuth verification and app store/service compliance.

**Independent Test**: Open a private/incognito browser window, navigate directly to `/privacy` and `/terms`, and verify that the full legal documents load immediately without redirects to Auth0 or the login flow.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor navigating to `/privacy` (or aliases `/politica-de-privacidade`, `/privacy-policy`), **When** the page loads, **Then** the Privacy Policy is displayed cleanly in Portuguese (PT-BR) with complete sections, last updated date, and developer contact details without triggering authentication.
2. **Given** an unauthenticated visitor navigating to `/terms` (or aliases `/termos-de-uso`, `/terms-of-service`), **When** the page loads, **Then** the Terms of Service are displayed cleanly in Portuguese (PT-BR) with indie app terms and disclaimers without triggering authentication.
3. **Given** an unauthenticated user viewing a legal page, **When** they click "Voltar ao Início" or the Klip logo in the header, **Then** they are navigated back to the Landing Page (`/`).
4. **Given** an authenticated user viewing a legal page, **When** they click "Voltar ao Dashboard" or the Klip logo, **Then** they return to their active dashboard session without session disruption.

---

### User Story 2 - Comprehensive Legal Content & Google OAuth Limited Use Disclosures (Priority: P1)

As a user and as a Google OAuth verification specialist, I want the Privacy Policy and Terms of Service to explicitly document Klip's identity as a free indie application, explain the exact scope of Google Calendar permissions requested, include the mandatory Google Limited Use disclosure, and describe user data retention and deletion rights, so that the application is fully transparent, compliant with LGPD/GDPR standards, and eligible for Google verification.

**Why this priority**: Without explicit Google API Services User Data Policy / Limited Use clauses and clear data deletion instructions, Google will reject the OAuth verification request for the Google Calendar integration.

**Independent Test**: Review the text of `/privacy` and verify that the Google Calendar data usage section, Limited Use clause, and data deletion workflows are present, prominent, and unambiguous.

**Acceptance Scenarios**:

1. **Given** a user or auditor reading the Privacy Policy (`/privacy`), **When** they inspect the Google Calendar section, **Then** they see clear disclosures stating:
   - What data is accessed: Google account email (for identity verification) and Google Calendar events (for syncing task deadlines and due dates).
   - How data is used: Exclusively for creating, reading, updating, and syncing calendar events created for Klip tasks.
   - What is NOT done: Data is never sold, never shared with third parties for marketing/advertising, and never used to train generalized artificial intelligence models without user request.
   - Mandatory Google Limited Use clause: Explicit adherence to the Google API Services User Data Policy.
2. **Given** a user reading the Privacy Policy, **When** they review the Data Retention & Deletion section, **Then** they see instructions for:
   - Self-service disconnection in Settings > Integrations (which immediately revokes/removes stored Google OAuth tokens).
   - Formal account/data deletion request via direct contact email (`contato@klip.app.br` / developer contact).
3. **Given** a user reading the Terms of Service (`/terms`), **When** they review the document, **Then** they see clear provisions defining:
   - Nature of service: Free, independent productivity tool provided "as-is" without financial guarantees or commercial service-level agreements.
   - Intellectual property and acceptable use policies.
   - Disclaimers of warranty and limitations of liability typical of indie software.

---

### User Story 3 - Contextual UI Links in Footer, Landing Page, and Integrations (Priority: P2)

As a user exploring the app or configuring Google Calendar in Settings, I want visible, intuitive links to the Terms of Service and Privacy Policy in the global Footer, Landing Page, and Google Calendar connection panel, so that I can easily reference our policies before and after connecting third-party services.

**Why this priority**: Providing contextual links at touchpoints where consent is relevant (especially the Google Calendar connection card) enhances transparency and directly satisfies Google's verification UX expectations.

**Independent Test**: Navigate through the Landing Page, the Authenticated App Footer, and the Settings > Integrations > Google Calendar panel, verifying that each location contains functional links leading to `/terms` and `/privacy`.

**Acceptance Scenarios**:

1. **Given** a user viewing the global Footer (present on Landing Page and within dashboard views), **When** they inspect the footer links, **Then** they see "Termos de Uso" and "Política de Privacidade" links that navigate cleanly to `/terms` and `/privacy`.
2. **Given** an authenticated user in Settings > Integrations > Google Calendar, **When** they view the Google Calendar connection card, **Then** they see informative consent text stating that connecting Google Calendar implies agreement with the Terms and Privacy Policy, with direct clickable links.
3. **Given** a user clicking any legal link, **When** the page opens, **Then** it smoothly scrolls to the top of the requested legal document.

---

### User Story 4 - Responsive, Accessible, and Theme-Aware Reading Interface (Priority: P3)

As a user reading the legal terms on mobile, tablet, or desktop, in either dark or light theme, I want the reading interface to be comfortable, well-formatted with clear typographic hierarchy, printable, and matching Klip's design system, so that reading long-form terms is effortless.

**Why this priority**: Enhances usability, accessibility, and visual consistency with the rest of Klip's UI.

**Independent Test**: Switch themes between light and dark while viewing `/privacy` and `/terms`, and resize the viewport to mobile dimensions, verifying that typography and color contrast remain optimal.

**Acceptance Scenarios**:

1. **Given** a user on a legal page, **When** they toggle the theme button in the header, **Then** the document seamlessly shifts between light and dark theme with compliant contrast ratios.
2. **Given** a user on a mobile device, **When** they scroll through the terms, **Then** typography line heights, max-width containers, and header elements adjust responsively without horizontal overflow.
3. **Given** a user printing the page, **When** they trigger browser print (`Ctrl+P` / `Cmd+P`), **Then** unnecessary navigation elements are hidden and the document prints in high contrast.

---

### Edge Cases

- **Direct Deep Linking & Route Aliases**: Unauthenticated or authenticated users hitting `/politica-de-privacidade`, `/termos-de-uso`, `/privacy-policy`, or `/terms-of-service` MUST resolve directly or redirect to the canonical pages `/privacy` and `/terms` without 404 errors or auth redirects.
- **Session Preservation**: An authenticated user accessing `/privacy` or `/terms` directly via URL must remain authenticated and have an easy one-click action to return to their dashboard (`/`).
- **External OAuth Token Revocation**: If a user revokes Klip's access directly from their Google Account settings, the Privacy Policy accurately reflects that Klip will fail to sync and respect the revocation without retaining unauthorized access.
- **Contact Channel Inquiries**: The contact email listed in the terms MUST be clearly visible and formatted as a mailto link (`contato@klip.app.br` / developer contact).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application router MUST allow unauthenticated public access to `/privacy` and `/terms`.
- **FR-002**: The application router MUST support route aliases (`/politica-de-privacidade`, `/privacy-policy`, `/termos-de-uso`, `/terms-of-service`) resolving to the canonical legal pages without triggering auth redirects.
- **FR-003**: The Privacy Policy page (`/privacy`) MUST provide comprehensive text in Portuguese (PT-BR) covering:
  - Developer and controller identity: Lucas Phill (indie developer).
  - Scope of data collected (account profile, tasks, project metadata, Google Calendar event details, email).
  - Purpose of data processing (task organization, deadline synchronization, no commercial data mining).
  - Contact email for privacy inquiries and data deletion requests.
  - Effective date and last modified date.
- **FR-004**: The Privacy Policy MUST contain a dedicated section for Google API Services User Data Policy compliance, stating explicitly that Klip's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.
- **FR-005**: The Privacy Policy MUST define data retention rules and explain user rights to revoke access (via Settings > Integrations) or request full account deletion via email.
- **FR-006**: The Terms of Service page (`/terms`) MUST provide comprehensive text in Portuguese (PT-BR) defining:
  - Acceptance of terms and description of service (indie task management tool).
  - Non-commercial, free software nature ("as-is" disclaimer without warranties).
  - User responsibilities, acceptable use, and intellectual property.
  - Limitation of liability and modifications to terms.
- **FR-007**: The global Footer component (`Footer.tsx`) MUST be updated to include direct links to "Termos de Uso" (`/terms`) and "Política de Privacidade" (`/privacy`).
- **FR-008**: The Google Calendar integration component (`GoogleCalendarIntegration.tsx`) MUST display consent/reference links to the Terms of Service and Privacy Policy within its configuration UI.
- **FR-009**: The legal document pages MUST feature a header with the Klip logo, navigation back to Home/Dashboard, a theme toggle (light/dark), and clean typography conforming to Tailwind/shadcn styling.
- **FR-010**: Navigating to legal pages while authenticated MUST preserve the user's active session without logging them out or forcing a page reload.

### Key Entities

- **Legal Document**: Represents a public legal document (Privacy Policy or Terms of Service) consisting of a document title, last updated date, introductory summary, structured hierarchical sections (numbered headers, paragraphs, bullet lists), and contact/governance disclosures.
- **Google Limited Use Disclosure**: A mandatory compliance clause within the Privacy Policy explicitly stating adherence to the Google API Services User Data Policy Limited Use requirements for Google Calendar data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of unauthenticated requests to `/privacy`, `/terms`, and their aliases load the full legal document in under 1 second without any authentication challenge or redirect loop.
- **SC-002**: 100% of mandatory Google OAuth verification requirements (developer identity, Google Calendar scope purpose, Limited Use disclosure, data retention, deletion instructions, contact email) are present in the Privacy Policy.
- **SC-003**: Users can reach the Privacy Policy and Terms of Service from anywhere in the application (Footer, Landing Page, Google Calendar settings) with a single click.
- **SC-004**: Authenticated users can navigate to and from legal pages without losing application state or needing to re-authenticate.

## Assumptions

- Klip is an indie, non-commercial productivity tool developed and maintained by Lucas Phill, provided free of charge.
- Google Calendar integration is used strictly to sync task due dates and deadlines to the user's Google Calendar with their explicit consent.
- No user data obtained through Google APIs is sold, transferred to third-party data brokers, used for advertising, or used to train general machine learning/AI models.
- Legal documents are drafted in clear, professional Portuguese (PT-BR) compliant with Brazilian legislation (LGPD) and Google API Developer verification standards.
- A public contact email (`contato@klip.app.br` / `lucasphill.dev@gmail.com`) and GitHub profile (`https://github.com/lucasphill`) serve as the communication channels for privacy inquiries and data deletion requests.
