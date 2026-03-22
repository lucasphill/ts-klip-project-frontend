import { useEffect, useState, type FC } from "react";
import { Calendar, X } from "lucide-react";
import type { CreateTaskDto } from "../types/apiTypes";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: CreateTaskDto & { id?: string }) => Promise<void> | void;
  task?: (CreateTaskDto & { id?: string }) | null;
}

const normalizeDate = (value?: string) => {
  if (!value) return "";
  return value.split("T")[0];
};

const AddTaskModal: FC<AddTaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: "",
    isCompleted: false,
    dueDate: "",
    notes: "",
    parentTaskId: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        isCompleted: task.isCompleted ?? false,
        dueDate: normalizeDate(task.dueDate),
        notes: task.notes ?? "",
        parentTaskId: task.parentTaskId ?? "",
      });
      return;
    }

    setFormData({
      title: "",
      isCompleted: false,
      dueDate: "",
      notes: "",
      parentTaskId: "",
    });
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title.trim()) return;

    const normalizedTask = {
      ...formData,
      title: formData.title.trim(),
      dueDate: formData.dueDate?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      parentTaskId: formData.parentTaskId?.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      await onSave({ ...normalizedTask, id: task?.id });
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
            <h2 className="text-xl font-bold text-slate-900">{task ? "Editar tarefa" : "Nova tarefa"}</h2>
            <p className="mt-1 text-sm text-slate-500">Defina titulo, prazo e contexto para organizar o trabalho.</p>
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
            <label className="text-sm font-semibold text-slate-700">Titulo da tarefa *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              placeholder="Ex: Revisar backlog da sprint"
              className="field h-11 w-full px-3 text-sm"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Prazo</label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={formData.dueDate ?? ""}
                onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })}
                className="field h-11 w-full bg-white pl-10 pr-3 text-sm"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              type="checkbox"
              checked={formData.isCompleted ?? false}
              onChange={(event) => setFormData({ ...formData, isCompleted: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-[#2f6fb2]"
            />
            <span className="text-sm font-medium text-slate-700">Marcar como concluida</span>
          </label>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Notas</label>
            <textarea
              value={formData.notes ?? ""}
              onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
              placeholder="Contexto, links ou checklist da tarefa."
              className="field min-h-[120px] w-full resize-y px-3 py-2 text-sm"
            />
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
              {isSubmitting ? "Salvando..." : task?.id ? "Salvar tarefa" : "Criar tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
