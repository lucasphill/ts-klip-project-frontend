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
    <div className="flex min-h-screen w-full flex-col text-slate-800">
      <Toaster position="top-center" richColors theme={theme} />
      <Navbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="relative flex min-h-0 w-full overflow-hidden">
          <Sidebar
            isDesktopExpanded={isDesktopSidebarExpanded}
            isMobileOpen={isMobileSidebarOpen}
            onToggleDesktop={() => setIsDesktopSidebarExpanded((prev) => !prev)}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
            {children}
          </main>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-white px-4 py-2 md:px-6">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
