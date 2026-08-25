import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Archive,
  Bookmark,
  Box,
  Briefcase,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code,
  Folder,
  FolderPlus,
  Heart,
  Home,
  Layout,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type {
  CreateProjectDto,
  CreateProjectGroupDto,
  CreateTaskDto,
  GetProjectGroupDto,
  GetProjectsDto,
} from "../types/apiTypes";
import { projectsApi, projectsTasksApi, tasksApi } from "../services/api";
import { useTasksContext } from "../contexts/TasksContext";
import { useProjectsContext } from "../contexts/ProjectsContext";
import NavItem from "./NavItem";
import AddTaskModal from "./AddTaskModal";
import AddProjectModal from "./AddProjectModal";
import AddProjectGroupModal from "./AddProjectGroupModal";
import DeleteProjectModal from "./DeleteProjectModal";
import ArchivedProjectsModal from "./ArchivedProjectsModal";

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

const getGroupIconComponent = (iconName?: string) => {
  switch (iconName) {
    case "briefcase":
      return Briefcase;
    case "users":
      return Users;
    case "star":
      return Star;
    case "sparkles":
      return Sparkles;
    case "heart":
      return Heart;
    case "tag":
      return Tag;
    case "bookmark":
      return Bookmark;
    case "code":
      return Code;
    case "layout":
      return Layout;
    case "box":
      return Box;
    case "folder":
    default:
      return Folder;
  }
};

