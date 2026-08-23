# Interface Contract: Public Legal Routes & Navigation

**Feature**: `005-privacy-and-terms`
**Date**: 2026-08-23

## 1. Routing Specification (`src/App.tsx`)

### Public Route Resolution Rules

1. When a user requests `/privacy` or `/terms`:
   - If unauthenticated: The respective legal page (`PrivacyPolicyPage` / `TermsOfServicePage`) is rendered immediately. No Auth0 login challenge or redirect is triggered.
   - If authenticated: The respective legal page is rendered. The active Auth0 session and user state remain untouched.
2. Route Aliases:
   - `/politica-de-privacidade` -> HTTP client redirect (302/React Router Navigate) to `/privacy`
   - `/privacy-policy` -> HTTP client redirect (302/React Router Navigate) to `/privacy`
   - `/termos-de-uso` -> HTTP client redirect (302/React Router Navigate) to `/terms`
   - `/terms-of-service` -> HTTP client redirect (302/React Router Navigate) to `/terms`
3. Navigation Controls in Legal Header:
   - Klip Logo: Navigates to `/` (Landing Page when unauthenticated, Dashboard when authenticated).
   - "Voltar ao Dashboard" (shown when `isAuthenticated === true`): Navigates to `/`.
   - "Voltar ao Início" (shown when `isAuthenticated === false`): Navigates to `/`.
   - Theme Toggle: Invokes `useTheme().toggleTheme()` immediately.

---

## 2. Touchpoint Contracts

### Global Footer (`src/components/Footer.tsx`)

Must render the following link structure:
```tsx
<div className="flex flex-wrap items-center gap-3">
  <Link to="/terms" className="hover:underline">Termos de Uso</Link>
  <span>•</span>
  <Link to="/privacy" className="hover:underline">Política de Privacidade</Link>
</div>
```

### Google Calendar Integration Panel (`src/components/GoogleCalendarIntegration.tsx`)

Must render contextual notice:
```tsx
<p className="text-[11px] text-[var(--text-muted)]">
  Ao conectar sua conta, você concorda com nossos{" "}
  <Link to="/terms" className="underline font-medium text-[var(--text-primary)]">Termos de Uso</Link>{" "}
  e nossa{" "}
  <Link to="/privacy" className="underline font-medium text-[var(--text-primary)]">Política de Privacidade</Link>.
</p>
```
