# Implementation Plan: Public Privacy Policy & Terms of Service (Google Calendar & Indie App)

**Branch**: `005-privacy-and-terms` | **Date**: 2026-08-23 | **Spec**: [spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/005-privacy-and-terms/spec.md)

**Input**: Feature specification from `/specs/005-privacy-and-terms/spec.md`

## Summary

Implement standalone, public, unauthenticated routes and pages for the **Política de Privacidade** (`/privacy`) and **Termos de Serviço** (`/terms`) with route aliases (`/politica-de-privacidade`, `/termos-de-uso`, etc.) in the Klip frontend. The Privacy Policy incorporates full compliance with the **Google API Services User Data Policy (Limited Use requirements)**, clearly identifying Lucas Phill as the indie developer and outlining strict data usage, retention, and deletion rights. Add contextual navigation links to the global Footer, Landing Page, and Settings Google Calendar integration panel.

## Technical Context

**Language/Version**: TypeScript 5.7+ / React 19 / Vite 7

**Primary Dependencies**: `react-router-dom`, `lucide-react`, `tailwindcss`, `shadcn/ui` (existing in project; 0 new packages)

**Storage**: N/A (Static structured data & content modules in frontend codebase)

**Testing**: Lint (`npm run lint`), Typecheck/Build (`tsc -b && vite build`), Browser verification (Chrome DevTools MCP / Manual)

**Target Platform**: Web (Desktop & Mobile, modern evergreen browsers)

**Project Type**: Single-Page Web Application (Frontend)

**Performance Goals**: Instant route rendering (<50ms), initial page load <1s, 0 cumulative layout shift (CLS)

**Constraints**: Public unauthenticated access without Auth0 login redirection; zero session disruption for authenticated users; 100% adherence to Google OAuth verification disclosures and LGPD guidelines

**Scale/Scope**: 2 dedicated legal pages (`PrivacyPolicyPage`, `TermsOfServicePage`), 1 shared `LegalLayout` component, 4 route aliases, and updates to `Footer.tsx` and `GoogleCalendarIntegration.tsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Compliance Details |
|---|---|---|---|
| **I. Type-Safe, Maintainable Frontend** | Explicit TypeScript types for all components, constants, and routing structures. Shared UI primitives reused. | **PASS** | Reusable `LegalLayout` and clean structured section models; no code duplication or loose untyped objects. |
| **II. Accessible and Consistent User Experience** | Follow TailwindCSS and shadcn/ui patterns, light/dark theme support, keyboard navigable, responsive. | **PASS** | Accessible contrast, theme toggle integration via `useTheme()`, responsive max-width typography. |
| **III. Reliable Authentication and Data Boundaries** | Protect Auth0 flow while allowing unauthenticated public access for public routes; never leak tokens or private user data. | **PASS** | Top-level routing allows `/privacy` and `/terms` without invoking `login()`; preserves authenticated session state when logged in. |
| **IV. Verified Behavior Before Merge** | Validate build, linter, typechecks, and browser behavior. | **PASS** | Lint, build, and browser verification tests specified in `quickstart.md`. |
| **V. Simple, Performant State and UI** | Smallest practical solution, no unnecessary dependencies or bloated state. | **PASS** | Lightweight static components with standard React Router navigation; zero external dependencies. |

## Project Structure

### Documentation (this feature)

```text
specs/005-privacy-and-terms/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Technical research and decisions ($speckit-plan command output)
├── data-model.md        # Entities and route mappings ($speckit-plan command output)
├── quickstart.md        # Validation scenarios and test guide ($speckit-plan command output)
├── contracts/           # Content and route interface contracts ($speckit-plan command output)
│   ├── routes.md
│   └── legal-content.md
├── checklists/
│   └── requirements.md  # Quality checklist from specify phase
└── tasks.md             # Implementation tasks ($speckit-tasks command output)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Footer.tsx                     # Add links to Termos de Uso and Política de Privacidade
│   ├── GoogleCalendarIntegration.tsx  # Add consent & policy reference links
│   └── LegalLayout.tsx                # Reusable header, container, and footer layout for legal pages
├── pages/
│   ├── PrivacyPolicyPage.tsx          # Full Privacy Policy with Google Limited Use section
│   └── TermsOfServicePage.tsx         # Full Terms of Service with Indie project disclaimers
├── App.tsx                            # Top-level public and authenticated route declarations
```

**Structure Decision**: Single React frontend application. Legal pages and layouts placed in `src/pages/` and `src/components/`, with routing configured in `src/App.tsx` and contextual links added to existing components.

## Complexity Tracking

> **No violations or unneeded abstractions.** All designs adhere directly to the project constitution with zero new dependencies.
