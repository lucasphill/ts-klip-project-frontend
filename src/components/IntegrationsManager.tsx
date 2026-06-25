import { useEffect, useState, type FC } from "react";
import { toast } from "sonner";
import { Key, Plus, Pencil, Trash2, Copy, Check, ShieldAlert, Cpu } from "lucide-react";
import { apiKeysApi } from "../services/api";
import type { CreateApiKeyDto, GetApiKeyDto } from "../types/apiTypes";
import ApiKeyFormModal from "./ApiKeyFormModal";
import ApiKeyRevealModal from "./ApiKeyRevealModal";

const IntegrationsManager: FC = () => {
  const [keys, setKeys] = useState<GetApiKeyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [keyToEdit, setKeyToEdit] = useState<GetApiKeyDto | null>(null);
  
  // Reveal state (for newly created key)
  const [revealedKeyValue, setRevealedKeyValue] = useState("");
  const [revealedKeyName, setRevealedKeyName] = useState("");

  // Copy tracking for existing keys
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const loadApiKeys = async () => {
    setIsLoading(true);
    try {
      const res = await apiKeysApi.getAll();
      setKeys(res.data ?? []);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao carregar chaves de API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadApiKeys();
  }, []);

  const handleCreate = async (data: CreateApiKeyDto) => {
    try {
      const res = await apiKeysApi.create(data);
      if (res.data) {
        setRevealedKeyValue(res.data.keyValue);
        setRevealedKeyName(res.data.name);
        setShowRevealModal(true);
      }
      toast.success(`Chave "${data.name}" criada com sucesso!`);
      await loadApiKeys();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao criar chave de API");
      throw err;
    }
  };

  const handleUpdate = async (data: CreateApiKeyDto) => {
    if (!keyToEdit) return;
    try {
      await apiKeysApi.update(keyToEdit.id, data);
      toast.success(`Chave "${data.name}" atualizada com sucesso!`);
      await loadApiKeys();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao atualizar chave de API");
      throw err;
    }
  };

  const handleDelete = async (key: GetApiKeyDto) => {
    if (!confirm(`Excluir a chave "${key.name}"? Qualquer aplicação externa usando esta chave perderá o acesso imediatamente.`)) return;
    try {
      await apiKeysApi.remove(key.id);
      setKeys((prev) => prev.filter((k) => k.id !== key.id));
      toast.success(`Chave "${key.name}" excluída.`);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao excluir chave de API");
    }
  };

  const handleCopyExisting = async (key: GetApiKeyDto) => {
    try {
      await navigator.clipboard.writeText(key.keyValue);
      setCopiedKeyId(key.id);
      toast.success("Chave copiada!");
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch {
      toast.error("Erro ao copiar a chave.");
    }
  };

  const openEdit = (key: GetApiKeyDto) => {
    setKeyToEdit(key);
    setShowFormModal(true);
  };

  const openCreate = () => {
    setKeyToEdit(null);
    setShowFormModal(true);
  };

  const formatKeyDisplay = (val: string) => {
    if (!val) return "—";
    // Se a chave já vier mascarada do backend ou se quisermos mascarar localmente:
    if (val.includes("•") || val.length <= 12) return val;
    return `${val.substring(0, 8)}...${val.substring(val.length - 4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)] text-white">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Integração com MCP Servers</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Os Model Context Protocol (MCP) Servers permitem que assistentes e agentes de IA se conectem de forma segura a bases de dados locais e ferramentas externas.
              Gere chaves de API para permitir que seus servidores MCP se autentiquem de forma segura com o Klip Project.
            </p>
          </div>
        </div>
      </div>

      {/* Main Keys List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Chaves de API</h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Gerencie chaves ativas para seus servidores e integrações.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3 text-xs font-medium text-white transition-colors hover:bg-[var(--brand-strong)]"
          >
            <Plus className="h-3.5 w-3.5" /> Nova chave de API
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">Carregando chaves de API...</div>
        ) : keys.length === 0 ? (
          // Empty state
          <div className="rounded-xl border border-dashed border-[var(--border-subtle)] py-12 text-center bg-[var(--bg-panel)]">
            <div className="mb-3 flex justify-center text-[var(--text-faint)]">
              <Key className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Nenhuma chave de API gerada</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
              Crie uma chave de API para começar a integrar o Klip Project com seu ambiente local via MCP.
            </p>
            <button
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:underline"
            >
              <Plus className="h-4 w-4" /> Criar primeira chave
            </button>
          </div>
        ) : (
          // Table list
          <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-soft)]">
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Nome</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Chave</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Criada em</th>
                  <th className="w-24 px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {keys.map((key) => (
                  <tr key={key.id} className="group transition-colors hover:bg-[var(--bg-soft)]">
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {key.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[var(--text-secondary)] select-all">
                          {formatKeyDisplay(key.keyValue)}
                        </span>
                        <button
                          onClick={() => void handleCopyExisting(key)}
                          className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)] transition-colors"
                          title="Copiar chave"
                        >
                          {copiedKeyId === key.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {new Date(key.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEdit(key)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                          title="Renomear"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => void handleDelete(key)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                          title="Excluir chave"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security note banner */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10 p-4">
        <div className="flex gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300">Aviso de Segurança</h4>
            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
              Nunca compartilhe suas chaves de API nem as insira em repositórios públicos. 
              Qualquer pessoa com acesso a elas pode ler, modificar e excluir dados do seu Klip Project.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApiKeyFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setKeyToEdit(null);
        }}
        onSave={keyToEdit ? handleUpdate : handleCreate}
        initialData={keyToEdit}
      />

      <ApiKeyRevealModal
        isOpen={showRevealModal}
        onClose={() => setShowRevealModal(false)}
        keyValue={revealedKeyValue}
        keyName={revealedKeyName}
      />
    </div>
  );
};

export default IntegrationsManager;
