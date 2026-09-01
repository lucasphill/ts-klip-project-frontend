/**
 * Contract: TaskNotePopover Component
 * 
 * Defines the public props for the TaskNotePopover component on task rows.
 */

export interface TaskNotePopoverProps {
  /**
   * Unique ID of the task.
   */
  taskId: string;

  /**
   * Title of the task for header context.
   */
  taskTitle: string;

  /**
   * Current notes content in Markdown or plain text.
   */
  notes?: string | null;

  /**
   * Save callback invoked when user clicks Salvar or presses Ctrl+Enter / Cmd+Enter.
   */
  onSave: (notes: string) => Promise<void> | void;

  /**
   * Whether the popover trigger is disabled.
   */
  disabled?: boolean;

  /**
   * Optional custom classes for the trigger button.
   */
  className?: string;
}
