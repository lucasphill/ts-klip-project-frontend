# UI Contract: Task Overdue Highlight (`DatePickerField` / `TaskTable`)

**Feature**: `specs/010-task-notes-overdue-indicators`
**Date**: 2026-08-25

## 1. Due Date Column Cell Specification

- **Container**: `TaskTable.tsx` due date column cell (`id: "dueDate"`).
- **Condition**: `const isOverdue = isTaskOverdue(task.dueDate, task.isCompleted);`

### Visual States

1. **Pending Overdue State (`isOverdue === true`)**:
   - Condition: `!task.isCompleted && normalizeDate(task.dueDate) < todayDateString`
   - Target Element: `DatePickerField` button trigger
   - Classes / Styling:
     ```tsx
     buttonClassName={cn(
       "field h-7 flex-1 bg-transparent hover:bg-[var(--bg-soft)] text-sm border-transparent focus:bg-[var(--bg-soft-strong)] focus:border-[var(--border-subtle)] px-2 rounded transition-colors text-left",
       isOverdue
         ? "text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300"
         : "text-[var(--text-primary)]"
     )}
     ```
   - Icon: Nenhum ícone de alerta extra adicionado na célula (mantém apenas o ícone padrão de calendário neutro ou colorido com a cor do texto do seletor).

2. **Completed State (`task.isCompleted === true`)**:
   - Condition: `task.isCompleted === true`
   - Styling: Estilização padrão de item concluído (`text-[var(--text-muted)] line-through`). O destaque avermelhado é desativado.

3. **Standard On-Time / Future State (`isOverdue === false`)**:
   - Condition: `task.dueDate >= todayDateString`
   - Styling: Cor padrão neutra de texto (`text-[var(--text-primary)]`).

4. **Empty Due Date State (`!task.dueDate`)**:
   - Condition: `!task.dueDate`
   - Styling: Placeholder padrão `"Sem prazo"` com texto atenuado (`text-slate-400`).
