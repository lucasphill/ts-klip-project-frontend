import { Bell, Calendar, ChevronLeft, ChevronRight, Hash, Home, LogOut, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type FC, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { NavItemProps } from "../types/types";
import Footer from "./Footer";
import AddTaskModal from "./AddTaskModal";
import AddProjectModal from "./AddProjectModal";
import { useLoading } from "../contexts/LoadingContext";

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  // `owner_id` stores the Auth0 user id (e.g. 'auth0|123456')
  owner_id?: string;
}

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { withLoading } = useLoading();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectSearch, setProjectSearch] = useState('');


  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Design System', description: 'Componentes e tokens', color: '#6366f1', owner_id: 'auth0|1' },
    { id: 'p2', name: 'Backend API', description: 'Endpoints e autenticação', color: '#10b981', owner_id: 'auth0|1' },
    { id: 'p3', name: 'Marketing Q1', description: 'Campanhas e ativos', color: '#ec4899', owner_id: 'auth0|2' },
  ]);

  // Filtros
  const filteredProjects = useMemo(() =>
    projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase())),
    [projects, projectSearch]
  );

  // Determinar aba ativa baseado na URL
  const activeTab = location.pathname === '/' ? 'home' : location.pathname.substring(1);

  // Handlers
  const handleSaveTask = async (task: any) => {
    await withLoading(
      new Promise((resolve) => {
        setTimeout(() => {
          console.log('Task saved:', task);
          // TODO: Implement API call
          resolve(task);
        }, 500);
      })
    );
  };

  const handleSaveProject = async (project: any) => {
    await withLoading(
      new Promise((resolve) => {
        setTimeout(() => {
          if (project.id) {
            // Edit existing
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, ...project } : p));
          } else {
            // Add new
            const newProject = { ...project, id: `p-${Date.now()}` };
            setProjects(prev => [...prev, newProject]);
          }
          resolve(project);
        }, 500);
      })
    );
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setShowNewProjectModal(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (activeTab === projectId) {
        navigate('/');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 font-sans">

      {/* GLOBAL TOP BAR */}
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">

        {/* Left: Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">Klip App</span>
        </button>

        {/* Right: User Profile (Auth0 Mock) */}
        <div className="flex items-center gap-4">

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <div className="flex items-center gap-3 pl-1">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-700 leading-none">email@email.com</div>
              <div className="text-xs text-slate-400 mt-1 leading-none">email@email.com</div>
            </div>
            <div className="relative group cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-200 flex items-center justify-center text-sm font-bold">
                EE
              </div>
            </div>
            <button className="w-full text-left py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT WRAPPER: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* --- SIDEBAR --- */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-50 border-r border-slate-200 transition-all duration-300 flex flex-col relative shrink-0`}>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-6 z-30 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-all"
            title={isSidebarOpen ? 'Recolher sidebar' : 'Expandir sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          <div className="p-4">
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center justify-center gap-2 w-full bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm text-slate-600 font-medium py-2 rounded-xl transition-all"
            >
              <Plus size={18} className="text-indigo-600" />
              {isSidebarOpen && <span>Nova Tarefa</span>}
            </button>
          </div>

          <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
            <NavItem
              icon={<Home size={20} />}
              label="Inbox"
              active={activeTab === 'home'}
              onClick={() => navigate('/')}
              isOpen={isSidebarOpen}
            />
            <NavItem
              icon={<Calendar size={20} />}
              label="Esta Semana"
              active={activeTab === 'week'}
              onClick={() => navigate('/week')}
              isOpen={isSidebarOpen}
            />

            <div className="pt-6 px-2 mb-2">
              {isSidebarOpen && (
                <div className="flex items-center justify-between px-1 mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projetos</p>
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}

              {isSidebarOpen && (
                <div className="relative mb-2">
                  <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full bg-slate-100 focus:bg-white border-transparent focus:border-indigo-200 rounded-md py-1.5 pl-8 pr-2 text-xs outline-none transition-all"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-0.5">
                {filteredProjects.map(project => (
                  <div key={project.id} className="group flex items-center gap-1 px-1">
                    <button
                      onClick={() => navigate(`/${project.id}`)}
                      className={`group flex items-center justify-between flex-1 px-3 py-2 rounded-xl transition-all
                        ${activeTab === project.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span
                          className={`transition-colors ${activeTab === project.id ? 'text-indigo-600' : 'group-hover:text-slate-700'}`}
                          style={{ color: activeTab === project.id ? undefined : project.color }}
                        >
                          <Hash size={18} />
                        </span>
                        {isSidebarOpen && <span className="text-sm truncate">{project.name}</span>}
                      </div>
                    </button>
                    {isSidebarOpen && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="Editar projeto"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Excluir projeto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
      <Footer />

      {/* Modals */}
      <AddTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSave={handleSaveTask}
      />
      <AddProjectModal
        isOpen={showNewProjectModal}
        onClose={() => {
          setShowNewProjectModal(false);
          setProjectToEdit(null);
        }}
        onSave={handleSaveProject}
        project={projectToEdit}
      />
    </div>
  );
};

const NavItem = ({ icon, label, active, isOpen, onClick, badge, color }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`group flex items-center justify-between w-full px-3 py-2 rounded-xl transition-all
      ${active
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`
    }>
    <div className="flex items-center gap-3 overflow-hidden">
      <span className={`transition-colors ${active ? 'text-indigo-600' : 'group-hover:text-slate-700'}`} style={{ color: !active ? color : undefined }}>
        {icon}
      </span>
      {isOpen && <span className="text-sm truncate">{label}</span>}
    </div>
    {isOpen && badge !== undefined && badge > 0 && (
      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md group-hover:bg-indigo-200 group-hover:text-indigo-700">
        {badge}
      </span>
    )}
  </button>
);