# Feature Specification: Task Notes Markdown Rich Editor

**Feature Branch**: `015-task-notes-markdown-editor`

**Created**: 2026-08-31

**Status**: Ready for Planning

**Input**: User description: "atualmente temos o campo de notas dentro de tarefas e é um texto puro. quero transformar esse texto puro e permitir uma formatação apenas no frontend em formato markdown. quero poder editar texto com funções simples de listagem e formatações, acredito que a biblioteca @plate-ui seja mais recomendada pois usamos shadcn. quero funções de adicionar listagens, bullet, checkbox. Me auxilie a amadurecer essa feature. consulte a documentação oficial https://platejs.org/docs/installation/manual."

## Clarifications

### Session 2026-08-31

- Q: Qual deve ser a experiência principal de edição e visualização das notas de tarefas? → A: Editor WYSIWYG visual (Plate.js) com atalhos markdown (ex: digitar `- ` vira bullet, `[] ` vira checkbox), barra de ferramentas leve e salvamento transparente em Markdown no backend.
- Q: Quais elementos e recursos de formatação Markdown devem ser suportados no editor de notas? → A: Essencial + Listas: Negrito, Itálico, Riscado, Lista com marcadores (bullet), Lista numerada, Checklist com caixas de seleção interativas (todo list), Títulos (H1-H3) e Links.
- Q: Onde o editor rico deve estar disponível e como deve se comportar no Popover rápido de tarefas da tabela? → A: Integrar tanto no Popover rápido da tabela (expandindo a largura para ~400px com barra de ferramentas compacta) quanto no Modal/Sheet lateral de criação/edição de tarefas.
- Q: Como deve funcionar o salvamento das alterações no Popover rápido de notas? → A: Salvar explícito via botão 'Salvar' e atalho `Ctrl+Enter`/`Cmd+Enter` no Popover (e via envio padrão do formulário no Modal), preservando o controle do usuário antes de persistir na API.
- Q: Como o tooltip rápido ao passar o mouse sobre o ícone de notas na tabela deve se comportar com conteúdo Markdown e notas legadas? → A: Notas legadas carregam normalmente em texto plano sem alteração de banco, e o tooltip de hover na tabela exibe texto limpo sanitizando marcações especiais de markdown.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Note Editing & Formatting via Table Popover (Priority: P1)

As a user managing tasks in Klip, I want to open the notes popover on any task row and format my notes visually with rich formatting (bullet lists, numbered lists, checklists, bold, italic, strikethrough, headings, and links) using intuitive markdown shortcuts and a lightweight toolbar, so that I can organize task details, checklists, and context clearly and quickly.

**Why this priority**: Task notes are frequently accessed directly from the main task tables (Home, Projects, Month View). Providing an immediate visual WYSIWYG editing experience with markdown shortcuts directly in the table popover delivers the core value of the feature.

**Independent Test**: Can be fully tested by clicking the notes icon on any task row in the table, typing `- [ ] First item` or clicking the checklist toolbar button, entering formatted text, saving with `Ctrl+Enter` or the "Salvar" button, and reopening to verify the formatted content is preserved.

**Acceptance Scenarios**:

1. **Given** an existing or empty task note opened via the table popover, **When** the user types markdown shortcuts (e.g. `- ` for bullet list, `1. ` for numbered list, `[] ` for task checkbox list, or selects text to apply bold/italic/strikethrough/heading/link via toolbar or shortcuts), **Then** the editor immediately renders the formatted visual element in real time.
2. **Given** a user editing notes in the popover, **When** the user clicks "Salvar" or presses `Ctrl+Enter` (or `Cmd+Enter` on macOS), **Then** the content is serialized to standard Markdown and persisted to the task backend, and the popover closes with success feedback.
3. **Given** a user viewing the popover, **When** the user presses `Escape` or clicks "Cancelar", **Then** the popover closes without persisting unsaved modifications.

---

### User Story 2 - Rich Note Editing in Add/Edit Task Sheet & Modal (Priority: P2)

As a user creating a new task or editing all attributes of an existing task in the task details sheet/modal, I want the notes field to provide the same rich Markdown WYSIWYG editor and toolbar as the quick popover, so that I have a consistent authoring experience across the entire application.

**Why this priority**: The Add/Edit Task sheet (`AddTaskModal`) is the primary place for in-depth task authoring. Providing the rich Markdown editor here ensures seamless consistency across all task workflows.

**Independent Test**: Can be fully tested by opening the Add Task or Edit Task sheet, typing formatted notes with headings, bold text, and checklists, submitting the task form, and verifying the notes render correctly in both the task modal and the task popover.

**Acceptance Scenarios**:

1. **Given** the Add Task or Edit Task sheet is open, **When** the user interacts with the notes field, **Then** the user can type and format rich Markdown content with full support for headings (H1-H3), bold, italic, strikethrough, bullet lists, numbered lists, checklist items, and links.
2. **Given** a task is saved through the Add Task or Edit Task form submission, **When** the form is submitted successfully, **Then** the serialized Markdown string is included in the payload and persisted.

