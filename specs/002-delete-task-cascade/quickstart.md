# Quickstart: Task Deletion Choice Validation Guide

**Feature**: `002-delete-task-cascade`  
**Date**: 2026-08-17

## Prerequisites

1. Local frontend dev server running:
   ```bash
   npm run dev
   ```
2. Klip backend running on configured port (e.g. `http://localhost:5030/api`).
3. Authenticated test session or mock API.

## End-to-End Validation Scenarios

### Scenario 1: Delete Simple Task (No Subtasks)
1. Navigate to the Tasks list (`/`).
2. Locate or create a task without subtasks: "Tarefa Simples de Teste".
3. Click the delete (trash) action on the task row.
4. **Expected Outcome**:
   - The `DeleteTaskModal` opens.
   - Shows simple confirmation text without subtask choice toggles.
   - Clicking "Excluir" calls `DELETE /Tasks/{id}` and removes the task row immediately.

### Scenario 2: Cascade Delete (Parent + Subtasks)
1. Create a parent task "Tarefa Principal Alfa".
2. Add two subtasks: "Subtarefa 1" and "Subtarefa 2".
3. Click the delete action on "Tarefa Principal Alfa".
4. **Expected Outcome**:
   - The `DeleteTaskModal` opens showing "2 subtarefa(s)".
   - Select option: "Excluir tarefa e todas as subtarefas".
   - Click "Confirmar Exclusão".
   - Network request is sent: `DELETE /Tasks/{id}?cascade=true`.
   - Both the parent task and the 2 subtasks disappear from the task table.

### Scenario 3: Detach Delete (Parent deleted, Subtasks promoted to Standalone)
1. Create a parent task "Tarefa Principal Beta".
2. Add two subtasks: "Subtarefa Beta 1" and "Subtarefa Beta 2".
3. Click the delete action on "Tarefa Principal Beta".
4. **Expected Outcome**:
   - The `DeleteTaskModal` opens showing "2 subtarefa(s)".
   - Select option: "Excluir apenas o pai e manter subtarefas".
   - Click "Confirmar Exclusão".
   - Network request is sent: `DELETE /Tasks/{id}?cascade=false`.
   - "Tarefa Principal Beta" is removed from the table.
   - "Subtarefa Beta 1" and "Subtarefa Beta 2" remain visible as top-level standalone tasks.

### Scenario 4: Cancel Deletion
1. Open the delete modal on any task.
2. Click "Cancelar" or press `Escape`.
3. **Expected Outcome**:
   - The modal closes without making any network requests or UI state changes.

### Automated Checks
```bash
npm run lint
npm run build
```
