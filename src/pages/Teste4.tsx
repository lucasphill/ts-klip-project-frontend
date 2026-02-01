import React, { useState, useMemo } from 'react';
import {
  Home,
  CheckCircle,
  Bell,
  Search,
  Plus,
  Menu,
  Layout,
  X,
  Filter,
  ArrowUpDown,
  ChevronRight,
  MoreVertical,
  Calendar,
  Hash
} from 'lucide-react';
import type { Project, Task } from '../types/types';

// --- COMPONENTE PRINCIPAL ---

export default function Teste4() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'inbox' | string>('home');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  // Estado inicial simulando dados do DB
  const [projects] = useState<Project[]>([
    { id: 'p1', name: 'Design System', color: '#6366f1', createdAt: new Date().toISOString(), ownerAuth0Id: 'auth0|1' },
    { id: 'p2', name: 'Backend API', color: '#10b981', createdAt: new Date().toISOString(), ownerAuth0Id: 'auth0|1' },
    { id: 'p3', name: 'Marketing Q1', color: '#ec4899', createdAt: new Date().toISOString(), ownerAuth0Id: 'auth0|1' },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', title: 'Revisar protótipo do App', isCompleted: false, projectId: 'p1', ownerAuth0Id: 'auth0|1', dueDate: '2024-10-25' },
    { id: 't2', title: 'Configurar Swagger', isCompleted: false, projectId: 'p2', ownerAuth0Id: 'auth0|1', dueDate: '2024-10-26' },
    { id: 't3', title: 'Criar Landing Page', isCompleted: true, projectId: 'p3', ownerAuth0Id: 'auth0|1' },
    { id: 't4', title: 'Fix: Erro de CORS', isCompleted: false, projectId: 'p2', ownerAuth0Id: 'auth0|1', parentTaskId: 't2' },
  ]);

  // Handlers
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  // Filtros
  const filteredProjects = useMemo(() =>
    projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase())),
    [projects, projectSearch]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase());
      if (activeTab === 'home') return matchesSearch;
      if (activeTab === 'inbox') return matchesSearch && !t.isCompleted;
      return matchesSearch && t.projectId === activeTab;
    });
  }, [tasks, taskSearch, activeTab]);

  const activeProjectName = useMemo(() => {
    if (activeTab === 'home') return 'Visão Geral';
    if (activeTab === 'inbox') return 'Caixa de Entrada';
    return projects.find(p => p.id === activeTab)?.name || 'Projeto';
  }, [activeTab, projects]);

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800 antialiased">

      {/* --- SIDEBAR --- */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-50 border-r border-slate-200 transition-all duration-300 flex flex-col relative shrink-0`}>
        <div className="h-16 flex items-center px-5 border-b border-slate-100/50">
          <div className="flex items-center gap-3 text-indigo-600 font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <CheckCircle size={18} strokeWidth={3} />
            </div>
            {isSidebarOpen && <span className="tracking-tight text-slate-800">Klip</span>}
          </div>
        </div>

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
            label="Página Inicial"
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
            isOpen={isSidebarOpen}
          />
          <NavItem
            icon={<Bell size={20} />}
            label="Inbox"
            active={activeTab === 'inbox'}
            onClick={() => setActiveTab('inbox')}
            isOpen={isSidebarOpen}
            badge={tasks.filter(t => !t.isCompleted).length}
          />

          <div className="pt-6 px-2 mb-2">
            {isSidebarOpen && (
              <div className="flex items-center justify-between px-1 mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projetos</p>
                <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Plus size={14} /></button>
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
                <NavItem
                  key={project.id}
                  icon={<Hash size={18} />}
                  label={project.name}
                  active={activeTab === project.id}
                  onClick={() => setActiveTab(project.id)}
                  isOpen={isSidebarOpen}
                  color={project.color}
                />
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 w-full p-1">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">AS</div>
            {isSidebarOpen && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold text-slate-700 truncate">Ana Silva</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* --- MAIN --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">{activeProjectName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
              <input
                type="text"
                placeholder="Filtrar nesta lista..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-48 md:w-64 transition-all"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <button className="flex items-center gap-1 hover:text-indigo-600"><Filter size={16} /> Filtrar</button>
                <button className="flex items-center gap-1 hover:text-indigo-600"><ArrowUpDown size={16} /> Ordenar</button>
              </div>
            </div>

            <div className="space-y-1">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  project={projects.find(p => p.id === task.projectId)}
                  onToggle={() => toggleTask(task.id)}
                />
              ))}

              {filteredTasks.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                  <Layout size={40} className="mx-auto mb-3 opacity-20" />
                  <p>Nenhuma tarefa encontrada.</p>
                </div>
              )}

              <button
                onClick={() => setShowNewTaskModal(true)}
                className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all group mt-4 border border-dashed border-slate-200"
              >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Adicionar tarefa em {activeProjectName}</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* --- MODAL --- */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Nova Tarefa</h3>
                <button onClick={() => setShowNewTaskModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Título da Tarefa</label>
                  <input type="text" placeholder="Ex: Finalizar documentação" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" autoFocus />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Notas</label>
                  <textarea placeholder="Detalhes adicionais..." className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none h-24" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Projeto</label>
                    <select className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none">
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Prazo</label>
                    <input type="date" className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button onClick={() => setShowNewTaskModal(false)} className="px-6 py-2.5 text-slate-600 font-medium">Cancelar</button>
                <button onClick={() => setShowNewTaskModal(false)} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Criar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTES ---

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
  onClick?: () => void;
  badge?: number;
  color?: string;
}

const NavItem = ({ icon, label, active, isOpen, onClick, badge, color }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`group flex items-center justify-between w-full px-3 py-2 rounded-xl transition-all
    ${active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
  `}>
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

interface TaskItemProps {
  task: Task;
  project?: Project;
  onToggle: () => void;
}

const TaskItem = ({ task, project, onToggle }: TaskItemProps) => (
  <div className={`flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group ${task.isCompleted ? 'opacity-60' : ''}`}>
    <button
      onClick={onToggle}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
      ${task.isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 group-hover:border-indigo-400'}`}
    >
      {task.isCompleted && <CheckCircle size={12} fill="currentColor" />}
    </button>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium truncate ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
          {task.title}
        </span>
        {task.parentTaskId && (
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">Subtarefa</span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-0.5">
        {project && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }}></div>
            {project.name}
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Calendar size={10} />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>

    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="p-1 text-slate-400 hover:text-indigo-600"><MoreVertical size={16} /></button>
    </div>
  </div>
);