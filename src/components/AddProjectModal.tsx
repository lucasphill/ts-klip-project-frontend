import { useState, useEffect, type FC } from 'react';
import { X } from 'lucide-react';

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
  onSave: (project: Project) => void;
  project?: Project | null;
}

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#ec4899', // pink
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
];

const AddProjectModal: FC<AddProjectModalProps> = ({ isOpen, onClose, onSave, project }) => {
  const [formData, setFormData] = useState<Project>({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    owner_id: 'auth0|1', // Default current user
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        color: project.color || PRESET_COLORS[0],
        owner_id: project.owner_id,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: PRESET_COLORS[0],
        owner_id: 'auth0|1',
      });
    }
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...formData,
      id: project?.id,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {project ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome do Projeto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Lançamento Website"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o projeto..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cor
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg transition-all ${formData.color === color
                      ? 'ring-2 ring-slate-400 ring-offset-2 scale-110'
                      : 'hover:scale-105'
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {project ? 'Salvar' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
