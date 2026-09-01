/**
 * Contract: Markdown Rich Text Editor Component
 * 
 * Defines the public props and event contracts for the reusable rich text editor.
 */

export interface MarkdownEditorProps {
  /**
   * Initial or current markdown string.
   */
  value?: string | null;

  /**
   * Callback fired when content changes within the editor (optional).
   */
  onChange?: (markdown: string) => void;

  /**
   * Callback fired when user presses Ctrl+Enter or Cmd+Enter to request a save.
   */
  onSaveShortcut?: (markdown: string) => void;

  /**
   * Placeholder text shown when editor is empty.
   */
  placeholder?: string;

  /**
   * Whether the editor is disabled or in a read-only state.
   */
  disabled?: boolean;

  /**
   * Custom CSS class names applied to the container.
   */
  className?: string;

  /**
   * Minimum height of the editable area (e.g. '120px').
   */
  minHeight?: string;

  /**
   * Maximum height of the editable area before scrolling (e.g. '280px').
   */
  maxHeight?: string;

  /**
   * Whether to autofocus the editor on mount.
   */
  autoFocus?: boolean;
}

export interface MarkdownEditorRef {
  /**
   * Programmatically retrieves the current markdown string.
   */
  getMarkdown: () => string;

  /**
   * Programmatically resets the editor to a new markdown string.
   */
  setMarkdown: (markdown: string) => void;

  /**
   * Focuses the editor.
   */
  focus: () => void;
}
