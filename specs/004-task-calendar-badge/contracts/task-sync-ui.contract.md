# UI Contract: Task Google Calendar Synchronization Badge

**Feature**: `specs/004-task-calendar-badge`

## UI Component Contract

### Task Synchronization Indicator

- **Container**: `TaskTable.tsx` title column cell
- **Condition**: `Boolean(task.googleCalendarEventId || task.google_calendar_event_id)`
- **Element**:
  ```tsx
  <span
    title="Sincronizado com o Google Calendar"
    aria-label="Sincronizado com o Google Calendar"
    className="shrink-0 inline-flex items-center justify-center p-1 rounded-md text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
  >
    <Calendar className="w-3.5 h-3.5" />
  </span>
  ```
- **Visual Specifications**:
  - Icon: Lucide `Calendar` (`w-3.5 h-3.5`)
  - Tooltip: Browser native `title="Sincronizado com o Google Calendar"`
  - Accessibility: `aria-label="Sincronizado com o Google Calendar"`
  - Theme compatibility: Styled with Tailwind token opacity (`bg-amber-500/10` and `text-amber-600 dark:text-amber-400`)
