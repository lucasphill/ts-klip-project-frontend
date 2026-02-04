import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import type { CreateProjectDto, CreateTaskDto, GetProjectsDto } from "../types/apiTypes";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Hash,
  Home,
  Pencil,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import NavItem from "./NavItem";
import AddTaskModal from "./AddTaskModal";
import AddProjectModal from "./AddProjectModal";

const Sidebar = () => {
  const navigate = useNavigate();

  const activeTab = location.pathname === '/' ? 'home' : location.pathname.substring(1);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectToEdit, setProjectToEdit] = useState<GetProjectsDto | null>(null);

  const [projects, setProjects] = useState<GetProjectsDto[]>([
    { id: 'p1', name: 'Design System', description: 'Componentes e tokens', color: '#6366f1', createdAt: new Date().toISOString() },
    { id: 'p4', name: 'Design', description: 'Componentes e tokens', color: '#0400ff', createdAt: new Date().toISOString() },
    { id: 'p2', name: 'Backend API', description: 'Endpoints e autenticação', color: '#10b981', createdAt: new Date().toISOString() },
    { id: 'p3', name: 'Marketing Q1', description: 'Campanhas e ativos', color: '#ec4899', createdAt: new Date().toISOString() },
  ]);

  const filteredProjects = useMemo(() =>
    projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase())),
    [projects, projectSearch]
  );


  //#region Handlers
  const handleSaveTask = async (task: CreateTaskDto) => {
    toast.success('Tarefa salva com sucesso (simulação)! ' + task.title);
  };

  const handleSaveProject = async (project: CreateProjectDto) => {
    toast.success('Projeto salvo com sucesso (simulação)! ' + project.name);
  };

  const handleEditProject = (project: GetProjectsDto) => {
    toast.info('Editar projeto (simulação)! ' + project.name);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      toast.success('Projeto excluído com sucesso (simulação)! ID: ' + projectId);
    }
  };
  //#endregion

  return (
    <>
      <ToastContainer hideProgressBar closeOnClick closeButton position="top-center" />
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
    </>
  );
};

export default Sidebar;