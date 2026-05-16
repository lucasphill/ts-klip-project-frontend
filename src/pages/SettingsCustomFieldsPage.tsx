import { User, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjectsContext } from "../contexts/ProjectsContext";
import CustomFieldsManager from "../components/CustomFieldsManager";

const SettingsCustomFieldsPage = () => {
  const { projects } = useProjectsContext();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="sticky top-0 z-10 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="pt-6 pb-0">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Configurações</h1>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">Gerencie seus campos personalizados</p>
          </div>
          <div className="mt-4 flex gap-0">
            <Link
              to="/settings/profile"
              className="flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <User size={15} />
              Perfil
            </Link>
            <Link
              to="/settings/custom-fields"
              className="flex items-center gap-1.5 border-b-2 border-[var(--brand)] px-4 py-2.5 text-sm font-medium text-[var(--brand)] transition-colors"
            >
              <SlidersHorizontal size={15} />
              Campos Personalizados
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-6">
          <CustomFieldsManager projects={projects} />
        </div>
      </div>
    </div>
  );
};

export default SettingsCustomFieldsPage;
