import { Home, CalendarDays, Folder, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type BottomNavigationProps = {
  onOpenSidebar: () => void;
};

const BottomNavigation = ({ onOpenSidebar }: BottomNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab =
    location.pathname === "/"
      ? "home"
      : location.pathname.startsWith("/calendar") || location.pathname.startsWith("/week")
        ? "calendar"
        : location.pathname.startsWith("/settings")
          ? "settings"
          : location.pathname.startsWith("/project/")
            ? "projects"
            : "";

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[var(--border-subtle)] bg-[var(--bg-panel)]/95 px-6 backdrop-blur shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden [@media(max-height:600px)]:block">
      <nav className="flex h-full items-center justify-between">
        {/* Inbox */}
        <button
          onClick={() => handleNavigate("/")}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
            activeTab === "home"
              ? "text-[var(--brand)] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px]">Inbox</span>
        </button>

        {/* Calendário */}
        <button
          onClick={() => handleNavigate("/calendar")}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
            activeTab === "calendar"
              ? "text-[var(--brand)] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <CalendarDays className="h-5 w-5" />
          <span className="text-[10px]">Calendário</span>
        </button>

        {/* Projetos */}
        <button
          onClick={onOpenSidebar}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
            activeTab === "projects"
              ? "text-[var(--brand)] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Folder className="h-5 w-5" />
          <span className="text-[10px]">Projetos</span>
        </button>

        {/* Configurações */}
        <button
          onClick={() => handleNavigate("/settings/profile")}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
            activeTab === "settings"
              ? "text-[var(--brand)] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px]">Ajustes</span>
        </button>
      </nav>
    </div>
  );
};

export default BottomNavigation;
