import { useEffect, useState, type FC, type KeyboardEvent } from "react";
import { StickyNote, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface TaskNotePopoverProps {
  taskId: string;
  taskTitle: string;
  notes?: string | null;
  onSave: (notes: string) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

export const TaskNotePopover: FC<TaskNotePopoverProps> = ({
  taskId: _taskId,
  taskTitle,
  notes,
  onSave,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState(notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const hasNotes = Boolean(notes && notes.trim().length > 0);

  useEffect(() => {
    if (isOpen) {
      setNoteText(notes ?? "");
    }
  }, [isOpen, notes]);

  const handleSave = async () => {
    if (isSaving || disabled) return;
    setIsSaving(true);
    try {
      await onSave(noteText);
      setIsOpen(false);
    } catch {
      // Error handled by parent or toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void handleSave();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          title={
            hasNotes
              ? notes?.trim()
                ? `Observações: ${notes.trim()}`
                : "Ver ou editar observações"
              : "Adicionar observação"
          }
          aria-label={
            hasNotes
              ? "Ver ou editar observações da tarefa"
              : "Adicionar observação à tarefa"
          }
          className={cn(
            "shrink-0 inline-flex items-center justify-center p-1 rounded-md transition-all outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand)]",
            hasNotes
              ? "text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 opacity-100"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-soft)] opacity-0 group-hover:opacity-100 group-hover/task-row:opacity-100 focus-visible:opacity-100 focus:opacity-100",
            className
          )}
        >
          <StickyNote className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        className="w-80 p-3 bg-[var(--bg-panel)] border-[var(--border-subtle)] shadow-xl z-50 rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-0.5 border-b border-[var(--border-subtle)] pb-2">
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">
              Observações da Tarefa
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[280px]">
              {taskTitle || "Sem título"}
            </p>
          </div>

          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma observação ou anotação..."
            className="min-h-[100px] max-h-[220px] text-xs text-[var(--text-primary)] bg-[var(--bg-soft)] border-[var(--border-subtle)] focus-visible:border-[var(--brand)] focus-visible:ring-1 focus-visible:ring-[var(--brand)] resize-y p-2"
            autoFocus
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[var(--text-muted)]">
              Ctrl+Enter para salvar
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] h-7 px-2.5"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="text-xs bg-[var(--brand)] hover:bg-[var(--brand-strong)] text-white h-7 px-3 font-medium shadow-sm"
              >
                {isSaving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TaskNotePopover;
