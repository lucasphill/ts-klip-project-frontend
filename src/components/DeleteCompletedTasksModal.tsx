import { useState, type FC } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface DeleteCompletedTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  projectName?: string;
}

const REQUIRED_CONFIRMATION_KEYWORD = "DELETAR";

export const DeleteCompletedTasksModal: FC<DeleteCompletedTasksModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMatch = confirmText.trim().toUpperCase() === REQUIRED_CONFIRMATION_KEYWORD;
  const isProjectScoped = Boolean(projectName && projectName.trim());

  const handleClose = () => {
    if (isSubmitting) return;
    setConfirmText("");
    onClose();
  };

  const handleConfirm = async () => {
    if (!isMatch || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onConfirm();
      handleClose();
    } catch {
      // Error is handled by the caller toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
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
                {isProjectScoped
                  ? "Excluir Tarefas Concluídas do Projeto"
                  : "Excluir Todas as Tarefas Concluídas"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--text-muted)]">
                {isProjectScoped ? (
                  <span>
                    As tarefas concluídas do projeto <strong>{projectName}</strong> serão apagadas permanentemente.
                  </span>
                ) : (
                  "Todas as tarefas marcadas como concluídas na sua conta serão apagadas permanentemente."
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/20 bg-red-50/50 p-4 dark:border-red-500/20 dark:bg-red-950/20 space-y-2">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">
              O que acontecerá após a confirmação:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-red-600/90 dark:text-red-400/90 leading-relaxed">
              {isProjectScoped ? (
                <>
                  <li>As tarefas concluídas deste projeto serão excluídas em definitivo.</li>
                  <li>As tarefas pendentes deste projeto permanecerão intactas.</li>
                  <li>Tarefas de outros projetos ou avulsas não serão afetadas.</li>
                </>
              ) : (
                <>
                  <li>Todas as tarefas concluídas em todos os seus projetos serão excluídas.</li>
                  <li>Todas as tarefas concluídas da sua Inbox serão removidas.</li>
                  <li>Tarefas pendentes permanecerão salvas normalmente.</li>
                </>
              )}
              <li>Esta ação não poderá ser desfeita.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="delete-completed-confirm-input"
              className="text-xs font-medium text-[var(--text-secondary)] block"
            >
              Para confirmar, digite <strong className="text-[var(--text-primary)] font-bold">{REQUIRED_CONFIRMATION_KEYWORD}</strong> no campo abaixo:
            </label>
            <Input
              id="delete-completed-confirm-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Digite ${REQUIRED_CONFIRMATION_KEYWORD} para confirmar`}
              disabled={isSubmitting}
              autoFocus
              className="h-10 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && isMatch && !isSubmitting) {
                  e.preventDefault();
                  void handleConfirm();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleConfirm()}
            disabled={!isMatch || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo tarefas...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir Concluídas
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCompletedTasksModal;
