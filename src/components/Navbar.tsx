import { useEffect } from "react";
import { LogOut, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const currentViewLabel =
    location.pathname === "/"
      ? "Inbox"
      : location.pathname.startsWith("/calendar") || location.pathname.startsWith("/week")
        ? "Calendario"
        : "Projeto";

  useEffect(() => {
    document.title = `Visualizacao: ${currentViewLabel} | Klip`;
  }, [currentViewLabel]);

  return (
    <header className="sticky top-0 z-30 px-2 pt-2 pb-2 md:px-3 md:pt-3 md:pb-3">
      <nav className="surface-glass flex h-16 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
            aria-label="Abrir menu lateral"
          >
            <Menu className="h-5 w-5" />
          </button>
          <a href="/" className="flex items-center gap-2.5 rounded-xl p-1 transition-opacity hover:opacity-85">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" viewBox="0 0 191 191">
              <g>
                <path d="M 75.00 29.77 L 75.00 160.00 L 71.75 159.90 C60.29,159.54 49.27,152.47 43.84,142.00 C41.51,137.53 41.50,137.27 41.22,96.10 L 41.21 95.49 C40.97,59.07 40.91,50.73 44.72,44.93 C45.88,43.17 47.38,41.65 49.35,39.65 C55.74,33.15 60.71,30.73 68.75,30.19 Z" fill="rgb(81, 142, 196)" />
                <path d="M 127.25 77.27 C116.94,87.28 103.44,100.40 97.25,106.43 L 86.00 117.39 L 86.00 71.41 L 97.00 61.50 C107.43,52.10 108.00,51.38 108.00,47.68 C108.00,42.45 111.39,36.71 116.00,34.12 C119.31,32.26 121.38,32.00 132.89,32.00 L 146.00 32.00 L 146.00 59.08 ZM 125.81 156.60 C122.88,158.08 118.30,159.33 114.45,159.69 L 108.00 160.29 L 108.00 131.56 L 102.75 126.25 L 97.50 120.93 L 106.02 112.72 C110.71,108.20 116.40,102.77 118.65,100.66 L 122.76 96.83 L 129.88 103.95 C133.80,107.87 138.19,113.41 139.63,116.27 C143.10,123.11 143.85,131.92 141.56,138.83 C139.41,145.28 132.30,153.31 125.81,156.60 Z" fill="rgb(235, 129, 86)" />
              </g>
            </svg>
            <span className="text-lg font-bold tracking-tight text-slate-900">Klip</span>
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-[220px] truncate text-sm font-semibold text-slate-700">
              {user?.name?.split(" ").slice(0, 2).join(" ") || user?.name}
            </p>
            <p className="max-w-[220px] truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-rose-600 transition-colors hover:bg-rose-50"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
