# Quickstart & Verification Guide: Exclusão em Lote de Tarefas Concluídas

**Feature Branch**: `009-delete-completed-tasks` | **Date**: 2026-08-25

## 1. Prerequisites & Setup

1. **Environment Setup**:
   - Ensure the API is accessible at `https://api.klip.app.br/` (or configured `.env` endpoint).
   - Test account credentials (per project standards):
     - **Email:** `teste@email.com`
     - **Password:** `o#mUN9WMKps7rtCGclNu`
2. **Local Server**:
   - Run `npm run dev` and navigate to `http://localhost:5173`.

---

## 2. End-to-End Validation Scenarios

### Scenario 1: Exclusão Global de Tarefas Concluídas nas Configurações

1. **Setup**:
   - Create 2 tasks in Project A and mark 1 as completed.
   - Create 2 tasks in Project B and mark 2 as completed.
   - Create 1 standalone task in Inbox and mark it as completed.
   - Total completed: 4 tasks across the account.
2. **Execution**:
   - Navigate to `/settings/profile`.
   - Scroll to the "Zona de Perigo" (Danger Zone) card.
   - Locate the card/button "Excluir Tarefas Concluídas" and click it.
   - Confirm that the modal opens with title "Excluir Tarefas Concluídas" and a red/amber warning box.
   - Type `abc` and check that the "Excluir Tarefas Concluídas" confirmation button remains disabled.
   - Type `DELETAR` and verify the confirmation button becomes enabled.
   - Click "Excluir Tarefas Concluídas" (or press `Enter`).
3. **Verification**:
   - Button shows a loading spinner during the request.
   - A success toast is displayed: `"4 tarefas concluídas foram excluídas com sucesso."` (or similar).
   - Navigate back to the Inbox and to Projects A and B: verify that none of the 4 completed tasks are displayed anymore, and pending tasks are intact.

---

### Scenario 2: Exclusão de Tarefas Concluídas em Projeto Específico

1. **Setup**:
   - In Project A, create 2 pending tasks and 2 completed tasks.
   - In Project B, create 1 completed task.
2. **Execution**:
   - Open Project A (`/project/:projectId`).
   - In the top header bar (next to "Gerenciar campos"), click the "Limpar concluídas" / "Excluir tarefas concluídas" button.
   - Check that the modal mentions Project A by name.
   - Type `DELETAR` into the input field and submit.
3. **Verification**:
   - Success toast appears: `"2 tarefas concluídas foram excluídas com sucesso."`.
   - Project A now only lists the 2 pending tasks.
   - Navigate to Project B: verify that its completed task was NOT deleted.

---

### Scenario 3: Projeto sem Tarefas Concluídas

1. **Execution**:
   - Open a project that contains only pending tasks (0 completed tasks).
   - Click the cleanup button in the header.
   - Type `DELETAR` and confirm.
2. **Verification**:
   - API returns `deletedCount: 0`.
   - Toast notifies the user: `"Nenhuma tarefa concluída foi encontrada para exclusão."` (or `"0 tarefas concluídas foram excluídas."`).
   - No errors or UI breakage occurs.

---

## 3. Automated Quality Verification Commands

```bash
# 1. Run linter checks
npm run lint

# 2. Run TypeScript build verification
npm run build
```
