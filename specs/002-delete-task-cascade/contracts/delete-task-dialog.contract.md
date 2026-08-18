# Contract: Delete Task Modal Component

**Feature**: `002-delete-task-cascade`  
**Component**: `DeleteTaskModal` (`src/components/DeleteTaskModal.tsx`)

## Interface & Props

```typescript
export interface DeleteTaskTarget {
  id: string;
  title: string;
  subtaskCount: number;
}

export interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: DeleteTaskTarget | null;
  onConfirm: (taskId: string, cascade?: boolean) => Promise<boolean | void>;
}
```

## Behavior Specifications

1. **When `task.subtaskCount === 0` (Simple Task)**:
   - Header title: "Excluir Tarefa"
   - Body description: "Tem certeza que deseja excluir a tarefa \"{task.title}\"? Esta ação não pode ser desfeita."
   - Controls:
     - "Cancelar" button (ghost/outline variant)
     - "Excluir" button (destructive variant)
   - On clicking "Excluir", calls `onConfirm(task.id, undefined)` (or `cascade: false`).

2. **When `task.subtaskCount > 0` (Task with Subtasks)**:
   - Header title: "Excluir Tarefa com Subtarefas"
   - Body description: "A tarefa \"{task.title}\" possui {task.subtaskCount} subtarefa(s). Escolha como deseja prosseguir:"
   - Selection Options (Interactive Cards or Radio Group):
     - **Opção 1 (Cascata)**: "Excluir tarefa e todas as subtarefas"
       - Subtitle: "Remove a tarefa principal e suas {subtaskCount} subtarefas permanentemente."
     - **Opção 2 (Desvincular)**: "Excluir apenas o pai e manter subtarefas"
       - Subtitle: "Remove a tarefa principal e mantém as subtarefas como tarefas avulsas no projeto."
   - Controls:
     - "Cancelar" button
     - "Confirmar Exclusão" button (destructive variant)
   - On clicking "Confirmar Exclusão", calls `onConfirm(task.id, selectedOption === 'cascade')`.

3. **Loading & Accessibility**:
   - Disables all action buttons and shows a spinner / loading state on the confirm button during asynchronous deletion.
   - Handles Escape key to close.
   - Traps focus inside the modal while open.
