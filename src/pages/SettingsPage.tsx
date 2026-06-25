import { useState } from "react";
import { User, SlidersHorizontal, Cpu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useProjectsContext } from "../contexts/ProjectsContext";
import CustomFieldsManager from "../components/CustomFieldsManager";
import IntegrationsManager from "../components/IntegrationsManager";

type Tab = "profile" | "custom-fields" | "integrations";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Perfil", icon: <User size={15} /> },
  { id: "custom-fields", label: "Campos Personalizados", icon: <SlidersHorizontal size={15} /> },
  { id: "integrations", label: "Integrações", icon: <Cpu size={15} /> },
];

const SettingsPage = () => {
  const { user } = useAuth();
  const { projects } = useProjectsContext();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Sticky header + tabs */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="pt-6 pb-0">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Configurações</h1>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">Gerencie seu perfil e preferências</p>
          </div>
          <div className="mt-4 flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id
                    ? "border-[var(--brand)] text-[var(--brand)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-6 py-6">

          {/* Profile tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 shadow-sm">
                <div className="flex items-center gap-5">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name ?? "Avatar"}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-[var(--border-subtle)]"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-soft-strong)] text-[var(--text-muted)]">
                      <User size={28} />
                    </div>
                  )}
                  <div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">{user?.name ?? "—"}</p>
                    <p className="text-sm text-[var(--text-muted)]">{user?.email ?? "—"}</p>
                  </div>
                </div>

                <hr className="my-5 border-[var(--border-subtle)]" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Nome</label>
                    <input
                      type="text"
                      value={user?.name ?? ""}
                      readOnly
                      className="field w-full cursor-not-allowed opacity-60"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Email</label>
                    <input
                      type="email"
                      value={user?.email ?? ""}
                      readOnly
                      className="field w-full cursor-not-allowed opacity-60"
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-[var(--text-faint)]">
                  As informações de perfil são gerenciadas pelo provedor de identidade (Auth0).
                </p>
              </div>
            </div>
          )}

          {/* Custom fields tab */}
          {activeTab === "custom-fields" && (
            <CustomFieldsManager projects={projects} />
          )}

          {/* Integrations tab */}
          {activeTab === "integrations" && (
            <IntegrationsManager />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

