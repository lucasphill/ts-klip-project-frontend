import { useState } from "react";
import { User, SlidersHorizontal, Sun, Moon, Cpu, AlertTriangle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useTasksContext } from "../contexts/TasksContext";
import { tasksApi, usersApi } from "../services/api";
import DeleteAccountModal from "../components/DeleteAccountModal";
import DeleteCompletedTasksModal from "../components/DeleteCompletedTasksModal";

const SettingsProfilePage = () => {
  const { user, logout } = useAuth();
  const { isDark, setTheme } = useTheme();
  const { removeTasksLocal, fetchTasks } = useTasksContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteCompletedModalOpen, setIsDeleteCompletedModalOpen] = useState(false);

  const handleDeleteCompletedTasks = async () => {
    try {
      const response = await tasksApi.deleteCompleted();
      const deletedCount = response.data?.deletedCount ?? 0;
      const deletedTaskIds = response.data?.deletedTaskIds ?? [];

      if (deletedTaskIds.length > 0) {
        removeTasksLocal(deletedTaskIds);
      }
      void fetchTasks({ force: true }).catch(() => undefined);

      if (deletedCount > 0) {
        toast.success(
          deletedCount === 1
            ? "1 tarefa concluída foi excluída com sucesso."
            : `${deletedCount} tarefas concluídas foram excluídas com sucesso.`
        );
      } else {
        toast.info("Nenhuma tarefa concluída encontrada para exclusão.");
      }
    } catch (error: unknown) {
      console.error("Failed to delete completed tasks:", error);
      let message = "Não foi possível excluir as tarefas concluídas no momento. Tente novamente mais tarde.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const res = (error as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) {
          message = res.data.message;
        }
      }
      toast.error(message);
      throw error;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await usersApi.deleteMe();
      toast.success("Sua conta e todos os dados foram excluídos com sucesso.");
      logout();
    } catch (error: unknown) {
      console.error("Failed to delete account:", error);
      let message = "Não foi possível excluir sua conta no momento. Tente novamente mais tarde.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const res = (error as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) {
          message = res.data.message;
        }
      }
      toast.error(message);
      throw error;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="sticky top-0 z-10 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <div className="mx-auto w-full max-w-3xl px-6">
          <div className="pt-6 pb-0">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Configurações</h1>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">Gerencie seu perfil e preferências</p>
          </div>
          <div className="mt-4 flex gap-0">
            <Link
              to="/settings/profile"
              className="flex items-center gap-1.5 border-b-2 border-[var(--brand)] px-4 py-2.5 text-sm font-medium text-[var(--brand)] transition-colors"
            >
              <User size={15} />
              Perfil
            </Link>
            <Link
              to="/settings/custom-fields"
              className="flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <SlidersHorizontal size={15} />
              Campos Personalizados
            </Link>
            <Link
              to="/settings/integrations"
              className="flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <Cpu size={15} />
              Integrações
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          <div className="max-w-3xl">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Aparência</h2>
              <p className="text-sm text-[var(--text-muted)] mb-5">Escolha como o Klip deve ser exibido para você</p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                    !isDark
                      ? "border-[var(--brand)] bg-[var(--bg-soft)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-muted)] hover:bg-[var(--bg-soft)]"
                  }`}
                >
                  <Sun className={`h-5 w-5 shrink-0 ${!isDark ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`} />
                  <span className={`text-sm font-medium ${!isDark ? "text-[var(--brand)]" : "text-[var(--text-secondary)]"}`}>
                    Claro
                  </span>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                    isDark
                      ? "border-[var(--brand)] bg-[var(--bg-soft)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-muted)] hover:bg-[var(--bg-soft)]"
                  }`}
                >
                  <Moon className={`h-5 w-5 shrink-0 ${isDark ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`} />
                  <span className={`text-sm font-medium ${isDark ? "text-[var(--brand)]" : "text-[var(--text-secondary)]"}`}>
                    Escuro
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6">
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

            {/* Danger Zone */}
            <div className="mt-6 rounded-xl border border-red-500/30 bg-[var(--bg-panel)] p-6 dark:border-red-500/20 space-y-6">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Zona de Perigo
                </h2>
                <p className="text-xs text-[var(--text-muted)] max-w-md leading-relaxed">
                  Ações irreversíveis de limpeza de dados e gerenciamento de conta.
                </p>
              </div>

              <hr className="border-red-500/20" />

              {/* Excluir Tarefas Concluídas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Excluir Tarefas Concluídas
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-md leading-relaxed">
                    Apaga permanentemente todas as tarefas marcadas como concluídas em todos os seus projetos e na Inbox.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteCompletedModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100 hover:text-red-800 active:bg-red-200 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Concluídas
                </button>
              </div>

              <hr className="border-red-500/20" />

              {/* Excluir Conta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Excluir Conta Permanentemente
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-md leading-relaxed">
                    A exclusão da conta é irreversível e removerá permanentemente todas as suas tarefas, projetos, campos personalizados e conexões ativas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 active:bg-red-800 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteCompletedTasksModal
        isOpen={isDeleteCompletedModalOpen}
        onClose={() => setIsDeleteCompletedModalOpen(false)}
        onConfirm={handleDeleteCompletedTasks}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        userEmail={user?.email}
      />
    </div>
  );
};

export default SettingsProfilePage;