const Sidebar = ({ isDesktopExpanded, isMobileOpen, onToggleDesktop, onCloseMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appendTask } = useTasksContext();
  const {
    projects,
    fetchProjects,
    projectGroups,
    fetchProjectGroups,
    createProjectGroup,
    updateProjectGroup,
    deleteProjectGroup,
    archiveProject,
    deleteProject,
  } = useProjectsContext();

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
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);

  const [projectSearch, setProjectSearch] = useState("");
  const [projectToEdit, setProjectToEdit] = useState<GetProjectsDto | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<GetProjectGroupDto | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<GetProjectsDto | null>(null);
  const [targetGroupIdForNewProject, setTargetGroupIdForNewProject] = useState<string | null>(null);

  // Armazena quais grupos estão colapsados
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("klip_collapsed_groups");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    Promise.all([
      fetchProjects().catch((err: any) => toast.error(err?.message ?? "Erro ao buscar projetos")),
      fetchProjectGroups().catch((err: any) => toast.error(err?.message ?? "Erro ao buscar grupos")),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleGroupCollapse = (groupId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      try {
        localStorage.setItem("klip_collapsed_groups", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleNavigate = (target: string) => {
    navigate(target);
    onCloseMobile();
  };

  // Filtragem de busca
  const filteredProjects = useMemo(() => {
    const term = projectSearch.toLowerCase().trim();
    if (!term) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(term));
  }, [projects, projectSearch]);

  // Agrupamento de projetos
  const { groupedProjects, rootProjects } = useMemo(() => {
    const groupMap = new Map<string, GetProjectsDto[]>();
    const root: GetProjectsDto[] = [];
    const knownGroupIds = new Set(projectGroups.map((g) => g.id));

    filteredProjects.forEach((proj) => {
      const gId = proj.groupId ?? (proj as any).group_id;
      if (gId && knownGroupIds.has(gId)) {
        const list = groupMap.get(gId) || [];
        list.push(proj);
        groupMap.set(gId, list);
      } else {
        root.push(proj);
      }
    });

    return { groupedProjects: groupMap, rootProjects: root };
  }, [filteredProjects, projectGroups]);

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
      setTargetGroupIdForNewProject(null);
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao salvar projeto");
      throw error;
    }
  };

  const handleSaveGroup = async (groupData: CreateProjectGroupDto & { id?: string }): Promise<void> => {
    try {
      if (groupData.id) {
        const { id, ...payload } = groupData;
        await updateProjectGroup(id, payload);
        toast.success(`Grupo atualizado: ${groupData.name}`);
      } else {
        await createProjectGroup(groupData);
        toast.success(`Grupo criado: ${groupData.name}`);
      }
      setGroupToEdit(null);
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao salvar grupo");
      throw error;
    }
  };

  const handleEditGroup = (group: GetProjectGroupDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupToEdit(group);
    setShowNewGroupModal(true);
  };

  const handleDeleteGroup = async (group: GetProjectGroupDto, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Excluir a pasta "${group.name}"? Os projetos contidos nela serão movidos para a raiz com segurança.`)) {
      return;
    }
    try {
      await deleteProjectGroup(group.id);
      toast.success(`Grupo "${group.name}" excluído`);
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao excluir grupo");
    }
  };

  const handleAddProjectToGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetGroupIdForNewProject(groupId);
    setProjectToEdit(null);
    setShowNewProjectModal(true);
  };

  const handleEditProject = (project: GetProjectsDto) => {
    setProjectToEdit(project);
    setShowNewProjectModal(true);
  };

  const handleArchiveProject = async (project: GetProjectsDto) => {
    if (!confirm(`Deseja arquivar o projeto "${project.name}"? Ele deixará de aparecer na barra lateral e na Home ativa.`)) {
      return;
    }
    try {
      await archiveProject(project.id);
      toast.success(`Projeto "${project.name}" arquivado com sucesso`);
      if (activeProjectId === project.id) {
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao arquivar projeto");
    }
  };

  const handleDeleteProjectClick = (project: GetProjectsDto) => {
    setProjectToDelete(project);
    setShowDeleteProjectModal(true);
  };

  const handleConfirmDeleteProject = async (projectId: string, deleteTasks: boolean) => {
    try {
      await deleteProject(projectId, { deleteTasks });
      toast.success("Projeto excluído com sucesso");
      if (activeProjectId === projectId) {
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao excluir projeto");
      throw error;
    }
  };

  return (
    <>
      {isMobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden [@media(max-height:600px)]:block"
          onClick={onCloseMobile}
          aria-label="Fechar menu lateral"
        />
      )}

      <aside
        className={`
          flex h-full flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-panel)]
          fixed inset-y-0 left-0 z-40 md:relative md:z-20 [@media(max-height:600px)]:fixed [@media(max-height:600px)]:z-40
          ${isExpanded ? "w-[17rem]" : "w-[3.5rem]"}
          ${isMobileOpen ? "translate-x-0 mobile-sheet-enter" : "-translate-x-full md:translate-x-0 [@media(max-height:600px)]:md:-translate-x-full"}
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
            onClick={() => {
              setShowNewTaskModal(true);
              onCloseMobile();
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-strong)] ${
              isExpanded ? "px-3" : "px-2"
            }`}
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

          {/* Projects & Groups Section */}
          <div className="space-y-1.5">
            {isExpanded && (
              <div className="flex items-center justify-between px-2 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">
                  Projetos
                </p>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      setGroupToEdit(null);
                      setShowNewGroupModal(true);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                    title="Nova pasta / grupo"
                  >
                    <FolderPlus size={13} />
                  </button>
                  <button
                    onClick={() => {
                      setTargetGroupIdForNewProject(null);
                      setProjectToEdit(null);
                      setShowNewProjectModal(true);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                    title="Novo projeto"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            )}

            {isExpanded && (
              <div className="relative px-1 pb-1">
                <Search size={12} className="pointer-events-none absolute left-4 top-2.5 text-[var(--text-faint)]" />
                <input
                  type="text"
                  placeholder="Buscar projeto..."
                  className="field h-8 w-full bg-[var(--field-bg)] pl-8 pr-3 text-xs"
                  value={projectSearch}
                  onChange={(event) => setProjectSearch(event.target.value)}
                />
              </div>
            )}

            {/* Listagem de Projetos e Grupos */}
            <div className="space-y-1">
              {/* Projetos na Raiz (Sem Pasta) exibidos primeiro */}
              {rootProjects.length > 0 && (
                <div className="space-y-0.5">
                  {rootProjects.map((project) => {
                    const colorDot = getColorDotProps(project.color);
                    const isActive = activeTab === project.id;

                    return (
                      <div
                        key={project.id}
                        title={project.name}
                        className={`group flex items-center ${
                          isExpanded ? "justify-between" : "justify-center"
                        } rounded-lg px-2 py-1.5 text-xs transition-colors ${
                          isActive
                            ? "bg-[var(--bg-soft-strong)] text-[var(--text-primary)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => handleNavigate(`/project/${project.id}`)}
                          className={`flex ${
                            isExpanded ? "flex-1 min-w-0" : "justify-center"
                          } cursor-pointer items-center gap-2`}
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${colorDot?.className ?? "bg-slate-400"}`}
                            style={colorDot?.style}
                          />
                          {isExpanded && <span className="truncate text-sm font-medium">{project.name}</span>}
                        </div>

                        {isExpanded && (
                          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleEditProject(project)}
                              className="flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                              title="Editar projeto"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchiveProject(project)}
                              className="flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                              title="Arquivar projeto"
                            >
                              <Archive size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProjectClick(project)}
                              className="flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                              title="Excluir projeto"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Listagem de Grupos/Pastas abaixo dos projetos raiz */}
              {projectGroups.map((group) => {
                const groupProjects = groupedProjects.get(group.id) || [];
                const isCollapsed = collapsedGroupIds.has(group.id) && !projectSearch.trim();
                const IconComponent = getGroupIconComponent(group.icon);

                return (
                  <div key={group.id} className="space-y-0.5">
                    {/* Header do Grupo */}
                    {isExpanded ? (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleGroupCollapse(group.id)}
                        className="group flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-soft)]"
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => toggleGroupCollapse(group.id, e)}
                            className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          >
                            <ChevronDown
                              size={12}
                              className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                            />
                          </button>
                          <IconComponent
                            size={14}
                            className="shrink-0"
                            style={{ color: group.color || "var(--text-muted)" }}
                          />
                          <span className="truncate font-semibold text-[var(--text-primary)]">{group.name}</span>
                          <span className="ml-0.5 rounded-full bg-[var(--bg-soft-strong)] px-1.5 py-0.2 text-[10px] text-[var(--text-muted)]">
                            {groupProjects.length}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => handleAddProjectToGroup(group.id, e)}
                            className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                            title="Adicionar projeto nesta pasta"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleEditGroup(group, e)}
                            className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                            title="Editar pasta"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteGroup(group, e)}
                            className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                            title="Excluir pasta"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Versão colapsada da barra lateral */
                      <div
                        className="flex justify-center py-1.5"
                        title={`${group.name} (${groupProjects.length} projetos)`}
                      >
                        <IconComponent size={16} style={{ color: group.color || "var(--text-muted)" }} />
                      </div>
                    )}

                    {/* Projetos dentro do Grupo */}
                    {!isCollapsed && isExpanded && (
                      <div className="space-y-0.5 pl-3 border-l border-[var(--border-subtle)] ml-3">
                        {groupProjects.map((project) => {
                          const colorDot = getColorDotProps(project.color);
                          const isActive = activeTab === project.id;

                          return (
                            <div
                              key={project.id}
                              className={`group flex items-center justify-between rounded-lg px-2 py-1 text-xs transition-colors ${
                                isActive
                                  ? "bg-[var(--bg-soft-strong)] text-[var(--text-primary)]"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                              }`}
                            >
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => handleNavigate(`/project/${project.id}`)}
                                className="flex flex-1 min-w-0 cursor-pointer items-center gap-2"
                              >
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${colorDot?.className ?? "bg-slate-400"}`}
                                  style={colorDot?.style}
                                />
                                <span className="truncate">{project.name}</span>
                              </div>

                              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => handleEditProject(project)}
                                  className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                                  title="Editar projeto"
                                >
                                  <Pencil size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleArchiveProject(project)}
                                  className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                                  title="Arquivar projeto"
                                >
                                  <Archive size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProjectClick(project)}
                                  className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                                  title="Excluir projeto"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {groupProjects.length === 0 && (
                          <p className="py-1 text-[11px] italic text-[var(--text-faint)]">Pasta vazia</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredProjects.length === 0 && projectGroups.length === 0 && isExpanded && (
                <p className="px-2 py-3 text-xs text-[var(--text-faint)]">Nenhum projeto ou pasta.</p>
              )}
            </div>

            {/* Botão de Projetos Arquivados */}
            {isExpanded && (
              <div className="pt-2 border-t border-[var(--border-subtle)] mt-2">
                <button
                  type="button"
                  onClick={() => setShowArchivedModal(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                >
                  <Archive size={14} className="shrink-0" />
                  <span>Projetos arquivados</span>
                </button>
              </div>
            )}
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
            className={`mt-1 hidden w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)] md:flex ${
              isExpanded ? "justify-start" : "justify-center"
            }`}
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
        onClose={() => {
          setShowNewProjectModal(false);
          setProjectToEdit(null);
          setTargetGroupIdForNewProject(null);
        }}
        onSave={handleSaveProject}
        project={projectToEdit}
        defaultGroupId={targetGroupIdForNewProject}
      />
      <AddProjectGroupModal
        isOpen={showNewGroupModal}
        onClose={() => {
          setShowNewGroupModal(false);
          setGroupToEdit(null);
        }}
        onSave={handleSaveGroup}
        group={groupToEdit}
      />
      <ArchivedProjectsModal
        isOpen={showArchivedModal}
        onClose={() => setShowArchivedModal(false)}
      />
      <DeleteProjectModal
        isOpen={showDeleteProjectModal}
        onClose={() => {
          setShowDeleteProjectModal(false);
          setProjectToDelete(null);
        }}
        project={projectToDelete}
        onConfirm={handleConfirmDeleteProject}
      />
    </>
  );
};

export default Sidebar;
