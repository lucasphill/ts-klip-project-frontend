import { useState, type FC, type ReactNode } from "react";
import { Toaster } from "sonner";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomNavigation from "./BottomNavigation";
import { useTheme } from "../contexts/ThemeContext";

const SIDEBAR_EXPANDED_KEY = "klip_sidebar_expanded";

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const handleToggleDesktopSidebar = () => {
    setIsDesktopSidebarExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_EXPANDED_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Erro ao salvar preferência da barra lateral no localStorage:", e);
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Toaster position="top-center" richColors theme={theme} />
      <Navbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          isDesktopExpanded={isDesktopSidebarExpanded}
          isMobileOpen={isMobileSidebarOpen}
          onToggleDesktop={handleToggleDesktopSidebar}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-16 md:pb-0 [@media(max-height:600px)]:pb-16">
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-panel)]">
            {children}
          </main>
          <div className="hidden md:block [@media(max-height:600px)]:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-5 py-2.5">
            <Footer />
          </div>
        </div>
      </div>
      <BottomNavigation onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
    </div>
  );
};

export default Layout;
