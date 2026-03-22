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
  Trash2,
  X,
} from "lucide-react";
import type { CreateProjectDto, CreateTaskDto, GetProjectsDto } from "../types/apiTypes";
import { projectsApi, tasksApi } from "../services/api";
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

  if (color.startsWith("bg-")) {
    return { className: color };
  }

  return {
    className: "",
    style: { backgroundColor: color },
  };
};

const Sidebar = ({ isDesktopExpanded, isMobileOpen, onToggleDesktop, onCloseMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appendTask } = useTasksContext();
  const { projects, fetchProjects, removeProjectLocal } = useProjectsContext();

  const activeTab = location.pathname === "/" ? "home" : location.pathname.slice(1);
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

  const handleSaveTask = async (task: CreateTaskDto): Promise<void> => {
    try {
      const response = await tasksApi.create(task);
      appendTask(response.data);
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
      await fetchProjects();
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
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] md:hidden"
          onClick={onCloseMobile}
          aria-label="Fechar menu lateral"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur md:relative md:z-20 md:shadow-none
          ${isExpanded ? "w-[18.5rem]" : "w-[5.4rem]"}
          ${isMobileOpen ? "translate-x-0 mobile-sheet-enter" : "-translate-x-full md:translate-x-0"}
          transition-all duration-300
        `}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:hidden">
          <p className="text-sm font-semibold text-slate-700">Navegacao</p>
          <button
            onClick={onCloseMobile}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar menu lateral"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 md:p-4">
          <button
            onClick={() => {
              setShowNewTaskModal(true);
              onCloseMobile();
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f6fb2] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#225587]"
          >
            <Plus className="h-4 w-4" />
            {isExpanded && <span>Nova tarefa</span>}
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
          <div className="space-y-1">
            <NavItem
              icon={<Home size={18} />}
              label="Inbox"
              active={activeTab === "home"}
              onClick={() => handleNavigate("/")}
              isOpen={isExpanded}
            />
            <NavItem
              icon={<CalendarDays size={18} />}
              label="Calendario"
              active={activeTab === "calendar" || activeTab === "week"}
              onClick={() => handleNavigate("/calendar")}
              isOpen={isExpanded}
            />
          </div>

          <div className="space-y-2">
            {isExpanded && (
              <div className="flex items-center justify-between px-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Projetos</p>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  title="Novo projeto"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            {isExpanded && (
              <div className="relative px-1">
                <Search size={14} className="pointer-events-none absolute left-4 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar projeto"
                  className="field h-9 w-full bg-white pl-9 pr-3 text-sm"
                  value={projectSearch}
                  onChange={(event) => setProjectSearch(event.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              {filteredProjects.map((project) => {
                const colorDot = getColorDotProps(project.color);

                return (
                  <div key={project.id} className="group flex items-center rounded-xl">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNavigate(`/${project.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleNavigate(`/${project.id}`);
                        }
                      }}
                      className={`flex w-full items-center rounded-xl px-2.5 py-2 text-sm transition-all ${isExpanded ? "justify-between" : "justify-center"
                        } ${activeTab === project.id
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${colorDot?.className ?? ""}`} style={colorDot?.style} />
                        {isExpanded && <span className="truncate">{project.name}</span>}
                      </span>

                      {isExpanded && (
                        <span className="flex items-center gap-1">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleEditProject(project);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                handleEditProject(project);
                              }
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                            title="Editar projeto"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void handleDeleteProject(project.id);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                void handleDeleteProject(project.id);
                              }
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800"
                            title="Excluir projeto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredProjects.length === 0 && isExpanded && (
                <p className="px-2 py-2 text-xs text-slate-500">Nenhum projeto encontrado.</p>
              )}
            </div>
          </div>
        </nav>

        <div className="hidden px-3 py-3 md:block">
          <button
            onClick={onToggleDesktop}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            {isDesktopExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {isDesktopExpanded && <span>Recolher menu</span>}
          </button>
        </div>
      </aside>

      <AddTaskModal isOpen={showNewTaskModal} onClose={() => setShowNewTaskModal(false)} onSave={handleSaveTask} />
      <AddProjectModal
        isOpen={showNewProjectModal}
        onClose={() => {
          setShowNewProjectModal(false);
          setProjectToEdit(null);
        }}
        onSave={handleSaveProject}
        project={projectToEdit}
      />
    </>
  );
};

export default Sidebar;
