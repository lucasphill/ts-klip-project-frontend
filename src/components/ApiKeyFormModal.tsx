import { useEffect, useState, type FC } from "react";
import { X } from "lucide-react";
import type { CreateApiKeyDto, GetApiKeyDto } from "../types/apiTypes";

type ApiKeyFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateApiKeyDto) => void | Promise<void>;
  initialData?: GetApiKeyDto | null;
};

const ApiKeyFormModal: FC<ApiKeyFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const isEditing = !!initialData;
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialData ? initialData.name : "");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({ name: name.trim() });
      onClose();
    } catch {
      // Handled by parent or toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-lg animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {isEditing ? "Editar chave de API" : "Nova chave de API"}
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {isEditing ? "Atualize o nome de identificação desta chave." : "Crie uma chave para conectar com MCP Servers."}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)] disabled:opacity-40"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Nome da Chave
            </label>
            <input
              type="text"
              placeholder="Ex: Cursor Desktop, Windsurf, Claude Code"
              className="field h-9 w-full px-3 text-sm bg-[var(--field-bg)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit();
              }}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)] -mx-5 -mb-5 px-5 py-4 bg-[var(--bg-soft)] rounded-b-xl">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-soft)] disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={() => void submit()}
              disabled={isSubmitting || !name.trim()}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar chave"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyFormModal;
