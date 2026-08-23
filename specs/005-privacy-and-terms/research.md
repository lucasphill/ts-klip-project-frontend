# Technical Research: Public Privacy Policy & Terms of Service

**Feature**: `005-privacy-and-terms`
**Date**: 2026-08-23
**Status**: Completed

## 1. Route Architecture & Public Unauthenticated Access

### Problem
In `src/App.tsx`, when `!isAuthenticated`, all routes except `/` fall back to `AuthenticatedApp`, which immediately triggers `login()` (redirecting to Auth0). Google OAuth verification crawlers, unauthenticated visitors, and reviewers require immediate, public access to `/privacy` and `/terms` without encountering an authentication prompt or redirect.

### Decision
Structure `AppRoutes` in `src/App.tsx` to handle public routes at the root router level:
1. Public routes available to both unauthenticated and authenticated users:
   - `/privacy` (Canonical Privacy Policy)
   - `/terms` (Canonical Terms of Service)
   - Aliases using React Router `<Navigate replace />`:
     - `/politica-de-privacidade` → `/privacy`
     - `/privacy-policy` → `/privacy`
     - `/termos-de-uso` → `/terms`
     - `/terms-of-service` → `/terms`
2. Unauthenticated root `/` displays `LandingPage`.
3. Unauthenticated access to protected dashboard routes redirects to `login()` via `AuthenticatedApp`.
4. Authenticated users can visit `/privacy` and `/terms` without resetting or terminating their session, with a smart header button that navigates to Dashboard (`/`) when authenticated or Landing Page (`/`) when unauthenticated.

### Rationale
- Zero friction for Google OAuth verification crawlers and external auditors.
- Eliminates risk of redirect loops or inadvertent Auth0 redirects for public visitors.
- Clean separation between public pages and the dashboard bootstrap lifecycle (`BootstrapGate`).

### Alternatives Considered
- *Rendering legal documents inside modal dialogs only*: Rejected because Google OAuth app verification mandates direct, standalone, indexable/crawlable URLs (`/privacy` and `/terms`).
- *Hosting legal documents on an external site/GitHub wiki*: Rejected because keeping the legal pages within the official web app domain (`klip.app.br`) strengthens brand trust, matches project requirements, and satisfies Google domain verification.

---

## 2. Google OAuth Limited Use & Compliance Disclosures

### Problem
Google Cloud Console OAuth verification for applications requesting access to Google Calendar data (`calendar.events` / `calendar`) requires explicit disclosures in the published Privacy Policy, specifically regarding the **Google API Services User Data Policy**, including the **Limited Use** requirements.

### Decision
Include a dedicated, prominent section in `PrivacyPolicyPage` titled **"Conformidade com a Política de Dados do Usuário dos Serviços de API do Google (Limited Use)"** containing:
1. **Specific Scopes & Purpose**: Clear disclosure that Klip accesses Google account email (for account identification) and Google Calendar events (for reading, creating, and updating events corresponding to task deadlines created in Klip).
2. **Mandatory Limited Use Clause**: Literal statement:
   > "O uso e a transferência para qualquer outro aplicativo de informações recebidas das APIs do Google pelo Klip obedecerão à [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), incluindo os requisitos de Uso Limitado (Limited Use)."
3. **Data Usage Restrictions**:
   - Google user data is **never** sold or transferred to data brokers or third parties.
   - Google user data is **never** used for advertising, marketing campaigns, or credit/lending profiling.
   - Google user data is **never** used to train general machine learning or AI models without explicit, user-initiated requests.
4. **Data Retention & Revocation**:
   - Google OAuth tokens are retained only while the integration is connected.
   - Users can disconnect at any time via *Configurações > Integrações > Google Calendar*, which invalidates and removes stored tokens.
   - Users can request complete deletion of account and task data by contacting the developer via email.

### Rationale
Strictly fulfills all criteria of Google's OAuth Developer Verification guidelines, preventing verification rejections or delays.

---

## 3. Indie & Non-Commercial Legal Architecture

### Problem
Klip is an independent, non-commercial software project developed by Lucas Phill in his spare time, provided free of charge. The Terms of Service must protect the indie developer from unreasonable commercial warranties and liabilities while establishing fair usage guidelines.

### Decision
Structure the Terms of Service (`/terms`) with standard indie software governance clauses:
1. **Nature of the Service**: Free, indie productivity application provided "no estado em que se encontra" (*as-is*) and "conforme disponível" (*as-available*), without express or implied warranties of uptime, commercial performance, or fitness for a particular purpose.
2. **Developer Identification & Contact**: Lucas Phill (Desenvolvedor Independente), with public contact email (`contato@klip.app.br` / `lucasphill.dev@gmail.com`) and GitHub profile (`https://github.com/lucasphill`).
3. **User Responsibilities & Acceptable Use**: Users are responsible for the content of their tasks and maintaining the security of their login credentials. Prohibits misuse, reverse engineering of backend infrastructure, or abusive scraping.
4. **Limitation of Liability**: To the maximum extent permitted by applicable law (including the Brazilian Marco Civil da Internet and Consumer Defense Code), the developer is not liable for indirect, incidental, or consequential damages resulting from service interruptions or third-party API changes (such as Google or Auth0).
5. **Modifications to Terms & Termination**: The developer reserves the right to update features, discontinue the free tool, or amend the terms with reasonable advance notice on the website.

---

## 4. UI/UX and Component Design Patterns

### Problem
The legal documents need to look modern, clean, and fully consistent with Klip's design language (TailwindCSS, custom CSS variables, light & dark theme support), while remaining readable and printable.

### Decision
Create a shared, reusable legal page layout component (`LegalLayout.tsx`) and separate content components (`PrivacyPolicyPage.tsx`, `TermsOfServicePage.tsx`) or structured data sections:
1. **Sticky Header**:
   - Klip Logo + Name (clicking navigates to `/` or Dashboard).
   - Theme toggle button (Sun/Moon icon using `useTheme()`).
   - Smart Back action ("Voltar ao Dashboard" if `isAuthenticated`, "Voltar ao Início" if not).
2. **Typography & Readability**:
   - Clean max-width container (`max-w-4xl mx-auto py-10 px-4 sm:px-6`).
   - Badge indicating document status ("Vigente", "Versão 1.0", "Última atualização: 23 de Agosto de 2026").
   - Clear hierarchical headings (`h1`, `h2`, `h3`) with subtle border dividers.
   - High contrast text styles using CSS variables (`var(--text-primary)`, `var(--text-secondary)`, `var(--bg-panel)`, `var(--border-subtle)`).
3. **Print Styles**: Clean CSS print media rules (`@media print`) that hide header buttons and ensure black-and-white readable printing.
4. **Touchpoint Links**:
   - `src/components/Footer.tsx`: Add "Termos de Uso" (`/terms`) and "Política de Privacidade" (`/privacy`) links separated by dividers.
   - `src/pages/LandingPage.tsx`: Inherits the updated `Footer`.
   - `src/components/GoogleCalendarIntegration.tsx`: Add consent and information text linking to `/privacy` and `/terms` right below the connection description.
