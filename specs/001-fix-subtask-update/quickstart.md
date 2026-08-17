# Quickstart: Validate Subtask Updates

## Prerequisites

- Project dependencies are installed.
- A user account can access a project containing at least two editable tasks.
- The frontend is configured to reach its authenticated task API.
- When browser tooling is available, the Chrome MCP can be used to observe the update request.

## Run the Application

From the repository root:

```powershell
npm run dev
```

Open a project with tasks **Parent A** and **Child B**.

## Primary Validation

1. Edit **Child B** and select **Parent A** in the parent-task control.
2. Save the task.
3. Verify a success outcome and that **Child B** appears nested below **Parent A**.
4. When Chrome MCP is available, inspect the update request and confirm it contains **Parent A**'s
   task ID under the API-recognized parent relationship property.
5. Reload the project or leave and return to it.
6. Verify **Child B** remains nested below **Parent A**, then reopen it and confirm **Parent A** is
   still selected.

## Regression Validation

1. Edit **Child B** without changing its parent and save; verify the relationship remains intact.
2. Select no parent for **Child B**, save, and verify it returns to the root level after reload.
3. Try to create an invalid hierarchy; the UI must not offer the current task or its descendants as
   valid parents.
4. Force or simulate a failed save when feasible; verify an actionable error appears and the view
   returns to persisted data rather than showing a false success.

## Required Checks

```powershell
npm run lint
npm run build
```

Both commands must complete successfully before the correction is ready for review.

## Implementation Validation Evidence

- **2026-08-17 — Build**: PASS. `npm run build` completed successfully after the task hierarchy
  mapper and project reconciliation changes.
- **2026-08-17 — Focused lint**: PASS. `npx eslint src/lib/taskPayload.ts src/types/apiTypes.ts
  eslint.config.js` completed successfully.
- **2026-08-17 — Repository lint**: BLOCKED by 89 pre-existing errors across unrelated files. The
  full command reports no errors in `src/lib/taskPayload.ts` or `src/types/apiTypes.ts`; the existing
  `src/pages/ProjectsPage.tsx` errors are unrelated `any` usages and a hook dependency warning.
- **2026-08-17 — Browser validation**: BLOCKED. Chrome plugin diagnostics confirm that Chrome is
  installed, but the ChatGPT/Codex extension is absent from the detected profiles and its native
  connection manifest is missing. An authenticated task update, request capture, reload, and
  parent-removal flow still require browser verification after the plugin connection is restored.
- Repository lint rerun (2026-08-17): BLOCKED by 89 existing errors and 6 warnings across
  unrelated files. `npm run lint` reported no errors in `src/lib/taskPayload.ts` or
  `src/types/apiTypes.ts`; the `src/pages/ProjectsPage.tsx` errors remain unrelated `any` usages
  and a hook dependency warning.
- Browser validation rerun (2026-08-17): FAIL. In the isolated project `QA Subtask Update
  2026-08-17`, Child B selected Parent A and the client sent a successful PUT with the correct
  `parentTaskId`. The response returned `parentTaskId: null`; Child B remained at the root
  immediately, after reload, and when reopened. Local backend inspection confirms the update
  service never assigns `dto.ParentTaskId` to the task entity before saving.
- Local API validation (2026-08-17): BLOCKED. The frontend ran at `http://localhost:5173` with
  `VITE_API_BASE_URL=http://localhost:5145/api`. The API health endpoint returned 200, but its
  authenticated-data preflight requests (including `OPTIONS /api/Projects`) exceeded 10 seconds.
  Browser requests were aborted and project creation could not complete, so T005, T007, and T010
  cannot be accepted against this local API instance.
- Local API validation retry (2026-08-17): PASS. The same frontend and API endpoints completed
  CORS preflight (204) and authenticated requests. In `QA Local Subtask Update 2026-08-17`, Child
  B was saved under Parent A with a successful PUT whose response retained the selected
  `parentTaskId`; the expanded project view displayed Child B as a subtask. Reloading and reopening
  Child B retained Parent A. Removing the parent persisted `parentTaskId: null` and returned Child
  B to the root. The parent selector excluded both the task itself and its descendant. An offline
  save displayed `Network Error`; after reconnecting and reloading, Child B correctly remained at
  its persisted root state. The final browser console had no warnings or errors.
