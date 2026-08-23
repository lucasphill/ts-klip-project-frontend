# Data Model: Self-Service Account Deletion

## Frontend Data Structures & Interfaces

### 1. Account Deletion Modal Props
```typescript
export interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail?: string;
}
```

### 2. Deletion Confirmation State
```typescript
export interface AccountDeletionState {
  inputText: string;
  isMatch: boolean;
  isSubmitting: boolean;
  error: string | null;
}
```

### 3. API Response Model
```typescript
// Shared from apiTypes.ts
export interface ResponseModelDto<T> {
  data: T;
  message: string | null;
  status: boolean;
  timestamp?: string;
}

// DELETE /api/Users/me returns ResponseModelDto<boolean>
export type DeleteUserResponse = ResponseModelDto<boolean>;
```

## State Lifecycle & Transitions

```mermaid
stateDiagram-v2
    [*] --> Idle: User navigates to Settings > Profile
    Idle --> ModalOpen: User clicks "Excluir Conta"
    ModalOpen --> Typing: User types in confirmation input
    Typing --> Validated: input.trim().toUpperCase() === "DELETAR"
    Typing --> ModalOpen: input mismatch (Confirm button disabled)
    Validated --> Submitting: User clicks "Confirmar Exclusão"
    ModalOpen --> Idle: User clicks "Cancelar" (reset input)
    Submitting --> Success: HTTP 200 OK from DELETE /api/Users/me
    Submitting --> Error: HTTP 4xx/5xx or Network Error
    Error --> Validated: toast.error() displayed, retry enabled
    Success --> Terminated: toast.success() -> Auth0 logout() -> Redirect to /
```
