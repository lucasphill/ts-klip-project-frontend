import { useEffect, useState, type FC } from "react";
import { FolderKanban, Globe, X } from "lucide-react";
import type { CreateCustomFieldDefinitionDto, CustomFieldType, GetCustomFieldDefinitionDto } from "../types/apiTypes";

const toOptionsString = (options?: string | string[] | null): string => {
  if (!options) return "";
  if (Array.isArray(options)) return options.join(", ");
  return options;
};

type CustomFieldFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: CreateCustomFieldDefinitionDto) => void | Promise<void>;
  initialData?: GetCustomFieldDefinitionDto | null;
  defaultIsUniversal?: boolean;
  lockScope?: boolean;
};

const CustomFieldFormModal: FC<CustomFieldFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultIsUniversal = true,
  lockScope = false,
}) => {
  const isEditing = !!initialData;
  const [field, setField] = useState({ name: "", type: "text", optionsString: "", isUniversal: defaultIsUniversal });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setField(
        initialData
          ? {
            name: initialData.name,
            type: initialData.type,
            optionsString: toOptionsString(initialData.options),
            isUniversal: initialData.isUniversal,
          }
          : { name: "", type: "text", optionsString: "", isUniversal: defaultIsUniversal }
      );
    }
  }, [isOpen, initialData, defaultIsUniversal]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!field.name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        name: field.name.trim(),
        type: field.type as CustomFieldType,
        options: field.type === "enum" ? field.optionsString.trim() || undefined : undefined,
        isUniversal: field.isUniversal,
      });
      onClose();
    } catch {
      // onSave handles toast feedback
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-lg">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {isEditing ? "Editar campo personalizado" : "Novo campo personalizado"}
            </h3>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              {isEditing ? "Atualize as propriedades do campo." : "Adicione metadados para enriquecer as tarefas."}
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

        <div className="space-y-4 px-5 py-5">
          {/* Scope selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Escopo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={lockScope}
                onClick={() => setField({ ...field, isUniversal: true })}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${field.isUniversal
                    ? "border-[var(--brand)] bg-[var(--brand)]/5 ring-1 ring-[var(--brand)]"
                    : "border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-soft)]"
                  } ${lockScope ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <Globe className={`mt-0.5 h-4 w-4 shrink-0 ${field.isUniversal ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`} />
                <div>
                  <p className={`text-xs font-semibold ${field.isUniversal ? "text-[var(--brand)]" : "text-[var(--text-primary)]"}`}>Universal</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-[var(--text-faint)]">Aplicado a todas as tarefas automaticamente</p>
                </div>
              </button>
              <button
                type="button"
                disabled={lockScope}
                onClick={() => setField({ ...field, isUniversal: false })}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${!field.isUniversal
                    ? "border-[var(--brand)] bg-[var(--brand)]/5 ring-1 ring-[var(--brand)]"
                    : "border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-soft)]"
                  } ${lockScope ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <FolderKanban className={`mt-0.5 h-4 w-4 shrink-0 ${!field.isUniversal ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`} />
                <div>
                  <p className={`text-xs font-semibold ${!field.isUniversal ? "text-[var(--brand)]" : "text-[var(--text-primary)]"}`}>Por projeto</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-[var(--text-faint)]">Vinculado manualmente a projetos específicos</p>
                </div>
              </button>
            </div>
          </div>

          {/* Field properties */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Nome</label>
              <input
                type="text"
                placeholder="Ex: Prioridade"
                className="field h-9 w-full px-3 text-sm"
                value={field.name}
                autoFocus
                onChange={(e) => setField({ ...field, name: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Tipo</label>
              <select
                className="field h-9 w-full bg-[var(--field-bg)] px-3 text-sm"
                value={field.type}
                onChange={(e) => setField({ ...field, type: e.target.value })}
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="enum">Seleção</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Opções</label>
              {field.type === "enum" ? (
                <input
                  type="text"
                  placeholder="Alta, Média, Baixa"
                  className="field h-9 w-full px-3 text-sm"
                  value={field.optionsString}
                  onChange={(e) => setField({ ...field, optionsString: e.target.value })}
                />
              ) : (
                <div className="field flex h-9 items-center px-3 text-sm text-[var(--text-faint)]">
                  Não aplicável
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-soft)] disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={() => void submit()}
              disabled={isSubmitting || !field.name.trim()}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar campo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomFieldFormModal;
