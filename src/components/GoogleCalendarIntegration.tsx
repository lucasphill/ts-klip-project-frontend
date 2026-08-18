import { useEffect, useState, type FC } from 'react';
import { Calendar, CheckCircle2, ExternalLink, Loader2, RefreshCw, Unlink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { googleCalendarApi } from '../services/api';
import type { GoogleCalendarStatusDto } from '../types/apiTypes';
import { CollapsibleSection, type CollapsibleBadge } from './CollapsibleSection';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface GoogleCalendarIntegrationProps {
  isOpen: boolean;
  onToggle: () => void;
  initialStatus?: GoogleCalendarStatusDto | null;
  onStatusChange?: (status: GoogleCalendarStatusDto | null) => void;
}

export const GoogleCalendarIntegration: FC<GoogleCalendarIntegrationProps> = ({
  isOpen,
  onToggle,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<GoogleCalendarStatusDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await googleCalendarApi.getStatus();
      const data = res.data ?? { isConnected: false, accountEmail: null, connectedAtUtc: null };
      setStatus(data);
      if (onStatusChange) {
        onStatusChange(data);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      const msg = error?.message ?? 'Erro ao verificar status do Google Calendar';
      setFetchError(msg);
      setStatus({ isConnected: false, accountEmail: null, connectedAtUtc: null });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchStatus();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await googleCalendarApi.getAuthUrl();
      if (res.data?.authUrl) {
        toast.info('Redirecionando para autorização no Google...');
        window.location.href = res.data.authUrl;
      } else {
        toast.error('Não foi possível obter o link de autorização do Google.');
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Erro ao iniciar conexão com o Google Calendar.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await googleCalendarApi.disconnect();
      toast.success('Google Calendar desconectado com sucesso.');
      setShowDisconnectModal(false);
      await fetchStatus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Erro ao desconectar Google Calendar.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatConnectionDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getBadge = (): CollapsibleBadge => {
    if (isLoading) {
      return { text: 'Carregando...', variant: 'neutral' };
    }
    if (status?.isConnected) {
      return { text: 'Conectado', variant: 'success' };
    }
    return { text: 'Desconectado', variant: 'neutral' };
  };

  return (
    <>
      <CollapsibleSection
        title="Google Calendar"
        description="Sincronize suas tarefas e prazos automaticamente com sua agenda do Google."
        icon={<Calendar className="w-5 h-5 text-amber-500" />}
        badge={getBadge()}
        isOpen={isOpen}
        onToggle={onToggle}
        headerAction={
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void fetchStatus();
            }}
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            title="Atualizar status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      >
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--brand)]" />
            <span>Verificando integração com o Google Calendar...</span>
          </div>
        ) : fetchError && !status?.isConnected ? (
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                Não foi possível verificar o status atual com o servidor.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchStatus()}
                className="h-7 text-xs"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : status?.isConnected ? (
          /* Connected State View */
          <div className="space-y-5">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Conta Google Conectada
                    </h3>
                    <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                      {status.accountEmail || 'E-mail não informado'}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Conectado em: {formatConnectionDate(status.connectedAtUtc)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisconnectModal(true)}
                  className="shrink-0 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  <Unlink className="w-3.5 h-3.5 mr-1.5" />
                  Desconectar
                </Button>
              </div>
            </div>

            <div className="text-xs text-[var(--text-muted)] space-y-1 bg-[var(--bg-secondary)] p-3.5 rounded-lg border border-[var(--border-subtle)]">
              <p className="font-medium text-[var(--text-secondary)]">Sincronização ativa:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>Tarefas com prazos definidos são refletidas na sua agenda do Google.</li>
                <li>Alterações e conclusões são sincronizadas de forma bidirecional.</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Disconnected State View */
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Conectar ao Google Calendar
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Autorize o Klip a gerenciar eventos no seu Google Calendar para que suas tarefas, prazos e compromissos apareçam automaticamente na sua agenda pessoal.
                </p>
              </div>

              <Button
                onClick={() => void handleConnect()}
                disabled={isConnecting}
                className="shrink-0 bg-[var(--brand)] hover:bg-[var(--brand-strong)] text-white text-xs h-9 px-4 inline-flex items-center gap-1.5"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    Conectar Google Calendar
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
              <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">Sincronização de Prazos:</span>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Visualize entregas e datas limite diretamente na sua visão de calendário diário e semanal.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">Controle e Privacidade:</span>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Você pode desconectar a sua conta ou revogar os acessos a qualquer momento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectModal} onOpenChange={setShowDisconnectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Unlink className="w-4 h-4 text-red-500" />
              Desconectar Google Calendar
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Tem certeza que deseja desconectar sua conta{' '}
              <strong className="text-[var(--text-primary)] font-mono">
                {status?.accountEmail ?? 'do Google'}
              </strong>
              ? As tarefas do Klip não serão mais sincronizadas com a sua agenda do Google.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDisconnectModal(false)}
              disabled={isDisconnecting}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => void handleDisconnect()}
              disabled={isDisconnecting}
              className="text-xs inline-flex items-center gap-1.5"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Desconectando...
                </>
              ) : (
                'Confirmar Desconexão'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoogleCalendarIntegration;
