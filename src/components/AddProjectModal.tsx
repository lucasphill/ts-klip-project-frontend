import { useEffect, useState, type FC, type FormEvent } from "react";
import { CircleHelp, Folder, Loader2 } from "lucide-react";
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
import { useProjectsContext } from "@/contexts/ProjectsContext";
import type { CreateProjectDto, GetProjectsDto } from "@/types/apiTypes";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: CreateProjectDto & { id?: string }) => Promise<void> | void;
  project?: GetProjectsDto | null;
  defaultGroupId?: string | null;
}

const PRESET_COLORS = [
  "#2f6fb2",
  "#1f9d8f",
  "#d9772b",
  "#bb4f5c",
  "#7a6ac8",
  "#2f839f",
  "#708142",
  "#c15f2e",
];

export const AddProjectModal: FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  defaultGroupId,
}) => {
  const { projectGroups } = useProjectsContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: "",
    description: "",
    color: PRESET_COLORS[0],
    groupId: defaultGroupId ?? null,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        color: project.color || PRESET_COLORS[0],
        groupId: project.groupId ?? (project as any).group_id ?? null,
      });
      return;
    }

    setFormData({
      name: "",
      description: "",
      color: PRESET_COLORS[0],
      groupId: defaultGroupId ?? null,
    });
  }, [project, defaultGroupId, isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        groupId: formData.groupId || null,
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
        className="surface-panel w-[min(100%-1.5rem,38rem)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-0"
        showCloseButton={!isSubmitting}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-[var(--border-subtle)] px-5 py-4 sm:px-6">
            <DialogTitle className="text-xl font-bold text-[var(--text-primary)]">
              {project ? "Editar projeto" : "Novo projeto"}
            </DialogTitle>
            <DialogDescription className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Defina nome, grupo, descrição e cor para organizar seu espaço.</span>
              <HoverCard openDelay={150}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    aria-label="Ajuda sobre projetos"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                  >
                    <CircleHelp className="h-3.5 w-3.5" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72 text-xs">
                  Use nomes objetivos, escolha uma pasta/grupo correspondente e uma cor fixa para facilitar a identificação visual.
                </HoverCardContent>
              </HoverCard>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5 sm:px-6">
            {/* Nome do Projeto */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-secondary)]">Nome do projeto *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="Ex: Roadmap Produto 2026"
                className="field h-10 px-3 text-sm"
                autoFocus
                required
              />
            </div>

            {/* Grupo / Pasta do Projeto */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-secondary)]">Grupo / Pasta</Label>
              <div className="relative">
                <select
                  value={formData.groupId ?? ""}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value ? e.target.value : null })}
                  className="field h-10 w-full appearance-none rounded-lg bg-[var(--field-bg)] px-3 pr-8 text-xs text-[var(--text-primary)] transition-colors"
                >
                  <option value="">Nenhum (Raiz - Sem pasta)</option>
                  {projectGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      📁 {g.name}
                    </option>
                  ))}
                </select>
                <Folder className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>

            {/* Descricao */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-secondary)]">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                placeholder="Contexto e objetivo principal do projeto."
                rows={3}
                className="field resize-none px-3 py-2 text-xs"
              />
            </div>

            {/* Cor do Projeto */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[var(--text-secondary)]">Cor do projeto</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-8 w-8 rounded-lg border transition-all ${
                      formData.color === color
                        ? "scale-110 border-[var(--text-primary)] ring-2 ring-[var(--border-strong)]"
                        : "border-[var(--border-subtle)] hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Cor ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-5 py-3.5 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : project?.id ? (
                "Salvar projeto"
              ) : (
                "Criar projeto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
