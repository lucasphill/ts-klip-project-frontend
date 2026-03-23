import { useEffect, useMemo, useState, type FC, type FormEvent } from "react";
import { CircleHelp, Plus, Trash2, X } from "lucide-react";
import DatePickerField from "./DatePickerField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { CreateTaskDto, GetProjectsDto } from "../types/apiTypes";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: CreateTaskDto & { id?: string }, projectIds: string[]) => Promise<void> | void;
  onDelete?: (taskId: string) => Promise<boolean> | boolean;
  task?: (CreateTaskDto & { id?: string }) | null;
  projects?: GetProjectsDto[];
  initialProjectIds?: string[];
}

const normalizeDate = (value?: string) => {
  if (!value) return "";
  return value.split("T")[0];
};

const AddTaskModal: FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
  projects = [],
  initialProjectIds,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [projectSelectVersion, setProjectSelectVersion] = useState(0);
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

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProjectIds(Array.from(new Set((initialProjectIds ?? []).filter(Boolean))));
    setProjectSelectVersion((previous) => previous + 1);
  }, [initialProjectIds?.join("|"), isOpen]);

  const availableProjects = useMemo(
    () => projects.filter((project) => !selectedProjectIds.includes(project.id)),
    [projects, selectedProjectIds]
  );

  const selectedProjects = useMemo(
    () =>
      selectedProjectIds
        .map((projectId) => projects.find((project) => project.id === projectId))
        .filter((project): project is GetProjectsDto => Boolean(project)),
    [projects, selectedProjectIds]
  );

  const handleSubmit = async (event: FormEvent) => {
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
      await onSave({ ...normalizedTask, id: task?.id }, selectedProjectIds);
      onClose();
    } catch {
      // onSave ja lida com o feedback de erro via toast.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id || !onDelete) return;

    setIsDeleting(true);
    try {
      const wasDeleted = await onDelete(task.id);
      if (wasDeleted) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting && !isDeleting) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={!isSubmitting && !isDeleting}
        className="h-full w-full max-w-none rounded-none border-l border-slate-200 bg-white p-0 sm:max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <SheetTitle className="text-xl font-bold text-slate-900">
              {task ? "Editar tarefa" : "Nova tarefa"}
            </SheetTitle>
            <SheetDescription className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span>Defina titulo, prazo e contexto para organizar o trabalho.</span>
              <HoverCard openDelay={150}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    aria-label="Ajuda sobre preenchimento da tarefa"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  Use o prazo para prioridade de entrega e as notas para links, checklist ou contexto do trabalho.
                </HoverCardContent>
              </HoverCard>
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Titulo da tarefa *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                placeholder="Ex: Revisar backlog da sprint"
                className="field h-11 px-3 text-sm"
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Prazo</Label>
              <DatePickerField
                value={formData.dueDate ?? ""}
                onChange={(nextDate) => setFormData({ ...formData, dueDate: nextDate })}
                className="w-full"
                buttonClassName="field h-11 bg-white text-sm"
                placeholder="Selecione o prazo"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-slate-700">Projetos</Label>
                <HoverCard openDelay={150}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      aria-label="Ajuda sobre selecao de projetos"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <CircleHelp className="h-4 w-4" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72">
                    Voce pode vincular a tarefa a varios projetos. Esse campo pode ficar vazio se preferir.
                  </HoverCardContent>
                </HoverCard>
              </div>

              <Select
                key={`task-project-select-${projectSelectVersion}`}
                onValueChange={(value) => {
                  setSelectedProjectIds((previous) => (previous.includes(value) ? previous : [...previous, value]));
                  setProjectSelectVersion((previous) => previous + 1);
                }}
              >
                <SelectTrigger
                  className="h-7 w-8 justify-center border-dashed border-slate-300 bg-white p-0 text-slate-700 [&_svg.pointer-events-none]:hidden"
                  disabled={availableProjects.length === 0}
                  aria-label="Adicionar projeto"
                >
                  <Plus className="h-3.5 w-3.5 text-slate-500" />
                  <span className="sr-only">
                    {availableProjects.length > 0 ? "Adicionar projeto" : "Todos os projetos ja selecionados"}
                  </span>
                  <SelectValue className="hidden" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedProjects.map((project) => (
                    <span
                      key={project.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
                    >
                      {project.name}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedProjectIds((previous) => previous.filter((projectId) => projectId !== project.id))
                        }
                        className="text-slate-400 transition-colors hover:text-rose-600"
                        aria-label={`Remover projeto ${project.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Checkbox
                checked={formData.isCompleted ?? false}
                onCheckedChange={(checked) => setFormData({ ...formData, isCompleted: checked === true })}
                className="border-slate-300 data-checked:border-[#2f6fb2] data-checked:bg-[#2f6fb2]"
              />
              <span className="text-sm font-medium text-slate-700">Marcar como concluida</span>
            </label>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Notas</Label>
              <Textarea
                value={formData.notes ?? ""}
                onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                placeholder="Contexto, links ou checklist da tarefa."
                className="field min-h-[120px] resize-y px-3 py-2 text-sm"
              />
            </div>
          </div>

          <SheetFooter className="border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
            {task?.id && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDelete()}
                disabled={isSubmitting || isDeleting}
                className="sm:mr-auto"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Excluindo..." : "Excluir tarefa"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="bg-[#2f6fb2] text-white hover:bg-[#225587]"
            >
              {isSubmitting ? "Salvando..." : task?.id ? "Salvar tarefa" : "Criar tarefa"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddTaskModal;
