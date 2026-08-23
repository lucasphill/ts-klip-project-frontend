# Data Model: Legal Documents & Public Routes

**Feature**: `005-privacy-and-terms`
**Date**: 2026-08-23

## Entities & Structures

### 1. Legal Document Structure (`LegalDocument`)

Represents a rendered legal document (Privacy Policy or Terms of Service) presented to users.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Identifier (`privacy-policy` \| `terms-of-service`) |
| `title` | `string` | Display title (e.g. "Política de Privacidade", "Termos de Serviço") |
| `effectiveDate` | `string` | Date of publication/amendment (e.g. "23 de Agosto de 2026") |
| `version` | `string` | Semantic document version (e.g. "1.0") |
| `summary` | `string` | Executive introductory summary in plain language |
| `sections` | `LegalSection[]` | Array of numbered legal sections |

### 2. Legal Section (`LegalSection`)

Represents an individual section or chapter within a legal document.

| Field | Type | Description |
|-------|------|-------------|
| `number` | `number` | Numerical order (e.g. 1, 2, 3) |
| `title` | `string` | Section title (e.g. "Integração com Google Calendar e Uso Limitado de Dados") |
| `paragraphs` | `string[]` | Formatted paragraphs explaining the section's policies |
| `bulletPoints` | `string[]?` | Optional list of specific clauses, bullet points, or rules |
| `callout` | `{ type: 'info' \| 'warning'; text: string }?` | Optional emphasized notice (e.g., Google Limited Use statement) |

### 3. Route Mapping Table

| Route Path | Canonical? | Auth Required? | Target Component / Redirection |
|------------|------------|----------------|--------------------------------|
| `/privacy` | Yes | No (Public) | `PrivacyPolicyPage` |
| `/terms` | Yes | No (Public) | `TermsOfServicePage` |
| `/politica-de-privacidade` | Alias | No (Public) | Redirects (`<Navigate to="/privacy" replace />`) |
| `/privacy-policy` | Alias | No (Public) | Redirects (`<Navigate to="/privacy" replace />`) |
| `/termos-de-uso` | Alias | No (Public) | Redirects (`<Navigate to="/terms" replace />`) |
| `/terms-of-service` | Alias | No (Public) | Redirects (`<Navigate to="/terms" replace />`) |

### 4. Controller & Contact Metadata

| Key | Value | Description |
|-----|-------|-------------|
| `APP_NAME` | `Klip` | Application name |
| `DEVELOPER_NAME` | `Lucas Phill` | Independent developer & data controller |
| `CONTACT_EMAIL` | `contato@klip.app.br` / `lucasphill.dev@gmail.com` | Official support and data deletion request inbox |
| `DEVELOPER_GITHUB` | `https://github.com/lucasphill` | Public source/profile repository |
| `WEBSITE_URL` | `https://klip.app.br` | Official web application URL |
