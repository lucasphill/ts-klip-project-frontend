import { useState, type FC, type ReactNode } from "react";
import { Toaster } from "sonner";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useTheme } from "../contexts/ThemeContext";

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Toaster position="top-center" richColors theme={theme} />
      <Navbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          isDesktopExpanded={isDesktopSidebarExpanded}
          isMobileOpen={isMobileSidebarOpen}
          onToggleDesktop={() => setIsDesktopSidebarExpanded((prev) => !prev)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-panel)]">
            {children}
          </main>
          <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-5 py-2.5">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
