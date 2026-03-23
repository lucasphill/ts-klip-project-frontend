import { useEffect, useState, type FC, type FormEvent } from "react";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  const handleSubmit = async (event: FormEvent) => {
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent
        className="surface-panel w-[min(100%-1.5rem,56rem)] rounded-2xl border border-slate-200 bg-white p-0"
        showCloseButton={!isSubmitting}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <DialogTitle className="text-xl font-bold text-slate-900">
              {project ? "Editar projeto" : "Novo projeto"}
            </DialogTitle>
            <DialogDescription className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span>Defina nome, descricao e cor para organizar seu espaco.</span>
              <HoverCard openDelay={150}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    aria-label="Ajuda sobre projetos"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  Use nomes objetivos e uma cor fixa por area para facilitar o filtro visual na lista de tarefas.
                </HoverCardContent>
              </HoverCard>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5 sm:px-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Nome do projeto *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="Ex: Roadmap Produto 2026"
                className="field h-11 px-3 text-sm"
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Descricao</Label>
              <Textarea
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                placeholder="Contexto e objetivo principal do projeto."
                rows={4}
                className="field resize-none px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Cor</Label>
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
          </div>

          <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2f6fb2] text-white hover:bg-[#225587]"
            >
              {isSubmitting ? "Salvando..." : project?.id ? "Salvar projeto" : "Criar projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
