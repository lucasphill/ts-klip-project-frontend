import { useState, useEffect, type FC } from 'react';
import { X, Calendar } from 'lucide-react';
import type { CreateTaskDto } from '../types/apiTypes';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: CreateTaskDto & { id?: string }) => Promise<void> | void;
  task?: (CreateTaskDto & { id?: string }) | null;
}

const AddTaskModal: FC<AddTaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: '',
    isCompleted: false,
    dueDate: '',
    notes: '',
    parentTaskId: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        isCompleted: task.isCompleted ?? false,
        dueDate: task.dueDate ?? '',
        notes: task.notes ?? '',
        parentTaskId: task.parentTaskId ?? '',
      });
    } else {
      setFormData({
        title: '',
        isCompleted: false,
        dueDate: '',
        notes: '',
        parentTaskId: '',
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // onSave já exibiu o toast de erro; modal permanece aberto para o usuário corrigir
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título da Tarefa *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Revisar documentação"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Prazo
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={formData.dueDate ?? ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full pl-11 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_completed"
              checked={formData.isCompleted ?? false}
              onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="is_completed" className="text-sm font-medium text-slate-700">
              Marcar como concluída
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes ?? ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalhes da tarefa (opcional)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[96px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Salvando...' : (task?.id ? 'Salvar' : 'Criar Tarefa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
