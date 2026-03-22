import { useEffect, useState, type FC } from "react";
import { X } from "lucide-react";

interface Project {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  owner_id?: string;
}

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => Promise<void> | void;
  project?: Project | null;
}

const PRESET_COLORS = ["#2f6fb2", "#1f9d8f", "#d9772b", "#bb4f5c", "#7a6ac8", "#2f839f", "#708142", "#c15f2e"];

const AddProjectModal: FC<AddProjectModalProps> = ({ isOpen, onClose, onSave, project }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Project>({
    name: "",
    description: "",
    color: PRESET_COLORS[0],
    owner_id: "auth0|1",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        color: project.color || PRESET_COLORS[0],
        owner_id: project.owner_id,
      });
      return;
    }

    setFormData({
      name: "",
      description: "",
      color: PRESET_COLORS[0],
      owner_id: "auth0|1",
    });
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        id: project?.id,
      });
      onClose();
    } catch {
      // onSave ja lida com o feedback de erro via toast.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-3 py-4 backdrop-blur-sm">
      <div className="surface-panel max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{project ? "Editar projeto" : "Novo projeto"}</h2>
            <p className="mt-1 text-sm text-slate-500">Defina nome, descricao e cor para organizar seu espaco.</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Nome do projeto *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              placeholder="Ex: Roadmap Produto 2026"
              className="field h-11 w-full px-3 text-sm"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Descricao</label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              placeholder="Contexto e objetivo principal do projeto."
              rows={4}
              className="field w-full resize-none px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Cor</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-9 w-9 rounded-xl border transition-all ${
                    formData.color === color ? "scale-110 border-slate-500 ring-2 ring-slate-300" : "border-slate-200 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Cor ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-[#2f6fb2] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#225587] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : project?.id ? "Salvar projeto" : "Criar projeto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
