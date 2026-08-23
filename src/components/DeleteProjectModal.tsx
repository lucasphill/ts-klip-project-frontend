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
import type { GetProjectsDto } from "@/types/apiTypes";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GetProjectsDto | null;
  onConfirm: (projectId: string, deleteTasks: boolean) => Promise<void> | void;
}

export const DeleteProjectModal: FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onConfirm,
}) => {
  const [deleteTasks, setDeleteTasks] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!project) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm(project.id, deleteTasks);
      onClose();
    } catch {
      // Erro é tratado pelo chamador / toast
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
      <DialogContent className="surface-panel w-[min(100%-1.5rem,32rem)] gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Excluir projeto
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--text-muted)]">
                Tem certeza que deseja excluir o projeto &ldquo;{project.name || "Sem nome"}&rdquo;?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-1">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            Escolha a política para as tarefas vinculadas:
          </p>

          {/* Opção 1: Desvincular e Manter Tarefas (Padrão) */}
          <button
            type="button"
            onClick={() => setDeleteTasks(false)}
            disabled={isSubmitting}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
              !deleteTasks
                ? "border-[var(--brand)] bg-[var(--brand-soft)] dark:bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)]"
            }`}
          >
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                !deleteTasks
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--bg-soft)] text-[var(--text-muted)]"
              }`}
            >
              <Unlink className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                Manter tarefas (Recomendado)
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Exclui o projeto e desvincula as tarefas, mantendo-as salvas como tarefas avulsas na sua Inbox/Home.
              </div>
            </div>
          </button>

          {/* Opção 2: Excluir em Cascata */}
          <button
            type="button"
            onClick={() => setDeleteTasks(true)}
            disabled={isSubmitting}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
              deleteTasks
                ? "border-red-500 bg-red-50/50 dark:border-red-500/80 dark:bg-red-950/20 ring-1 ring-red-500"
                : "border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)]"
            }`}
          >
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                deleteTasks
                  ? "bg-red-500 text-white"
                  : "bg-[var(--bg-soft)] text-[var(--text-muted)]"
              }`}
            >
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                Excluir projeto e todas as tarefas
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Remove permanentemente o projeto e apaga em definitivo todas as tarefas vinculadas a ele.
              </div>
            </div>
          </button>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]"
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
                Confirmar Exclusão
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProjectModal;
