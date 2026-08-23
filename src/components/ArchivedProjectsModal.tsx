import { useEffect, useState, type FC } from "react";
import { Archive, ArchiveRestore, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjectsContext } from "@/contexts/ProjectsContext";
import type { GetProjectsDto } from "@/types/apiTypes";
import DeleteProjectModal from "./DeleteProjectModal";

interface ArchivedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchivedProjectsModal: FC<ArchivedProjectsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { archivedProjects, fetchArchivedProjects, unarchiveProject, deleteProject } =
    useProjectsContext();
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<GetProjectsDto | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchArchivedProjects({ force: true })
        .catch((err) => toast.error(err?.message ?? "Erro ao carregar projetos arquivados"))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, fetchArchivedProjects]);

  const handleUnarchive = async (projectId: string, projectName: string) => {
    try {
      setActionInProgressId(projectId);
      await unarchiveProject(projectId);
      toast.success(`Projeto "${projectName}" desarquivado com sucesso!`);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao desarquivar projeto");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDelete = (project: GetProjectsDto) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (projectId: string, deleteTasks: boolean) => {
    try {
      await deleteProject(projectId, { deleteTasks });
      toast.success("Projeto excluído com sucesso!");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao excluir projeto");
      throw err;
    }
  };

  const formatArchivedDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="surface-panel w-[min(100%-1.5rem,42rem)] gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5">
          <DialogHeader className="border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-soft)] text-[var(--text-muted)]">
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-[var(--text-primary)]">
                  Projetos Arquivados
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--text-muted)]">
                  Consulte, desarquive ou exclua projetos que foram arquivados.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="mt-2 text-xs">Carregando projetos arquivados...</p>
            </div>
          ) : archivedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--text-muted)]">
              <Archive className="h-10 w-10 stroke-1 text-[var(--text-faint)]" />
              <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
                Nenhum projeto arquivado
              </p>
              <p className="mt-1 text-xs text-[var(--text-faint)]">
                Quando você arquiva um projeto, ele aparece aqui para consulta ou restauração.
              </p>
            </div>
          ) : (
            <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
              {archivedProjects.map((project) => {
                const isItemActionRunning = actionInProgressId === project.id;
                const archivedDate = formatArchivedDate(
                  project.archivedAt ?? (project as any).archived_at
                );

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-3 transition-colors hover:bg-[var(--bg-soft)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: project.color || "#94a3b8" }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {project.name}
                        </p>
                        {archivedDate && (
                          <p className="text-[11px] text-[var(--text-faint)]">
                            Arquivado em {archivedDate}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnarchive(project.id, project.name)}
                        disabled={isItemActionRunning}
                        className="h-8 gap-1.5 border-[var(--border-subtle)] text-xs text-[var(--text-primary)] hover:bg-[var(--bg-soft-strong)]"
                      >
                        {isItemActionRunning ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ArchiveRestore className="h-3.5 w-3.5 text-[var(--brand)]" />
                        )}
                        Desarquivar
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(project)}
                        disabled={isItemActionRunning}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                        title="Excluir definitivamente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteProjectModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProjectToDelete(null);
        }}
        project={projectToDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ArchivedProjectsModal;
