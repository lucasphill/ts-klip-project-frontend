# API Contract: Sincronização de Tarefas e Projetos

**Feature**: `008-inbox-task-sync` | **Date**: 2026-08-23

## 1. Endpoints de Sincronização

### A. Listagem de Tarefas Ativas com Campos Customizados
- **Method**: `GET`
- **Path**: `/api/Tasks/with-universal-custom-fields`
- **Query Params**: Nenhum (por padrão exclui tarefas de projetos arquivados)
- **Response 200 OK**:
```json
{
  "status": true,
  "message": "Tarefas recuperadas com sucesso",
  "data": [
    {
      "id": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
      "title": "Implementar módulo de faturamento",
      "isCompleted": false,
      "dueDate": "2026-08-30",
      "parentTaskId": null,
      "createdAt": "2026-08-23T17:00:00Z",
      "customFields": {}
    }
  ],
  "timestamp": "2026-08-23T17:00:00Z"
}
```

---

### B. Listagem de Tarefas por Projeto (Vínculos)
- **Method**: `GET`
- **Path**: `/api/ProjectsTasks/project/{projectId}/tasks`
- **Response 200 OK**:
```json
{
  "status": true,
  "message": "Tarefas do projeto recuperadas com sucesso",
  "data": [
    {
      "id": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
      "title": "Implementar módulo de faturamento"
    }
  ],
  "timestamp": "2026-08-23T17:00:00Z"
}
```
