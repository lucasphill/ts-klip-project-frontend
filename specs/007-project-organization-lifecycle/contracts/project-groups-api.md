# API Contract: Grupos de Projetos (`/api/project-groups`)

**Feature**: `007-project-organization-lifecycle` | **Date**: 2026-08-23

## 1. Endpoints

### A. Listar Grupos do Usuário
- **Method**: `GET`
- **Path**: `/api/project-groups` ou `/api/ProjectGroups`
- **Security**: Bearer JWT (Auth0)
- **Response 200 OK**:
```json
{
  "status": true,
  "message": "Grupos recuperados com sucesso",
  "data": [
    {
      "id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
      "name": "Trabalho",
      "color": "#2f6fb2",
      "icon": "briefcase",
      "orderIndex": 0,
      "createdAt": "2026-08-23T14:00:00Z",
      "projects": [
        {
          "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "name": "Klip Frontend",
          "color": "#2f6fb2",
          "groupId": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
          "isArchived": false,
          "archivedAt": null,
          "createdAt": "2026-08-23T14:05:00Z"
        }
      ]
    }
  ],
  "timestamp": "2026-08-23T17:00:00Z"
}
```

---

### B. Criar Grupo de Projetos
- **Method**: `POST`
- **Path**: `/api/project-groups`
- **Security**: Bearer JWT (Auth0)
- **Request Body**:
```json
{
  "name": "Clientes",
  "color": "#1f9d8f",
  "icon": "users",
  "orderIndex": 1
}
```
- **Response 200 OK**:
```json
{
  "status": true,
  "message": "Grupo criado com sucesso",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "name": "Clientes",
    "color": "#1f9d8f",
    "icon": "users",
    "orderIndex": 1,
    "createdAt": "2026-08-23T17:01:00Z",
    "projects": []
  },
  "timestamp": "2026-08-23T17:01:00Z"
}
```

---

### C. Atualizar Grupo de Projetos
- **Method**: `PUT`
- **Path**: `/api/project-groups/{id}`
- **Security**: Bearer JWT (Auth0)
- **Request Body**:
```json
{
  "name": "Clientes VIP",
  "color": "#d9772b",
  "icon": "star",
  "orderIndex": 1
}
```
- **Response 200 OK**: Retorna o grupo atualizado.

---

### D. Excluir Grupo de Projetos
- **Method**: `DELETE`
- **Path**: `/api/project-groups/{id}`
- **Security**: Bearer JWT (Auth0)
- **Comportamento**: Exclui o grupo e desvincula os projetos para a raiz (`groupId = null`).
- **Response 200 OK**:
```json
{
  "status": true,
  "message": "Grupo excluído e projetos desvinculados com sucesso",
  "data": true,
  "timestamp": "2026-08-23T17:02:00Z"
}
```

---

### E. Reordenar Grupos
- **Method**: `PUT`
- **Path**: `/api/project-groups/reorder`
- **Security**: Bearer JWT (Auth0)
- **Request Body**:
```json
{
  "groupIdsInOrder": [
    "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"
  ]
}
```
- **Response 200 OK**: Confirmação da nova ordem.
