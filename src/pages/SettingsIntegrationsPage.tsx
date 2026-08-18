import { useEffect, useState, type FC } from "react";
import { User, SlidersHorizontal, Cpu } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import IntegrationsManager from "../components/IntegrationsManager";
import GoogleCalendarIntegration from "../components/GoogleCalendarIntegration";
import { googleCalendarApi } from "../services/api";

const SettingsIntegrationsPage: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isMcpOpen, setIsMcpOpen] = useState<boolean>(true);
  const [isGoogleCalendarOpen, setIsGoogleCalendarOpen] = useState<boolean>(true);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state') ?? undefined;
    const error = searchParams.get('error');

    if (error) {
      toast.error('A autorização com o Google Calendar foi cancelada ou falhou.');
      navigate('/settings/integrations', { replace: true });
      return;
    }

    if (code) {
      const finalizeOAuth = async () => {
        try {
          await googleCalendarApi.handleCallback({ code, state });
          toast.success('Google Calendar conectado com sucesso!');
        } catch (err: unknown) {
          const errorMsg = (err as { message?: string })?.message ?? 'Erro ao finalizar integração com Google Calendar';
          toast.error(errorMsg);
        } finally {
          navigate('/settings/integrations', { replace: true });
        }
      };

      void finalizeOAuth();
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="sticky top-0 z-10 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <div className="mx-auto w-full max-w-3xl px-6">
          <div className="pt-6 pb-0">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Configurações</h1>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Gerencie suas chaves de API, ferramentas e integrações de serviços
            </p>
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
              className="flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <SlidersHorizontal size={15} />
              Campos Personalizados
            </Link>
            <Link
              to="/settings/integrations"
              className="flex items-center gap-1.5 border-b-2 border-[var(--brand)] px-4 py-2.5 text-sm font-medium text-[var(--brand)] transition-colors"
            >
              <Cpu size={15} />
              Integrações
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          <div className="space-y-6">
            {/* Google Calendar Collapsible Section */}
            <GoogleCalendarIntegration
              isOpen={isGoogleCalendarOpen}
              onToggle={() => setIsGoogleCalendarOpen((prev) => !prev)}
            />

            {/* MCP Servers Collapsible Section */}
            <IntegrationsManager
              isOpen={isMcpOpen}
              onToggle={() => setIsMcpOpen((prev) => !prev)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsIntegrationsPage;
