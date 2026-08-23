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
import type { DeleteAccountModalProps } from "@/types/userTypes";

const REQUIRED_CONFIRMATION_KEYWORD = "DELETAR";

export const DeleteAccountModal: FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMatch = confirmText.trim().toUpperCase() === REQUIRED_CONFIRMATION_KEYWORD;

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
      // Error handling is managed by the caller (toast)
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
                Excluir Conta Permanentemente
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--text-muted)]">
                {userEmail ? (
                  <span>
                    A conta vinculada a <strong>{userEmail}</strong> será removida definitivamente.
                  </span>
                ) : (
                  "Esta ação é irreversível e excluirá permanentemente todos os seus dados."
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/20 bg-red-50/50 p-4 dark:border-red-500/20 dark:bg-red-950/20 space-y-2">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">
              O que acontecerá ao excluir sua conta:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-red-600/90 dark:text-red-400/90 leading-relaxed">
              <li>Todas as suas tarefas, subtarefas e projetos serão apagados.</li>
              <li>Campos customizados e preferências serão removidos.</li>
              <li>Chaves de API do MCP e tokens do Google Calendar serão revogados.</li>
              <li>Você perderá acesso imediato e permanente a estes registros.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="delete-account-confirm-input"
              className="text-xs font-medium text-[var(--text-secondary)] block"
            >
              Para confirmar, digite <strong className="text-[var(--text-primary)] font-bold">{REQUIRED_CONFIRMATION_KEYWORD}</strong> no campo abaixo:
            </label>
            <Input
              id="delete-account-confirm-input"
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
                Excluindo conta...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir Conta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
