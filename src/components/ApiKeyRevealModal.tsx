import { useState, type FC } from "react";
import { Copy, Check, Eye, EyeOff, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

type ApiKeyRevealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  keyValue: string;
  keyName: string;
};

const ApiKeyRevealModal: FC<ApiKeyRevealModalProps> = ({ isOpen, onClose, keyValue, keyName }) => {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopied(true);
      toast.success("Chave de API copiada para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar a chave. Por favor, tente selecionar e copiar manualmente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-lg animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5 shrink-0" /> Chave criada com sucesso
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Chave de API: <strong className="text-[var(--text-primary)]">{keyName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-5 py-5">
          {/* Warning Banner */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <span className="font-semibold block mb-1 text-amber-900 dark:text-amber-200">Importante:</span>
            Esta chave de API só será exibida **uma única vez**. Copie-a e guarde-a em um local seguro antes de fechar este modal. Você não poderá visualizá-la novamente depois de fechar.
          </div>

          {/* Key Value Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Sua Chave de API
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <input
                  type={showKey ? "text" : "password"}
                  readOnly
                  value={keyValue}
                  className="field h-9 w-full pr-10 pl-3 text-sm bg-[var(--field-bg)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  title={showKey ? "Ocultar chave" : "Mostrar chave"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] transition-all ${
                  copied
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                    : "bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]"
                }`}
                title="Copiar chave"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Close Action */}
          <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)] -mx-5 -mb-5 px-5 py-4 bg-[var(--bg-soft)] rounded-b-xl">
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              Eu salvei a chave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyRevealModal;
