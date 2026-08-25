# UI Contract: Task Notes Indicator & Popover (`TaskNotePopover`)

**Feature**: `specs/010-task-notes-overdue-indicators`
**Date**: 2026-08-25

## 1. Trigger Button Specification

- **Container**: `TaskTable.tsx` title column cell (alongside `TaskTitleInput`, Google Calendar badge, and `Subtarefa` pill).
- **Element**:
  ```tsx
  <TaskNotePopover
    taskId={task.id}
    taskTitle={task.title}
    notes={task.notes}
    onSave={(nextNotes) => saveTaskField(task.id, { notes: nextNotes })}
  />
  ```

### Visual States

1. **Active State (Has Notes)**:
   - Condition: `Boolean(task.notes && task.notes.trim().length > 0)`
   - Visibility: Always visible (`opacity-100`)
   - Style:
     ```tsx
     <span className="shrink-0 inline-flex items-center justify-center p-1 rounded-md text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors">
       <StickyNote className="w-3.5 h-3.5" />
     </span>
     ```
   - Tooltip: `title={task.notes}` ou `title="Ver / editar anotações"`
   - Accessibility: `aria-label="Ver ou editar anotações da tarefa"`

2. **Inactive / Empty State (No Notes)**:
   - Condition: `!task.notes || task.notes.trim().length === 0`
   - Visibility: Hidden by default, visible on row hover or keyboard focus:
     ```tsx
     <span className="shrink-0 inline-flex items-center justify-center p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-soft)] opacity-0 group-hover/task-row:opacity-100 focus-visible:opacity-100 transition-opacity">
       <StickyNote className="w-3.5 h-3.5" />
     </span>
     ```
   - Tooltip: `title="Adicionar anotação"`
   - Accessibility: `aria-label="Adicionar anotação à tarefa"`

---

## 2. Popover Content Specification

- **Primitives**: `@/components/ui/popover` (`Popover`, `PopoverTrigger`, `PopoverContent`).
- **Popover Header / Title**: "Anotações da Tarefa" (com subtítulo com o nome da tarefa truncado).
- **Input Field**:
  - Component: `Textarea` do shadcn/ui.
  - Placeholder: `"Escreva notas ou observações para esta tarefa..."`.
  - Max Height: `max-h-60 overflow-y-auto`.
  - Auto-focus: Foco automático no textarea ao abrir o popover.
- **Actions / Buttons**:
  - "Cancelar": Variante `ghost`, fecha o popover e descarta edições não salvas.
  - "Salvar": Variante `default` (cor de destaque do tema), aciona `onSave`, exibe estado de loading/spinner se assíncrono e fecha o popover após sucesso.
- **Keyboard Shortcuts**:
  - `Escape`: Fecha o popover sem salvar.
  - `Ctrl+Enter` / `Cmd+Enter`: Submete o formulário / salva a nota imediatamente.
