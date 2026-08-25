# Data Model: Indicador de Notas e Destaque de Tarefas Vencidas

**Feature**: `specs/010-task-notes-overdue-indicators`
**Date**: 2026-08-25

## Entities & Interfaces

### 1. Task DTO Interfaces (`src/types/apiTypes.ts` e `src/types/types.ts`)

```typescript
export interface GetTasksDto {
  id: string;
  title: string;
  dueDate?: string;
  isCompleted?: boolean;
  notes?: string;
  parentTaskId?: string | null;
  parent_task_id?: string | null;
  createdAt?: string;
  googleCalendarEventId?: string | null;
  google_calendar_event_id?: string | null;
}

export interface CreateTaskDto {
  title: string;
  dueDate?: string;
  isCompleted?: boolean;
  notes?: string;
  parentTaskId?: string | null;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  isCompleted: boolean;
  ownerAuth0Id: string;
  parentTaskId?: string;
  projectId?: string;
}
```

- **Regras de Validação e Formato**:
  - `notes`: Texto livre (`string`). Pode ser `undefined`, `null` ou string vazia quando não há notas associadas. O salvamento com texto vazio deve normalizar para `undefined` ou string vazia limpa.
  - `dueDate`: Data no formato `YYYY-MM-DD` (ou string ISO `YYYY-MM-DDTHH:mm:ss`). Normalizada para `YYYY-MM-DD` para apresentação e comparações.

---

### 2. Modelo de Estado de Vencimento (`OverdueState`)

```typescript
export interface TaskOverdueInfo {
  isOverdue: boolean;
  daysOverdue?: number;
}

/**
 * Determina se uma tarefa está vencida com base na data local do navegador.
 *
 * @param dueDate Data limite no formato YYYY-MM-DD ou ISO string
 * @param isCompleted Status de conclusão da tarefa
 * @returns true se a tarefa não estiver concluída e a data for estritamente anterior a hoje
 */
export function isTaskOverdue(dueDate?: string | null, isCompleted?: boolean): boolean {
  if (isCompleted || !dueDate) return false;
  
  const normalized = dueDate.trim().split("T")[0];
  if (!normalized) return false;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  return normalized < today;
}
```

---

### 3. Modelo de Componente do Balão de Notas (`TaskNotePopover`)

```typescript
export interface TaskNotePopoverProps {
  taskId: string;
  taskTitle: string;
  notes?: string;
  onSave: (notes: string) => Promise<void> | void;
  disabled?: boolean;
}
```

- **Estados Visuais**:
  - `hasNotes`: `Boolean(notes && notes.trim().length > 0)`
  - `isHovered / isFocused`: Controlado via classes CSS (`group-hover:opacity-100 focus-visible:opacity-100`)
