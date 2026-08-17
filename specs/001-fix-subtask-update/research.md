# Research: Fix Subtask Update

## Decision: Use `parentTaskId` as the canonical frontend hierarchy field

**Rationale**: The frontend DTOs, form state, API payloads, parent option builder, and task table
all use `parentTaskId`. The project page currently spreads API responses unchanged, so a response
using an alias such as `parent_task_id` is not available to its hierarchy or later update paths.
Normalize known response aliases and empty values once when project tasks enter frontend state.

**Alternatives considered**:

- Keep each caller responsible for checking both names. Rejected because it duplicates logic and
  leaves new call sites vulnerable to the same loss of hierarchy information.
- Change the task table to read several names. Rejected because UI rendering is not the API boundary
  and would still leave update payloads incomplete.

## Decision: Serialize the selected parent explicitly through a typed task update payload

**Rationale**: Static inspection shows the project modal passes `parentTaskId` and the project page
sends a task update through the existing task API service. A shared, typed payload mapper keeps the
selected parent value, preserves unrelated editable fields, and makes the representation of an
unparented task intentional rather than accidental.

**Alternatives considered**:

- Patch only the project modal submit handler. Rejected because inline updates and future callers
  could still serialize an incomplete task model.
- Send raw component state to the API. Rejected because dates, blank strings, and API aliases need
  a single normalization boundary.

## Decision: Confirm the live API contract during browser validation

**Rationale**: The local frontend contract names the field `parentTaskId`, but backend source and a
captured authenticated response are not present in this repository. Before finalizing the mapper,
inspect the PUT request and its response while editing a project task. Confirm the accepted
relationship property name and how an empty parent is represented. The implementation must match
that observed contract while keeping the frontend model canonical.

**Alternatives considered**:

- Assume the reported issue is solely a missing outbound field. Rejected because static inspection
  already shows a `parentTaskId` field in the modal update payload.
- Block planning until backend documentation is supplied. Rejected because the existing DTO and
  browser inspection provide a focused, safe way to validate the contract.

## Decision: Reconcile project task state after hierarchy updates

**Rationale**: The project page updates local state after a modal save but does not reload project
data on success. Refreshing the affected project data, or applying a normalized authoritative
response when one is available, ensures the tree displays the persisted relationship and avoids
retaining an optimistic value that differs from the server.

**Alternatives considered**:

- Leave only the optimistic update. Rejected because this bug concerns persistence and a local
  update cannot prove that persistence succeeded.
- Refetch all global application state. Rejected because only the active project view needs
  reconciliation.

## Decision: Use existing checks plus browser-based acceptance validation

**Rationale**: The repository provides lint and build scripts but no configured test runner. Run
both checks and, when available, use the Chrome MCP to validate the actual user flow and inspect
the authenticated network exchange.

**Alternatives considered**:

- Add a test framework for this correction. Rejected as unnecessary scope expansion; focused
  automated tests can be introduced separately if the project adopts a test runner.
- Validate only the request. Rejected because the hierarchy must also display correctly after a
  reload and handle error recovery.
