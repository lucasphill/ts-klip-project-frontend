# Implementation Plan: Task Notes Markdown Rich Editor

**Branch**: `015-task-notes-markdown-editor` | **Date**: 2026-08-31 | **Spec**: [spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/015-task-notes-markdown-editor/spec.md)

**Input**: Feature specification from `/specs/015-task-notes-markdown-editor/spec.md`

## Summary

Transform the existing plain text task notes field into a visual, rich Markdown WYSIWYG editor using Plate.js tailored for shadcn/ui and Tailwind CSS. The editor enables live markdown shortcuts (e.g., `- ` for bullets, `[] ` for checklists), text marks (bold, italic, strikethrough, headings H1-H3, links), and an accessible compact toolbar. The content is seamlessly serialized to and deserialized from standard Markdown strings without requiring any backend schema or API changes. The rich editor will be integrated into the quick table row popover (`TaskNotePopover`) and the task creation/editing sheet (`AddTaskModal`), maintaining full backward compatibility with legacy plain text notes.

## Technical Context

**Language/Version**: TypeScript 5.9.x, React 19.2.0  
**Primary Dependencies**: Plate.js (`@platejs/core`, `@platejs/markdown`, `@platejs/basic-nodes` or `@udecode/plate`), Radix UI, Tailwind CSS v4, Lucide React  
**Storage**: N/A on client (Persisted via existing REST API `notes?: string` field in UTF-8 Markdown)  
**Testing**: ESLint (`npm run lint`), TypeScript build (`npm run build`), Manual browser validation with DevTools / Chrome MCP  
**Target Platform**: Modern desktop & mobile web browsers  
**Project Type**: React Single Page Application (SPA with Vite)  
**Performance Goals**: <50ms keystroke/input response time, instant markdown shortcut conversion, zero lag when opening popovers/modals  
**Constraints**: 
- Zero backend database schema or API endpoint modifications.
- 100% backward compatibility with existing legacy plain text notes.
- Strictly adhere to dependency installation governance (ask explicit user authorization before running `npm install`).
- Full support for Klip dark and light themes using CSS variables.

## Constitution Check

*GATE: Passed before Phase 0 research. Re-evaluated post Phase 1 design.*

- **Principle I: Type-Safe, Maintainable Frontend**:
  - Encapsulate rich text editor in a standalone reusable component with explicit TypeScript interfaces ([contracts/editor-contract.ts](file:///D:/Dev/ts-klip-project-frontend/specs/015-task-notes-markdown-editor/contracts/editor-contract.ts)).
  - Reuse shared shadcn/ui and Radix UI primitives.
  - Status: **PASS** ✅

- **Principle II: Accessible and Consistent User Experience**:
  - Full keyboard accessibility: standard shortcuts (`Ctrl+B`, `Ctrl+I`), Markdown triggers (`- `, `1. `, `[] `), `Ctrl+Enter` save, `Escape` cancel.
  - Toolbar buttons with descriptive `aria-label`s and visual active states.
  - Styled with established Tailwind CSS tokens (`var(--brand)`, `var(--bg-soft)`, `var(--border-subtle)`).
  - Status: **PASS** ✅

- **Principle III: Reliable Authentication, Data Boundaries and Privacy**:
  - Preserves existing Auth0 authentication and centralized API services (`src/services/api.ts`).
  - No credentials or unauthorized data persisted in local browser storage.
  - Status: **PASS** ✅

- **Principle IV: Verified Behavior Before Merge**:
  - Every change verified by `npm run lint` and `npm run build`.
  - Manual testing scenario walkthrough documented in [quickstart.md](file:///D:/Dev/ts-klip-project-frontend/specs/015-task-notes-markdown-editor/quickstart.md).
  - Status: **PASS** ✅

- **Principle V: Simple, Performant State and UI**:
  - Editor maintains internal state without firing unnecessary top-level React re-renders on every keystroke.
  - Deserialization and serialization happen on mount/save boundaries.
  - Status: **PASS** ✅

## Project Structure

### Documentation (this feature)

```text
specs/015-task-notes-markdown-editor/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 research & technology decisions
├── data-model.md        # Phase 1 domain and editor node structure
├── quickstart.md        # Phase 1 validation and verification guide
├── checklists/
│   └── requirements.md  # Quality checklist
└── contracts/
    ├── editor-contract.ts   # Reusable editor interface contract
    └── popover-contract.ts  # TaskNotePopover interface contract
```

### Source Code Layout

```text
src/
├── components/
│   ├── ui/
│   │   ├── markdown-editor/    # (NEW) Reusable Plate.js rich text editor & toolbar
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   └── markdownUtils.ts
│   ├── TaskNotePopover.tsx     # (MODIFIED) Integrated rich editor, ~400px width, Ctrl+Enter save
│   └── AddTaskModal.tsx        # (MODIFIED) Replaced plain Textarea with MarkdownEditor
├── lib/
│   └── markdown.ts             # (NEW) Helpers for markdown stripping, sanitization and serialization
└── types/
    └── types.ts                # (EXISTING) Preserved Task domain types
```

**Structure Decision**: Single React SPA project structure. The new Markdown editor is placed in `src/components/ui/markdown-editor/` for maximum modularity and reusability, with helper utilities in `src/lib/markdown.ts`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| None | All requirements fit directly within existing architecture and design constraints. | N/A |
