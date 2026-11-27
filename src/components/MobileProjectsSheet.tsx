import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { GetProjectGroupDto, GetProjectsDto } from "../types/apiTypes";
import { groupProjects } from "../lib/projectGrouping";
import { getColorDotProps, getGroupIconComponent } from "../lib/projectVisuals";
import { useKeyboardViewport } from "../hooks/useKeyboardViewport";

/** Altura da barra de navegação inferior (h-16), em px. */
const BOTTOM_NAV_HEIGHT = 64;
/** Quanto é preciso arrastar a alça para baixo para fechar a folha. */
const DRAG_CLOSE_THRESHOLD = 90;

type MenuTarget =
  | { type: "project"; project: GetProjectsDto }
  | { type: "group"; group: GetProjectGroupDto };

type MobileProjectsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  projects: GetProjectsDto[];
  projectGroups: GetProjectGroupDto[];
  activeProjectId: string;
  collapsedGroupIds: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onSelectProject: (project: GetProjectsDto) => void;
  onNewProject: () => void;
  onNewGroup: () => void;
  onAddProjectToGroup: (groupId: string) => void;
  onEditProject: (project: GetProjectsDto) => void;
  onArchiveProject: (project: GetProjectsDto) => void;
  onDeleteProject: (project: GetProjectsDto) => void;
  onEditGroup: (group: GetProjectGroupDto) => void;
  onDeleteGroup: (group: GetProjectGroupDto) => void;
  onOpenArchived: () => void;
};

