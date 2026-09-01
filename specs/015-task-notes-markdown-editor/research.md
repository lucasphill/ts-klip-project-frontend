# Research: Task Notes Markdown Rich Editor

**Feature**: Task Notes Markdown Rich Editor  
**Branch**: `015-task-notes-markdown-editor`  
**Date**: 2026-08-31  

## Executive Summary

The task notes feature currently stores and presents plain multi-line text strings. Users need rich text capabilities (specifically bullet lists, numbered lists, interactive checklists/todo items, bold, italic, strikethrough, headings H1-H3, and links) with live markdown shortcuts (e.g., `- ` for bullets, `[] ` for checklists) and an accessible toolbar. To maintain zero backend schema and API changes, the rich content is serialized to and deserialized from standard GitHub Flavored Markdown (GFM) strings on the client.

## Technical Unknowns & Decisions

### Decision 1: Rich Text Framework Selection

- **Decision**: Use **Plate.js** (`@udecode/plate` / `platejs` ecosystem tailored for shadcn/ui and React 19).
- **Rationale**: 
  - The project is built on **React 19**, **Tailwind CSS v4**, and **shadcn/ui** design patterns with Radix UI.
  - Plate.js is built specifically to integrate seamlessly with shadcn/ui components and primitives, allowing custom styling using existing theme tokens (`var(--brand)`, `var(--bg-soft)`, `var(--border-subtle)`).
  - Plate.js provides built-in markdown shortcuts (auto-formatting on input), GFM task list / checklist support, and serialization plugins (`@platejs/markdown`).
- **Alternatives Considered**:
  - *TipTap / ProseMirror*: Excellent WYSIWYG editor with markdown extensions, but has higher styling overhead to match shadcn/ui radix-nova theme and heavier boilerplate.
  - *Simple MDE / EasyMDE*: Raw markdown editor with preview pane; rejected during user alignment in favor of an inline visual WYSIWYG editor.
  - *Slate.js Raw*: Plate is built on Slate.js with pre-configured plugins and TypeScript types; building custom Slate plugins from scratch would require reinventing lists, markdown parsing, and selection management.

### Decision 2: Markdown Serialization & Deserialization Strategy

- **Decision**: Bidirectional serialization using `@platejs/markdown` with `remark-gfm` standard.
- **Rationale**:
  - Serialization converts Plate editor JSON tree to standard Markdown (`- [ ]`, `- [x]`, `*`, `**`, `###`).
  - Deserialization converts Markdown string into Slate/Plate node hierarchy on initial mount or value reset.
  - Existing legacy plain text notes (which contain no markdown tags) parse naturally as standard paragraph nodes without error or corruption.
  - Keeps the backend API contract identical: `notes?: string` (UTF-8 string).
- **Alternatives Considered**:
  - *Storing Plate JSON in backend*: Rejected because the database stores `notes` as a plain string, and storing raw JSON would break any external consumer or potential database export and require migrations.
  - *Storing HTML*: Rejected because Markdown is more compact, human-readable, and matches user requirements.

### Decision 3: Component Architecture and Integration Scope

- **Decision**: Create a dedicated reusable rich editor component `src/components/ui/rich-text-editor.tsx` (or `TaskNoteEditor.tsx`) that encapsulates the Plate editor instance, toolbar, and markdown serialization helpers, and embed it into:
  1. `TaskNotePopover.tsx`: Popover triggered from table rows, updated width to `w-[420px]` (sm: `w-[440px]`), compact toolbar, save button + `Ctrl+Enter` / `Cmd+Enter` shortcut.
  2. `AddTaskModal.tsx`: Task creation and editing sheet/modal replacing the plain `<Textarea />`.
- **Rationale**: Centralizing the editor configuration in a reusable component guarantees consistency across views, isolates Plate dependencies, and ensures high performance without leaking Plate internal state to outer forms until save/change events.
- **Alternatives Considered**:
  - *Separate editors for modal and popover*: Rejected to prevent code duplication and inconsistent formatting behaviors.

### Decision 4: Table Row Note Tooltip & Hover Card

- **Decision**: Strip markdown formatting punctuation (e.g., `#`, `**`, `- [ ]`, `~~`) using a lightweight utility `stripMarkdown(notes)` when generating the `title` / `aria-label` attribute on the table row icon button.
- **Rationale**: Native browser tooltips (`title` attribute) do not render HTML or Markdown. Stripping punctuation gives users a clean, readable text summary on hover.
- **Alternatives Considered**:
  - *Rich Popover on Hover*: Too intrusive when navigating rows with the mouse; clicking to open the popover is the established Klip UX pattern.

### Decision 5: Dependency Management & Governance Compliance

- **Decision**: Identify necessary npm packages (`platejs`, `@platejs/markdown`, `@platejs/basic-nodes`, etc.), document exact versions compatible with React 19 in `plan.md`, and request explicit user authorization before running `npm install` during implementation per project standards.
- **Rationale**: Adheres strictly to the project rule: *"Proibido instalar novas dependências automaticamente. Sempre peça autorização explícita ao usuário antes de executar comandos como npm install ou npm i."*

## Best Practices & Patterns

1. **Uncontrolled Plate State inside Editor**: Plate uses an internal Slate store. To avoid re-render lag and cursor jumping, local keystrokes update internal editor state, and the parent is notified on change or explicit save (`handleSave()`).
2. **Accessible Toolbar**: Use Radix UI toolbar primitives with keyboard arrow navigation, active state highlights, and `aria-label`s.
3. **Keyboard Shortcuts**: Support standard Markdown shortcuts (`- `, `1. `, `[] `, `**`, `*`, `### `) and command keys (`Ctrl+B`, `Ctrl+I`, `Ctrl+Enter`).
4. **Clean Fallbacks**: If empty or whitespace-only, serialize to `undefined` or `""` so tasks without notes don't store empty markdown tags.
