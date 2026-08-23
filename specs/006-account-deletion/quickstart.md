# Quickstart & Validation Guide: Self-Service Account Deletion

## Prerequisites
- Frontend development server running (`npm run dev` at `http://localhost:5173`).
- Authenticated session in the application.

---

## Validation Scenarios

### Scenario 1: Danger Zone Card Visibility
1. Open `http://localhost:5173/settings/profile` in the browser.
2. Verify the presence of the "Zona de Perigo" card with red accent/border at the bottom of the profile settings.
3. Verify the "Excluir Conta" button is visible and active.

### Scenario 2: Type-To-Confirm Safeguard in Modal
1. Click the "Excluir Conta" button.
2. Verify the `DeleteAccountModal` opens with explanatory text regarding permanent data erasure.
3. Verify the "Confirmar Exclusão" button is **disabled**.
4. Type arbitrary text (e.g. `teste`). Verify the confirm button remains disabled.
5. Type `DELETAR` (or `deletar`). Verify the confirm button becomes enabled.

### Scenario 3: Cancellation Flow
1. With the modal open, click "Cancelar" or click the close button.
2. Verify the modal closes.
3. Re-open the modal and verify the input text has been reset.

### Scenario 4: Successful Account Deletion
1. Open the modal, type `DELETAR`, and click "Confirmar Exclusão".
2. Verify a loading spinner appears on the button and input is disabled.
3. Verify a success toast notification appears.
4. Verify the user is logged out and redirected to `/`.

### Scenario 5: Error Handling
1. If the API request fails (e.g. mock 500 error or network disconnect), verify `toast.error` displays the error message.
2. Verify the user is NOT logged out and can dismiss the modal.
