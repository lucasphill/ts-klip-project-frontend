import { useState, type FC } from "react";
import { AlertTriangle, Layers, Loader2, Trash2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DeleteTaskModalProps, TaskDeletionStrategy } from "@/types/taskDeletion";

export const DeleteTaskModal: FC<DeleteTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onConfirm,
}) => {
  const [strategy, setStrategy] = useState<TaskDeletionStrategy>("cascade");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task) return null;

  const hasSubtasks = task.subtaskCount > 0;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      const cascade = hasSubtasks ? strategy === "cascade" : undefined;
      await onConfirm(task.id, cascade);
      onClose();
    } catch {
      // Error handling is handled in caller / toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md gap-5">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
                {hasSubtasks ? "Excluir tarefa com subtarefas" : "Excluir tarefa"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--text-muted)]">
                {hasSubtasks
                  ? `A tarefa "${task.title || "Sem título"}" possui ${task.subtaskCount} subtarefa(s).`
                  : `Tem certeza que deseja excluir "${task.title || "Sem título"}"?`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {hasSubtasks ? (
          <div className="flex flex-col gap-3 py-1">
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Escolha o que fazer com as subtarefas:
            </p>

            <button
              type="button"
              onClick={() => setStrategy("cascade")}
              disabled={isSubmitting}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                strategy === "cascade"
                  ? "border-red-500 bg-red-50/50 dark:border-red-500/80 dark:bg-red-950/20 ring-1 ring-red-500"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                  strategy === "cascade"
                    ? "bg-red-500 text-white"
                    : "bg-[var(--bg-soft)] text-[var(--text-muted)]"
                }`}
              >
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  Excluir tarefa e todas as subtarefas
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Remove permanentemente a tarefa pai e as {task.subtaskCount} subtarefa(s) filhas.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStrategy("detach")}
              disabled={isSubmitting}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                strategy === "detach"
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] dark:bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                  strategy === "detach"
                    ? "bg-[var(--brand)] text-white"
                    : "bg-[var(--bg-soft)] text-[var(--text-muted)]"
                }`}
              >
                <Unlink className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  Excluir apenas o pai e manter subtarefas
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Remove a tarefa pai e desvincula as subtarefas, mantendo-as como tarefas avulsas.
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="py-2 text-sm text-[var(--text-secondary)]">
            Esta ação não pode ser desfeita. A tarefa será removida permanentemente.
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {hasSubtasks ? "Confirmar Exclusão" : "Excluir"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