---

### User Story 3 - Backward Compatibility with Legacy Plain Text Notes (Priority: P3)

As a user with existing tasks created before this feature, I want all my existing plain text notes to load seamlessly without corruption, loss of formatting, or broken characters, and I want hover tooltips on the task table to remain readable.

**Why this priority**: Protects existing user data and ensures a smooth transition from plain text to rich markdown without requiring database migrations.

**Independent Test**: Can be fully tested by viewing and editing a task that has existing legacy multi-line plain text notes, verifying the text renders cleanly as standard paragraphs in the editor, and saving changes without unexpected mutations.

**Acceptance Scenarios**:

1. **Given** a task with existing plain text notes, **When** the user opens the notes popover or modal, **Then** the plain text is loaded and parsed cleanly into editable paragraph blocks.
2. **Given** a task with formatted markdown notes, **When** the user hovers over the notes icon on the task table, **Then** the hover tooltip presents a clean, readable text preview without raw markup clutter.

---

### Edge Cases

- **Empty / Whitespace-only Notes**: If a user clears all content or leaves only whitespace, saving must persist `null` / `undefined` / empty string cleanly, resetting the task note state and hiding the active note indicator on the table.
- **Large Content / Overflow**: If notes contain extensive text and long checklists, the editor in both the popover (fixed width ~400px) and the modal must provide vertical scrolling with a max-height and custom scrollbar without overflowing the modal viewport.
- **Markdown Paste**: Pasting raw markdown or rich text from external sources (e.g. Notion, GitHub, Google Docs) into the editor should cleanly parse and convert supported elements into active editor nodes.
- **Network / Save Failure**: If saving the note fails (e.g. network offline), the popover remains open, an error toast is shown, and the user's drafted content is not lost.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a visual WYSIWYG editor for task notes powered by Plate.js (tailored for shadcn/ui and TailwindCSS).
- **FR-002**: The editor MUST support essential text formatting marks: **Bold**, *Italic*, ~~Strikethrough~~, and [Hyperlinks].
- **FR-003**: The editor MUST support block elements: Headings (H1, H2, H3), Bullet Lists (unordered), Numbered Lists (ordered), and Interactive Checklists (task lists / todo items).
- **FR-004**: The editor MUST support live markdown input shortcuts (e.g., typing `- ` starts a bullet list, `1. ` starts a numbered list, `[] ` starts a task checklist, `# ` starts H1, `## ` starts H2, `### ` starts H3).
- **FR-005**: The editor MUST include a compact, accessible toolbar for applying formatting, inserting lists, checklists, headings, and links.
- **FR-006**: The editor MUST serialize content to standard Markdown string when saving and deserialize Markdown string into editor nodes upon loading.
- **FR-007**: The quick task note popover (`TaskNotePopover`) MUST integrate the rich editor, providing a comfortable width (~400px), a visual header, keyboard shortcut hint (`Ctrl+Enter` to save, `Esc` to cancel), and explicit Save and Cancel buttons.
- **FR-008**: The task creation and editing sheet (`AddTaskModal`) MUST integrate the rich editor in place of the plain textarea.
- **FR-009**: The system MUST preserve 100% backward compatibility with existing tasks containing plain text notes without requiring backend database schema changes.
- **FR-010**: Table row hover tooltips for task notes MUST display a clean text summary, stripping raw markdown punctuation for readability.

### Key Entities

- **Task**: Represents a task entity in Klip.
  - `id`: string (unique identifier)
  - `title`: string
  - `notes`: string (persisted as standard Markdown text in database, displayed and edited as rich text in the frontend)
  - `dueDate`: string / null
  - `isCompleted`: boolean
  - `parentTaskId`: string / null
  - `projectIds`: string[]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create checklists and bullet lists in task notes with a single click or standard markdown shortcut in under 2 seconds.
- **SC-002**: 100% of existing legacy plain text notes load cleanly in the rich editor without rendering errors or data corruption.
- **SC-003**: Note contents serialize and deserialize bidirectionally without loss of supported formatting (bold, italic, strikethrough, headings, bullet lists, numbered lists, checklists, links).
- **SC-004**: Zero backend schema or API endpoint modifications are required; all rich text parsing and markdown serialization occurs in the frontend client.
- **SC-005**: The editor conforms to project accessibility standards, supporting full keyboard navigation (formatting shortcuts, tab navigation, `Ctrl+Enter` save, `Escape` dismiss).

## Assumptions

- The backend API accepts and returns the `notes` field as a standard UTF-8 string without length or character constraints that would reject CommonMark/GFM markdown.
- Plate.js packages will be configured using standard project dependencies compatible with React 19 and Tailwind CSS.
- Checkbox state changes made within task notes are saved when the user submits the note (via "Salvar" or `Ctrl+Enter`).
- Unsupported markdown constructs (like complex tables or raw HTML) are safely handled and rendered gracefully as plain text or fallback paragraphs without crashing the application.
