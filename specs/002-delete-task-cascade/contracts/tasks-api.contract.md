# Contract: Tasks API Deletion Endpoint

**Feature**: `002-delete-task-cascade`  
**Protocol**: HTTP REST

## Endpoint: `DELETE /api/Tasks/{id}`

Deletes a task by ID with optional cascade behavior for child subtasks.

### Request

- **HTTP Method**: `DELETE`
- **URL Path**: `/Tasks/{id}`
- **Query Parameters**:
  - `cascade` (optional, boolean):
    - `true`: Recursively delete the task and all descendant subtasks.
    - `false`: Delete only the parent task and unlink its subtasks, promoting them to root-level standalone tasks.
    - *(omitted)*: Standard task deletion behavior (equivalent to false or default for simple tasks).

### Request Headers

- `Authorization: Bearer <auth0_access_token>`
- `Content-Type: application/json`

### Responses

#### 200 OK / 204 No Content
Task (and subtasks if cascade) successfully deleted.
```json
{
  "status": true,
  "data": true,
  "message": "Task removed successfully"
}
```

#### 400 Bad Request / 404 Not Found / 500 Internal Server Error
Standard error response model.
```json
{
  "status": false,
  "data": null,
  "message": "Error details..."
}
```

### TypeScript Service Definition

```typescript
export const tasksApi = {
  // ... other methods ...
  remove: async (taskId: string, cascade?: boolean): Promise<ResponseModelDto<unknown>> => {
    const response = await api.delete<ResponseModelDto<unknown>>(`/Tasks/${taskId}`, {
      params: cascade !== undefined ? { cascade } : undefined,
    });
    return response.data;
  },
};
```
