import { useState, type FC, type ReactNode } from "react";
import { Toaster } from "sonner";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col text-slate-800">
      <Toaster position="top-center" richColors />
      <Navbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
      <div className="flex min-h-0 flex-1 overflow-hidden px-2 pb-2 md:px-3 md:pb-3">
        <div className="surface-panel relative flex min-h-0 w-full overflow-hidden">
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
      <div className="px-2 pb-2 md:px-3 md:pb-3">
        <div className="surface-panel px-4 py-2 md:px-6">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
