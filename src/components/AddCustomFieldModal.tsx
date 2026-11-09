import { useState, type FC } from "react";
import { X } from "lucide-react";
import type { CreateCustomFieldDefinitionDto, CustomFieldType } from "../types/apiTypes";

type FieldDraft = {
  name: string;
  type: string;
  optionsString: string;
};

const initialDraft: FieldDraft = {
  name: "",
  type: "text",
  optionsString: "",
};

const AddCustomFieldModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (field: CreateCustomFieldDefinitionDto) => void | Promise<void>;
}> = ({ isOpen, onClose, onCreate }) => {
  const [field, setField] = useState<FieldDraft>(initialDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setField(initialDraft);
  };

  const submit = async () => {
    if (!field.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        name: field.name.trim(),
        type: field.type as CustomFieldType,
        options: field.type === "enum" ? field.optionsString.trim() || undefined : undefined,
      });
      setField(initialDraft);
    } catch {
      // onCreate ja lida com o feedback de erro via toast.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-3 py-4 backdrop-blur-sm">
      <div className="surface-panel w-full max-w-2xl rounded-2xl bg-[var(--bg-panel)]">
        <div className="flex items-start justify-between border-b border-[var(--border-subtle)] px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Novo campo personalizado</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Adicione metadados para enriquecer as tarefas do projeto.</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-sm font-semibold text-[var(--text-secondary)]">Nome</label>
              <input
                type="text"
                placeholder="Ex: Prioridade"
                className="field h-11 w-full px-3 text-sm"
                value={field.name}
                onChange={(event) => setField({ ...field, name: event.target.value })}
              />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-sm font-semibold text-[var(--text-secondary)]">Tipo</label>
              <select
                className="field h-11 w-full bg-[var(--bg-panel)] px-3 text-sm"
                value={field.type}
                onChange={(event) => setField({ ...field, type: event.target.value })}
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                {/* <option value="date">Data</option>
                <option value="boolean">Booleano</option> */}
                <option value="enum">Seleção</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-sm font-semibold text-[var(--text-secondary)]">
                {field.type === "enum" ? "Opções" : "Opcional"}
              </label>
              {field.type === "enum" ? (
                <input
                  type="text"
                  placeholder="Alta, Media, Baixa"
                  className="field h-11 w-full px-3 text-sm"
                  value={field.optionsString}
                  onChange={(event) => setField({ ...field, optionsString: event.target.value })}
                />
              ) : (
                <div className="field flex h-11 items-center px-3 text-sm text-[var(--text-faint)]">Sem opções para este tipo</div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => void submit()}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : "Criar campo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomFieldModal;
