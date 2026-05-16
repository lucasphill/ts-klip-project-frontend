import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import type { CreateProjectDto, CreateTaskDto, GetProjectsDto } from "../types/apiTypes";
import { projectsApi, projectsTasksApi, tasksApi } from "../services/api";
import { useTasksContext } from "../contexts/TasksContext";
import { useProjectsContext } from "../contexts/ProjectsContext";
import NavItem from "./NavItem";
import AddTaskModal from "./AddTaskModal";
import AddProjectModal from "./AddProjectModal";

type SidebarProps = {
  isDesktopExpanded: boolean;
  isMobileOpen: boolean;
  onToggleDesktop: () => void;
  onCloseMobile: () => void;
};

const getColorDotProps = (color?: string): { className: string; style?: CSSProperties } | null => {
  if (!color) return null;
  if (color.startsWith("bg-")) return { className: color };
  return { className: "", style: { backgroundColor: color } };
};

const Sidebar = ({ isDesktopExpanded, isMobileOpen, onToggleDesktop, onCloseMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appendTask } = useTasksContext();
  const { projects, fetchProjects, removeProjectLocal } = useProjectsContext();

  const activeProjectId = location.pathname.startsWith("/project/")
    ? location.pathname.split("/")[2] ?? ""
    : "";
  const activeTab =
    location.pathname === "/"
      ? "home"
      : location.pathname.startsWith("/project/")
        ? activeProjectId
        : location.pathname.slice(1);
  const isExpanded = isDesktopExpanded || isMobileOpen;

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectToEdit, setProjectToEdit] = useState<GetProjectsDto | null>(null);

  useEffect(() => {
    fetchProjects().catch((error: any) => toast.error(error?.message ?? "Erro ao buscar projetos"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProjects = useMemo(
    () => projects.filter((project) => project.name.toLowerCase().includes(projectSearch.toLowerCase())),
    [projects, projectSearch]
  );

  const handleNavigate = (target: string) => {
    navigate(target);
    onCloseMobile();
  };

  const handleSaveTask = async (task: CreateTaskDto, selectedProjectIds: string[] = []): Promise<void> => {
    try {
      const response = await tasksApi.create(task);
      const createdTask = response.data;
      await Promise.all(
        Array.from(new Set(selectedProjectIds.filter(Boolean))).map((projectId) =>
          projectsTasksApi.assign(projectId, createdTask.id)
        )
      );
      appendTask(createdTask);
      toast.success(`Tarefa criada com sucesso: ${task.title}`);
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao criar tarefa");
      throw error;
    }
  };

  const handleSaveProject = async (project: CreateProjectDto & { id?: string }): Promise<void> => {
    try {
      if (project.id) {
        const { id, ...payload } = project;
        await projectsApi.update(id, payload);
        toast.success(`Projeto atualizado: ${project.name}`);
      } else {
        await projectsApi.create(project);
        toast.success(`Projeto criado: ${project.name}`);
      }
      await fetchProjects({ force: true });
      setProjectToEdit(null);
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao salvar projeto");
      throw error;
    }
  };

  const handleEditProject = (project: GetProjectsDto) => {
    setProjectToEdit(project);
    setShowNewProjectModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
    try {
      await projectsApi.remove(projectId);
      removeProjectLocal(projectId);
      toast.success("Projeto excluido com sucesso");
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao excluir projeto");
    }
  };

  return (
    <>
      {isMobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
          aria-label="Fechar menu lateral"
        />
      )}

      <aside
        className={`
          flex h-full flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-panel)]
          fixed inset-y-0 left-0 z-40 md:relative md:z-20
          ${isExpanded ? "w-[16rem]" : "w-[3.5rem]"}
          ${isMobileOpen ? "translate-x-0 mobile-sheet-enter" : "-translate-x-full md:translate-x-0"}
          transition-all duration-200
        `}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3 md:hidden">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Navegação</p>
          <button
            onClick={onCloseMobile}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-soft)]"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New task button */}
        <div className="p-2.5">
          <button
            onClick={() => { setShowNewTaskModal(true); onCloseMobile(); }}
            className={`flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-strong)] ${isExpanded ? "px-3" : "px-2"}`}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {isExpanded && <span>Nova tarefa</span>}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-2">
          <div className="space-y-0.5">
            <NavItem
              icon={<Home size={16} />}
              label="Inbox"
              active={activeTab === "home"}
              onClick={() => handleNavigate("/")}
              isOpen={isExpanded}
            />
            <NavItem
              icon={<CalendarDays size={16} />}
              label="Calendário"
              active={activeTab === "calendar" || activeTab === "week"}
              onClick={() => handleNavigate("/calendar")}
              isOpen={isExpanded}
            />
          </div>

          {/* Projects section */}
          <div className="space-y-1">
            {isExpanded && (
              <div className="flex items-center justify-between px-2 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">Projetos</p>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                  title="Novo projeto"
                >
                  <Plus size={13} />
                </button>
              </div>
            )}

            {isExpanded && (
              <div className="relative px-1">
                <Search size={12} className="pointer-events-none absolute left-4 top-2.5 text-[var(--text-faint)]" />
                <input
                  type="text"
                  placeholder="Buscar projeto"
                  className="field h-8 w-full bg-[var(--field-bg)] pl-8 pr-3 text-xs"
                  value={projectSearch}
                  onChange={(event) => setProjectSearch(event.target.value)}
                />
              </div>
            )}

            <div className="space-y-0.5">
              {filteredProjects.map((project) => {
                const colorDot = getColorDotProps(project.color);
                return (
                  <div key={project.id} className="group flex items-center rounded-lg">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNavigate(`/project/${project.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleNavigate(`/project/${project.id}`);
                        }
                      }}
                      className={`flex w-full cursor-pointer items-center rounded-lg px-2 py-1.5 text-sm transition-colors ${
                        isExpanded ? "justify-between" : "justify-center"
                      } ${
                        activeTab === project.id
                          ? "bg-[var(--bg-soft-strong)] text-[var(--text-primary)]"
                          : "text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${colorDot?.className ?? "bg-slate-400"}`} style={colorDot?.style} />
                        {isExpanded && <span className="truncate text-sm font-medium">{project.name}</span>}
                      </span>

                      {isExpanded && (
                        <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditProject(project); }}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); handleEditProject(project); } }}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                            title="Editar projeto"
                          >
                            <Pencil className="h-3 w-3" />
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); void handleDeleteProject(project.id); }}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); void handleDeleteProject(project.id); } }}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600"
                            title="Excluir projeto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredProjects.length === 0 && isExpanded && (
                <p className="px-2 py-2 text-xs text-[var(--text-faint)]">Nenhum projeto encontrado.</p>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom: settings + collapse */}
        <div className="border-t border-[var(--border-subtle)] p-2">
          <NavItem
            icon={<Settings size={16} />}
            label="Configurações"
            active={location.pathname.startsWith("/settings")}
            onClick={() => handleNavigate("/settings/profile")}
            isOpen={isExpanded}
          />
          <button
            onClick={onToggleDesktop}
            className={`mt-1 hidden w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)] md:flex ${isExpanded ? "justify-start" : "justify-center"}`}
          >
            {isDesktopExpanded ? <ChevronLeft className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            {isExpanded && <span>Recolher</span>}
          </button>
        </div>
      </aside>

      <AddTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSave={handleSaveTask}
        projects={projects}
      />
      <AddProjectModal
        isOpen={showNewProjectModal}
        onClose={() => { setShowNewProjectModal(false); setProjectToEdit(null); }}
        onSave={handleSaveProject}
        project={projectToEdit}
      />
    </>
  );
};

export default Sidebar;

