# API Contract: Google Calendar Integration

**Feature**: `specs/003-google-calendar-integration`
**Base URL**: `http://localhost:5145/api/Integrations/GoogleCalendar`

## Endpoints

### 1. Get Auth URL

- **Method**: `GET`
- **Path**: `/api/Integrations/GoogleCalendar/auth-url`
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Response**: `200 OK`
  ```json
  {
    "data": {
      "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
    },
    "message": null,
    "status": true,
    "timestamp": "2026-08-17T21:00:00Z"
  }
  ```

---

### 2. Handle OAuth Callback

- **Method**: `GET`
- **Path**: `/api/Integrations/GoogleCalendar/callback`
- **Query Parameters**:
  - `code`: string (authorization code)
  - `state`: string (optional state parameter)
  - `error`: string (optional error message if user denied)
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Response**: `200 OK`

---

### 3. Get Integration Status

- **Method**: `GET`
- **Path**: `/api/Integrations/GoogleCalendar/status`
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Response**: `200 OK`
  ```json
  {
    "data": {
      "isConnected": true,
      "accountEmail": "user@example.com",
      "connectedAtUtc": "2026-08-17T18:30:00Z"
    },
    "message": null,
    "status": true,
    "timestamp": "2026-08-17T21:00:00Z"
  }
  ```
- **Disconnected Response**:
  ```json
  {
    "data": {
      "isConnected": false,
      "accountEmail": null,
      "connectedAtUtc": null
    },
    "message": null,
    "status": true,
    "timestamp": "2026-08-17T21:00:00Z"
  }
  ```

---

### 4. Disconnect Google Calendar

- **Method**: `DELETE`
- **Path**: `/api/Integrations/GoogleCalendar`
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Response**: `200 OK`
  ```json
  {
    "data": true,
    "message": "Google Calendar integration disconnected successfully",
    "status": true,
    "timestamp": "2026-08-17T21:00:00Z"
  }
  ```
