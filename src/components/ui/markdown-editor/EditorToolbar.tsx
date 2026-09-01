import { type FC, type MouseEvent } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Link as LinkIcon,
} from "lucide-react";
import { useEditorRef, useEditorSelector } from "platejs/react";
import { toggleList, someList, someTodoList, ListStyleType } from "@platejs/list";
import { cn } from "@/lib/utils";

export interface EditorToolbarProps {
  className?: string;
  disabled?: boolean;
}

export const EditorToolbar: FC<EditorToolbarProps> = ({ className, disabled = false }) => {
  const editor = useEditorRef();

  // Track active states reactively using useEditorSelector
  const isBold = useEditorSelector((ed) => Boolean(ed.api.hasMark?.("bold")), []);
  const isItalic = useEditorSelector((ed) => Boolean(ed.api.hasMark?.("italic")), []);
  const isStrikethrough = useEditorSelector((ed) => Boolean(ed.api.hasMark?.("strikethrough")), []);
  const isH1 = useEditorSelector((ed) => Boolean(ed.api.some?.({ match: { type: "h1" } })), []);
  const isH2 = useEditorSelector((ed) => Boolean(ed.api.some?.({ match: { type: "h2" } })), []);
  const isH3 = useEditorSelector((ed) => Boolean(ed.api.some?.({ match: { type: "h3" } })), []);
  const isQuote = useEditorSelector((ed) => Boolean(ed.api.some?.({ match: { type: "blockquote" } })), []);
  const isBulletList = useEditorSelector((ed) => someList(ed, ListStyleType.Disc), []);
  const isNumberedList = useEditorSelector((ed) => someList(ed, ListStyleType.Decimal), []);
  const isTodoList = useEditorSelector((ed) => someTodoList(ed), []);

  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    // Prevent focus loss from editor
    e.preventDefault();
  };

  const toggleMark = (mark: string) => {
    editor.tf.toggleMark(mark);
  };

  const toggleHeading = (headingType: "h1" | "h2" | "h3") => {
    editor.tf.toggleBlock(headingType);
  };

  const toggleBlockquote = () => {
    editor.tf.toggleBlock("blockquote");
  };

  const handleBulletList = () => {
    if (!editor.selection) {
      editor.tf.insertNodes({
        type: "p",
        listStyleType: ListStyleType.Disc,
        children: [{ text: "" }],
      } as any);
    } else {
      toggleList(editor, { listStyleType: ListStyleType.Disc });
    }
  };

  const handleNumberedList = () => {
    if (!editor.selection) {
      editor.tf.insertNodes({
        type: "p",
        listStyleType: ListStyleType.Decimal,
        children: [{ text: "" }],
      } as any);
    } else {
      toggleList(editor, { listStyleType: ListStyleType.Decimal });
    }
  };

  const handleTodoList = () => {
    if (!editor.selection) {
      editor.tf.insertNodes({
        type: "p",
        listStyleType: "todo",
        checked: false,
        children: [{ text: "" }],
      } as any);
    } else {
      toggleList(editor, { listStyleType: "todo" });
      editor.tf.setNodes({ checked: false, listStyleType: "todo" });
    }
  };

  const handleInsertLink = () => {
    const url = window.prompt("Insira o link (URL):", "https://");
    if (!url || !url.trim() || url === "https://") return;

    if (editor.selection) {
      editor.tf.wrapNodes(
        { type: "a", url: url.trim(), children: [] } as any,
        { match: (n) => (n as any).type !== "a", split: true }
      );
    } else {
      editor.tf.insertNodes({
        type: "a",
        url: url.trim(),
        children: [{ text: url.trim() }],
      } as any);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Barra de formatação de notas"
      className={cn(
        "flex flex-wrap items-center gap-0.5 p-1 border-b border-[var(--border-subtle)] bg-[var(--bg-soft)] rounded-t-lg select-none",
        className
      )}
    >
      {/* Marks: Bold, Italic, Strikethrough */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => toggleMark("bold")}
        disabled={disabled}
        title="Negrito (Ctrl+B)"
        aria-label="Negrito"
        aria-pressed={isBold}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
          isBold
            ? "bg-[var(--brand)]/15 text-[var(--brand)] font-bold"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <Bold className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => toggleMark("italic")}
        disabled={disabled}
        title="Itálico (Ctrl+I)"
        aria-label="Itálico"
        aria-pressed={isItalic}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
          isItalic
            ? "bg-[var(--brand)]/15 text-[var(--brand)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <Italic className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => toggleMark("strikethrough")}
        disabled={disabled}
        title="Tachado / Riscado"
        aria-label="Tachado"
        aria-pressed={isStrikethrough}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
          isStrikethrough
            ? "bg-[var(--brand)]/15 text-[var(--brand)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />

      {/* Headings: H1, H2, H3 */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => toggleHeading("h1")}
        disabled={disabled}
        title="Título 1 (# )"
        aria-label="Título 1"
        aria-pressed={isH1}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
          isH1
            ? "bg-[var(--brand)]/15 text-[var(--brand)] font-semibold"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <Heading1 className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => toggleHeading("h2")}
        disabled={disabled}
        title="Título 2 (## )"
        aria-label="Título 2"
        aria-pressed={isH2}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
          isH2
            ? "bg-[var(--brand)]/15 text-[var(--brand)] font-semibold"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <Heading2 className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => toggleHeading("h3")}
        disabled={disabled}
        title="Título 3 (### )"
        aria-label="Título 3"
        aria-pressed={isH3}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
          isH3
            ? "bg-[var(--brand)]/15 text-[var(--brand)] font-semibold"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <Heading3 className="h-3.5 w-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />

      {/* Lists & Checklists */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={handleTodoList}
        disabled={disabled}
        title="Checklist / Tarefa ([-])"
        aria-label="Checklist"
        aria-pressed={isTodoList}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
          isTodoList
            ? "bg-[var(--brand)]/15 text-[var(--brand)] font-semibold"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <ListTodo className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={handleBulletList}
        disabled={disabled}
        title="Lista com marcadores (- )"
        aria-label="Lista com marcadores"
        aria-pressed={isBulletList}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
          isBulletList
            ? "bg-[var(--brand)]/15 text-[var(--brand)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <List className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={handleNumberedList}
        disabled={disabled}
        title="Lista numerada (1. )"
        aria-label="Lista numerada"
        aria-pressed={isNumberedList}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
          isNumberedList
            ? "bg-[var(--brand)]/15 text-[var(--brand)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />

      {/* Quote & Link */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={toggleBlockquote}
        disabled={disabled}
        title="Citação (> )"
        aria-label="Citação"
        aria-pressed={isQuote}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
          isQuote
            ? "bg-[var(--brand)]/15 text-[var(--brand)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <Quote className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={handleInsertLink}
        disabled={disabled}
        title="Inserir Link"
        aria-label="Inserir Link"
        className="inline-flex items-center justify-center h-7 w-7 rounded transition-colors text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default EditorToolbar;
