# Task Update Contract

## Purpose

Define the frontend's expected behavior when saving a task's parent relationship from a project.

## Endpoint Interaction

| Item | Contract |
| --- | --- |
| Operation | Update an existing task identified by its task ID. |
| Caller | The existing authenticated task API service. |
| Required editable data | Title, completion state, and the selected hierarchy relationship, plus any existing optional editable fields. |
| Parent relationship | A selected parent is sent using the API-recognized parent relationship property with the selected task ID. |
| No parent | The representation for removing a parent is verified from the live API contract and sent intentionally, never as an accidental lost value. |
| Success | The response or a subsequent project refresh reflects the saved parent relationship. |
| Failure | The user receives an error and the project view returns to the previously persisted task state. |

## Compatibility Rules

- The frontend canonical task model uses `parentTaskId`.
- Incoming task data that uses a known legacy or transport alias, including `parent_task_id`, is
  normalized at the API boundary before hierarchy rendering or editing.
- The selected parent ID must be present in the captured update request when a user assigns a
  parent.
- A hierarchy-only update must preserve unrelated editable task attributes.

## Contract Verification

Before accepting the implementation, inspect an authenticated update through the browser when the
Chrome MCP is available. Record the observed request property name, selected parent ID, response
status, and returned parent relationship in the implementation evidence.

## Implementation Evidence

- **2026-08-17**: The frontend now normalizes both `parentTaskId` and `parent_task_id` into the
  canonical `parentTaskId` field and sends an explicit parent ID or `null` in task update payloads.
- **Pending**: Chrome plugin diagnostics confirmed that Google Chrome is installed, but the
  ChatGPT/Codex extension is not installed in either detected profile and the native-host manifest
  is absent. An authenticated request and response therefore could not be captured to confirm the
  backend's accepted transport field and no-parent representation. Complete browser verification
  after the browser connection is installed and enabled.
- **2026-08-17 - Chrome DevTools MCP**: `PUT /api/Tasks/{childId}` returned 200. The request
  explicitly sent `parentTaskId` with Parent A's ID; a root task is represented by
  `parentTaskId: null`. The response returned `parentTaskId: null` despite the selected ID, so the
  deployed backend currently ignores the relationship during updates.
- **2026-08-17 - Local API**: `PUT /api/Tasks/{childId}` returned 200 with the selected
  `parentTaskId`, and the response returned that same ID. Removing the parent sent
  `parentTaskId: null` and returned `null`.
