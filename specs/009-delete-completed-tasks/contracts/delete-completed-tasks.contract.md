# API Contract: DELETE /api/Tasks/completed

**Feature Branch**: `009-delete-completed-tasks` | **Date**: 2026-08-25

## 1. Endpoint Overview

Permanently removes all completed tasks for the authenticated user, optionally scoped to a single project.

```http
DELETE /api/Tasks/completed
```

### Headers

| Header | Type | Required | Description |
|---|---|---|---|
| `Authorization` | `string` | Yes | Bearer Auth0 Access Token |
| `Content-Type` | `string` | No | `application/json` |

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `projectId` | `string` (UUID) | No | When provided, limits deletion strictly to completed tasks associated with this project ID. If omitted, deletes all completed tasks across the user's account. |

---

## 2. Response Specifications

### 2.1 Success Response (200 OK)

```json
{
  "data": {
    "deletedCount": 4,
    "deletedTaskIds": [
      "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "9bc2f64a-2512-4217-a123-1d963f66bba1",
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "f0e1d2c3-b4a5-9687-0123-456789abcdef"
    ]
  },
  "status": true,
  "message": "Tarefas completas excluídas com sucesso"
}
```

### 2.2 Error Responses

#### 400 Bad Request
```json
{
  "data": null,
  "status": false,
  "message": "Identificador de projeto inválido ou erro no processamento"
}
```

#### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

---

## 3. TypeScript Client Definition

```typescript
// src/services/api.ts

export const tasksApi = {
  // ... existing methods
  deleteCompleted: async (projectId?: string) => {
    const response = await api.delete<ResponseModelDto<DeleteCompletedTasksResponseDto>>(
      '/Tasks/completed',
      {
        params: projectId ? { projectId } : undefined,
      }
    );
    return response.data;
  },
};
```
