# UI Contract: Collapsible Integrations & Google Calendar Card

**Feature**: `specs/003-google-calendar-integration`

## Component Specifications

### 1. Collapsible Integration Container

- **Component**: `CollapsibleCard` or Section Wrapper
- **Props**:
  - `title`: string
  - `description`: string
  - `icon`: ReactNode
  - `badge`?: { text: string; variant: 'success' | 'neutral' | 'warning' }
  - `isOpen`: boolean
  - `onToggle`: () => void
  - `children`: ReactNode
- **Behavior**:
  - Header displays title, icon, summary, badge (if connected), and a collapse/expand toggle button.
  - Smooth animation or instant toggle of content visibility.
  - Full keyboard accessibility (`Enter` / `Space` on toggle).

---

### 2. Google Calendar Integration Card

- **Component**: `GoogleCalendarIntegration`
- **UI States**:
  - **Loading**: Skeleton or loading spinner while checking status.
  - **Disconnected**:
    - Status badge: "Desconectado" (neutral / gray).
    - Description: Explaining two-way or task synchronization with Google Calendar.
    - Action: Button "Conectar com Google Calendar" with Google icon.
  - **Connected**:
    - Status badge: "Conectado" (emerald / green).
    - Details: Display linked account email (e.g. `user@gmail.com`) and connection date formatted via `date-fns` (pt-BR).
    - Action: Button "Desconectar" (destructive / outline red) triggering confirmation modal.
  - **Disconnect Confirmation Modal**:
    - Title: "Desconectar Google Calendar"
    - Description: "Tem certeza que deseja desconectar sua conta do Google Calendar? As tarefas não serão mais sincronizadas automaticamente."
    - Actions: "Cancelar" and "Confirmar Desconexão" (danger button).
