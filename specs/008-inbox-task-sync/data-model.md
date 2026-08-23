# Data Model & Sync Flow: Sincronização de Tarefas de Projetos no Inbox

**Feature**: `008-inbox-task-sync` | **Date**: 2026-08-23

## 1. Fluxo de Sincronização de Tarefas (Data Flow)

```mermaid
sequenceDiagram
    autonumber
    actor UserOrMCP as Usuário / MCP Client
    participant Backend as Backend API (ASP.NET Core)
    participant TasksCtx as TasksContext (React)
    participant ProjectsPage as ProjectsPage
    participant HomePage as HomePage (Inbox)

    alt Criação via MCP
        UserOrMCP->>Backend: POST /api/tasks & POST /api/ProjectsTasks/assign
        Backend-->>UserOrMCP: 200 OK (Task criada e vinculada ao Projeto)
        UserOrMCP->>HomePage: Navega para Inbox / Foca Janela
        HomePage->>TasksCtx: fetchTasks({ force: true })
        TasksCtx->>Backend: GET /api/tasks/with-universal-custom-fields
        Backend-->>TasksCtx: Lista atualizada de tarefas ativas
        HomePage->>Backend: GET /api/ProjectsTasks/project/{id}/tasks (para cada projeto)
        Backend-->>HomePage: Vínculos atualizados
        HomePage-->>UserOrMCP: Renderiza nova tarefa com badge do projeto
    else Criação via UI do Projeto
        UserOrMCP->>ProjectsPage: Cria tarefa no AddTaskModal
        ProjectsPage->>Backend: POST /api/tasks & POST /api/ProjectsTasks/assign
        Backend-->>ProjectsPage: 200 OK
        ProjectsPage->>TasksCtx: appendTask(createdTask) & fetchTasks({ force: true })
        ProjectsPage-->>UserOrMCP: Atualiza tabela do projeto
        UserOrMCP->>HomePage: Clica em "Inbox"
        HomePage-->>UserOrMCP: Tarefa já disponível imediatamente em memória
    end
```

---

## 2. Entidades Envolvidas e Estado

### Estado em `TasksContext`
```typescript
interface TasksContextValue {
  tasks: GetTasksWithCustomFieldsDto[];
  fetchTasks: (options?: { force?: boolean }) => Promise<void>;
  appendTask: (task: GetTasksWithCustomFieldsDto) => void;
  updateTaskLocal: (taskId: string, updates: Partial<GetTasksWithCustomFieldsDto>) => void;
  removeTaskLocal: (taskId: string) => void;
  removeTasksLocal: (taskIds: string[]) => void;
}
```

### Estado de Vínculos em `HomePage`
```typescript
interface ProjectTaskAssignment {
  project_id: string;
  task_id: string;
}
```