const ProjectDot = ({ color }: { color?: string }) => {
  const dot = getColorDotProps(color);
  return (
    <span
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot?.className ?? "bg-[var(--text-faint)]"}`}
      style={dot?.style}
    />
  );
};

/**
 * Folha de projetos do mobile: sobe da barra inferior, perto do polegar, e mostra só os
 * projetos (Inbox, Calendário e Ajustes já estão na barra).
 */
const MobileProjectsSheet = ({
  isOpen,
  onClose,
  isLoading,
  projects,
  projectGroups,
  activeProjectId,
  collapsedGroupIds,
  onToggleGroup,
  onSelectProject,
  onNewProject,
  onNewGroup,
  onAddProjectToGroup,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  onEditGroup,
  onDeleteGroup,
  onOpenArchived,
}: MobileProjectsSheetProps) => {
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState<MenuTarget | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const keyboard = useKeyboardViewport(isOpen);

  const { groupedProjects, rootProjects, visibleGroups, isSearching } = useMemo(
    () => groupProjects(projects, projectGroups, search),
    [projects, projectGroups, search]
  );

  useEffect(() => {
    if (isOpen) return;
    setSearch("");
    setMenu(null);
    setDragY(0);
    setIsDragging(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (menu) setMenu(null);
      else onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, menu, onClose]);

  // Mostra um degradê no rodapé da lista enquanto houver itens para rolar.
  const updateHasMoreBelow = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setHasMoreBelow(list.scrollHeight - list.scrollTop - list.clientHeight > 4);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateHasMoreBelow();
  }, [isOpen, isLoading, rootProjects, visibleGroups, collapsedGroupIds, keyboard?.height, updateHasMoreBelow]);

  if (!isOpen) return null;

  // Com o teclado aberto, a folha desce até a borda da área visível (o teclado cobre a barra).
  const bottom = keyboard ? Math.max(0, window.innerHeight - keyboard.top - keyboard.height) : BOTTOM_NAV_HEIGHT;
  const maxHeight = keyboard ? Math.max(240, keyboard.height - 16) : undefined;

  const handleDragStart = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartY.current = event.clientY;
    setIsDragging(true);
  };
  const handleDragMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    setDragY(Math.max(0, event.clientY - dragStartY.current));
  };
  const handleDragEnd = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;
    setIsDragging(false);
    if (dragY > DRAG_CLOSE_THRESHOLD) onClose();
    setDragY(0);
  };

  const renderProjectRow = (project: GetProjectsDto, indented: boolean) => {
    const isActive = project.id === activeProjectId;
    return (
      <div
        key={project.id}
        className={`flex h-12 items-center rounded-xl ${indented ? "ml-5" : ""} ${
          isActive ? "bg-[var(--brand)]/12 text-[var(--brand)]" : "text-[var(--text-primary)]"
        }`}
      >
        <button
          type="button"
          onClick={() => onSelectProject(project)}
          aria-current={isActive ? "page" : undefined}
          className={`flex h-full min-w-0 flex-1 items-center gap-3 rounded-xl pl-3 text-left text-[15px] ${
            isActive ? "font-semibold" : "font-medium"
          }`}
        >
          <ProjectDot color={project.color} />
          <span className="truncate">{project.name}</span>
        </button>
        <button
          type="button"
          onClick={() => setMenu({ type: "project", project })}
          aria-label={`Ações do projeto ${project.name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--text-faint)] active:bg-[var(--bg-soft)]"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    );
  };

  const hasContent = rootProjects.length > 0 || visibleGroups.length > 0;

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-30 bg-black/45 backdrop-blur-[2px]"
        style={{ bottom }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label="Projetos"
        className="projects-sheet-enter fixed inset-x-0 z-30 flex max-h-[72dvh] flex-col rounded-t-3xl border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[0_-12px_32px_rgba(0,0,0,0.25)]"
        style={{
          bottom,
          maxHeight,
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? "none" : "transform 0.2s ease",
        }}
      >
        <div
          className="touch-none select-none"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <div className="flex justify-center pb-1 pt-2.5">
            <span className="h-1 w-10 rounded-full bg-[var(--border-muted)]" />
          </div>
          <div className="flex items-center justify-between px-5 pb-1 pt-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Projetos</h2>
            <div className="flex items-center gap-1" onPointerDown={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={onNewGroup}
                aria-label="Nova pasta"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-muted)] active:bg-[var(--bg-soft)]"
              >
                <FolderPlus size={20} />
              </button>
              <button
                type="button"
                onClick={onNewProject}
                aria-label="Novo projeto"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand)] text-white active:bg-[var(--brand-strong)]"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={listRef}
            onScroll={updateHasMoreBelow}
            className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-3"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-1.5 py-10" aria-label="Carregando projetos">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)]" />
              </div>
            ) : !hasContent ? (
              <p className="px-3 py-8 text-center text-sm text-[var(--text-faint)]">
                {isSearching ? "Nenhum projeto encontrado." : "Nenhum projeto ou pasta."}
              </p>
            ) : (
              <>
                {rootProjects.length > 0 && <div className="space-y-0.5">{rootProjects.map((p) => renderProjectRow(p, false))}</div>}

                {visibleGroups.map((group) => {
                  const groupProjectList = groupedProjects.get(group.id) ?? [];
                  const isCollapsed = collapsedGroupIds.has(group.id) && !isSearching;
                  const GroupIcon = getGroupIconComponent(group.icon);
                  return (
                    <div key={group.id}>
                      <div className="flex h-11 items-center text-[var(--text-secondary)]">
                        <button
                          type="button"
                          onClick={() => onToggleGroup(group.id)}
                          aria-expanded={!isCollapsed}
                          className="flex h-full min-w-0 flex-1 items-center gap-2 rounded-xl pl-3 text-left"
                        >
                          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                          <GroupIcon size={16} style={{ color: group.color || "var(--text-muted)" }} className="shrink-0" />
                          <span className="truncate text-xs font-semibold uppercase tracking-wide">{group.name}</span>
                          <span className="rounded-full bg-[var(--bg-soft-strong)] px-1.5 text-[10px] text-[var(--text-muted)]">
                            {groupProjectList.length}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddProjectToGroup(group.id)}
                          aria-label={`Novo projeto em ${group.name}`}
                          className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--text-faint)] active:bg-[var(--bg-soft)]"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMenu({ type: "group", group })}
                          aria-label={`Ações da pasta ${group.name}`}
                          className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--text-faint)] active:bg-[var(--bg-soft)]"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                      {!isCollapsed && groupProjectList.length > 0 && (
                        <div className="space-y-0.5">{groupProjectList.map((p) => renderProjectRow(p, true))}</div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
          {hasMoreBelow && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--bg-panel)] to-transparent"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] px-4 py-3">
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar projeto…"
              aria-label="Buscar projeto"
              className="field h-11 w-full pl-10 pr-10 text-base"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Limpar busca"
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-faint)]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenArchived}
            className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-3.5 text-sm font-medium text-[var(--text-secondary)] active:bg-[var(--bg-soft)]"
          >
            <Archive size={16} />
            Arquivados
          </button>
        </div>
      </div>

      {menu && (
        <>
          <div className="fixed inset-0 z-[45] bg-black/50" onClick={() => setMenu(null)} aria-hidden="true" />
          <div
            role="dialog"
            aria-label={menu.type === "project" ? menu.project.name : menu.group.name}
            className="projects-sheet-enter fixed inset-x-0 bottom-0 z-[45] rounded-t-3xl border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_32px_rgba(0,0,0,0.3)]"
          >
            <p className="truncate px-3 pb-2 text-sm font-semibold text-[var(--text-muted)]">
              {menu.type === "project" ? menu.project.name : menu.group.name}
            </p>
            <div className="space-y-0.5">
              {menu.type === "project" ? (
                <>
                  <ActionButton icon={<Pencil size={18} />} label="Editar projeto" onClick={() => { const target = menu.project; setMenu(null); onEditProject(target); }} />
                  <ActionButton icon={<Archive size={18} />} label="Arquivar projeto" onClick={() => { const target = menu.project; setMenu(null); onArchiveProject(target); }} />
                  <ActionButton icon={<Trash2 size={18} />} label="Excluir projeto" danger onClick={() => { const target = menu.project; setMenu(null); onDeleteProject(target); }} />
                </>
              ) : (
                <>
                  <ActionButton icon={<Plus size={18} />} label="Novo projeto na pasta" onClick={() => { const target = menu.group; setMenu(null); onAddProjectToGroup(target.id); }} />
                  <ActionButton icon={<Pencil size={18} />} label="Editar pasta" onClick={() => { const target = menu.group; setMenu(null); onEditGroup(target); }} />
                  <ActionButton icon={<Trash2 size={18} />} label="Excluir pasta" danger onClick={() => { const target = menu.group; setMenu(null); onDeleteGroup(target); }} />
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMenu(null)}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[15px] font-medium text-[var(--text-secondary)] active:bg-[var(--bg-soft)]"
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </>
  );
};

const ActionButton = ({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium active:bg-[var(--bg-soft)] ${
      danger ? "text-red-600 dark:text-red-400" : "text-[var(--text-primary)]"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default MobileProjectsSheet;
