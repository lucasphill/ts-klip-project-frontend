# API Contract: Ciclo de Vida e Exclusão de Projetos (`/api/projects`)

**Feature**: `007-project-organization-lifecycle` | **Date**: 2026-08-23

## 1. Endpoints

### A. Listar Projetos (Ativos ou Arquivados)
- **Method**: `GET`
- **Path**: `/api/projects` ou `/api/Projects`
- **Query Parameters**:
  - `archived`: boolean (opcional, default `false`).
    - Se omitido ou `false`: Retorna apenas projetos ativos.
    - Se `true`: Retorna apenas projetos arquivados.
- **Security**: Bearer JWT (Auth0)
- **Response 200 OK**:
```json
{
  "status": true,
  "message": "Projetos recuperados com sucesso",
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Projeto Concluído Q1",
      "description": "Finalizado em Março",
      "color": "#708142",
      "groupId": null,
      "isArchived": true,
      "archivedAt": "2026-08-23T15:30:00Z",
      "createdAt": "2026-01-10T10:00:00Z"
    }
  ],
  "timestamp": "2026-08-23T17:05:00Z"
}
```

---

### B. Arquivar Projeto
- **Method**: `PATCH`
- **Path**: `/api/projects/{id}/archive` ou `/api/Projects/{id}/archive`
- **Security**: Bearer JWT (Auth0)
- **Response 200 OK**:
```json
{
  "status": true,
  "message": "Projeto arquivado com sucesso",
  "data": true,
  "timestamp": "2026-08-23T17:06:00Z"
}
```

---

### C. Desarquivar Projeto
- **Method**: `PATCH`
- **Path**: `/api/projects/{id}/unarchive` ou `/api/Projects/{id}/unarchive`
- **Security**: Bearer JWT (Auth0)
- **Response 200 OK**:
```json
{
  "status": true,
  "message": "Projeto desarquivado com sucesso",
  "data": true,
  "timestamp": "2026-08-23T17:07:00Z"
}
```

---

### D. Excluir Projeto com Política de Tarefas
- **Method**: `DELETE`
- **Path**: `/api/projects/{id}` ou `/api/Projects/{id}`
- **Query Parameters**:
  - `deleteTasks`: boolean (opcional, default `false`).
    - `false` (Padrão): Remove o projeto e desvincula as tarefas (tornando-as avulsas sem projeto).
    - `true` (Cascata): Remove o projeto e exclui em cascata todas as tarefas vinculadas, campos customizados e eventos do Google Calendar.
- **Security**: Bearer JWT (Auth0)
- **Response 200 OK**:
```json
{
  "status": true,
  "message": "Projeto excluído com sucesso",
  "data": true,
  "timestamp": "2026-08-23T17:08:00Z"
}
```
