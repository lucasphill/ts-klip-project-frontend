# Contract: User Deletion API (`DELETE /api/Users/me`)

## Endpoint Specification

- **HTTP Method**: `DELETE`
- **Path**: `/api/Users/me`
- **Authentication**: Required (`Bearer <Auth0_Access_Token>`)
- **Content-Type**: `application/json`

### Request Headers
```http
DELETE /api/Users/me HTTP/1.1
Host: api.klip.app.br
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

### Request Body
None.

---

## Responses

### 200 OK — Successful Deletion
```json
{
  "data": true,
  "message": "User and associated data deleted successfully.",
  "status": true,
  "timestamp": "2026-08-23T15:30:00.000Z"
}
```

### 400 Bad Request — Deletion Failed
```json
{
  "data": false,
  "message": "Unable to delete user.",
  "status": false,
  "timestamp": "2026-08-23T15:30:00.000Z"
}
```

### 401 Unauthorized — Missing / Expired Token
```json
{
  "type": "string",
  "message": "Unauthorized"
}
```
