import { type FC } from 'react';
import { ExternalLink, Mail, ShieldAlert, CheckCircle2, RefreshCw, UserX } from 'lucide-react';
import LegalLayout from '../components/LegalLayout';
import { LEGAL_METADATA } from '../types/legalTypes';

export const PrivacyPolicyPage: FC = () => {
  return (
    <LegalLayout
      title="Política de Privacidade"
      subtitle="Saiba com total transparência como o Klip coleta, utiliza, armazena e protege seus dados e como funciona a integração com o Google Calendar."
      documentType="privacy"
      effectiveDate={LEGAL_METADATA.effectiveDate}
      version={LEGAL_METADATA.version}
    >
      {/* Intro Summary Box */}
      <div className="bg-[var(--bg-soft)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-7 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
          Resumo em Linguagem Clara
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          O <strong>{LEGAL_METADATA.appName}</strong> é um gerenciador de tarefas desenvolvido de forma independente por{' '}
          <a
            href={LEGAL_METADATA.developerGithub}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-[var(--text-primary)] hover:text-[#66ACCB]"
          >
            {LEGAL_METADATA.developerName}
          </a>
          . O compromisso é respeitar integralmente a sua privacidade: não há venda ou repasse de dados, não são exibidos anúncios publicitários e os acessos a serviços de terceiros (como o Google Calendar) são utilizados exclusivamente para viabilizar as funcionalidades que você solicitar na plataforma.
        </p>
      </div>

      {/* Section 1 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            1
          </span>
          Identificação do Controlador e Escopo
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-3 leading-relaxed">
          <p>
            Esta Política de Privacidade aplica-se a todos os serviços, interfaces e funcionalidades disponibilizados no domínio{' '}
            <a href={LEGAL_METADATA.appUrl} className="underline text-[var(--text-primary)] font-mono">
              {LEGAL_METADATA.appUrl}
            </a>
            .
          </p>
          <p>
            O controlador dos dados para os efeitos da Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) é{' '}
            <strong>{LEGAL_METADATA.developerName}</strong>, atuando como desenvolvedor independente do projeto indie {LEGAL_METADATA.appName}.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <span className="text-[var(--text-muted)]">Canal de Contato Oficial:</span>
            <a
              href={`mailto:${LEGAL_METADATA.contactEmail}`}
              className="inline-flex items-center gap-1.5 font-mono text-[var(--text-primary)] hover:text-[#66ACCB] underline"
            >
              <Mail className="w-3.5 h-3.5" />
              {LEGAL_METADATA.contactEmail}
            </a>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            2
          </span>
          Dados Pessoais Coletados e Finalidades de Uso
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-4 leading-relaxed">
          <p>Coletamos apenas os dados estritamente necessários para o funcionamento das ferramentas de produtividade:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-2">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                Autenticação e Perfil de Usuário
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                E-mail, nome e identificador único de usuário autenticado fornecidos através da infraestrutura de login gerenciada pelo <strong>Auth0</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-2">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                Conteúdo de Tarefas e Projetos
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Títulos de tarefas, descrições, sub-tarefas, status, datas de vencimento, prioridades e definições de campos customizados criados por você.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-2">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                Integrações Conectadas
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Endereço de e-mail da conta Google conectada e identificadores de eventos de agenda sincronizados pelo aplicativo.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-2">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                Telemetria e Desempenho
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Métricas anônimas de velocidade e desempenho agregadas fornecidas pelo Vercel Analytics e Speed Insights para melhoria contínua da aplicação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Google OAuth & Limited Use (CRITICAL) */}
      <section className="bg-[var(--bg-panel)] border-2 border-[#66ACCB]/30 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB] text-white text-xs font-bold">
              3
            </span>
            Integração com Google Calendar e Declaração de Uso Limitado
          </h2>
        </div>

        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-4 leading-relaxed">
          <p>
            Ao optar voluntariamente por conectar sua conta do Google ao {LEGAL_METADATA.appName}, solicitamos autorização por meio do protocolo OAuth 2.0 para acessar as seguintes informações e recursos do <strong>Google Calendar API</strong>:
          </p>

          <ul className="list-disc list-inside space-y-1.5 ml-2 text-xs sm:text-sm">
            <li>
              <strong>Escopos de Calendário:</strong> Leitura, criação, atualização e exclusão de eventos de compromissos gerados a partir dos prazos de tarefas do Klip.
            </li>
            <li>
              <strong>Identificação da Conta Google:</strong> Endereço de e-mail da conta vinculada para exibição de status no painel de configurações.
            </li>
          </ul>

          {/* Mandatory Google Limited Use Callout Box */}
          <div className="p-5 rounded-xl border border-[#66ACCB]/40 bg-[#66ACCB]/10 space-y-2.5">
            <div className="flex items-center gap-2 text-[#66ACCB] font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Conformidade com a Google API Services User Data Policy</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium leading-relaxed italic">
              &quot;O uso e a transferência para qualquer outro aplicativo de informações recebidas das APIs do Google pelo Klip obedecerão integralmente à{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-[#66ACCB] inline-flex items-center gap-1"
              >
                Google API Services User Data Policy
                <ExternalLink className="w-3 h-3" />
              </a>
              , incluindo os requisitos de Uso Limitado (Limited Use).&quot;
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="font-bold text-[var(--text-primary)] text-sm">
              Garantias Rígidas sobre seus Dados do Google:
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Não comercialização:</strong> Seus dados obtidos via Google nunca são vendidos, alugados ou transferidos a terceiros, corretores de dados ou parceiros comerciais.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Sem uso para publicidade:</strong> Não utilizamos seus dados do Google para fins de marketing, publicidade personalizada ou direcionamento de anúncios.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Sem treinamento de modelos de IA gerais:</strong> Os dados da sua agenda do Google não são utilizados para treinamento ou aperfeiçoamento de modelos de linguagem (LLMs) ou algoritmos de inteligência artificial de propósito geral.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            4
          </span>
          Armazenamento, Segurança e Retenção
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-4 leading-relaxed">
          <p>
            São adotadas rigorosas medidas técnicas e padrões de segurança de alto nível para proteger as suas informações pessoais e credenciais de integração contra acesso não autorizado, alteração, divulgação ou destruição:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-1.5">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Criptografia em Repouso (At Rest)
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Todos os dados persistidos — incluindo tarefas, projetos, notas, campos customizados e tokens OAuth do Google Calendar — são <strong>criptografados em repouso</strong> no banco de dados e nos volumes de armazenamento com padrões modernos de criptografia (como AES-256).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-1.5">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#66ACCB]" />
                Criptografia em Trânsito (In Transit)
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                100% das comunicações entre o seu navegador, a API do Klip e os serviços externos autorizados (Google e Auth0) são trafegadas através de conexões seguras criptografadas via protocolo <strong>HTTPS/TLS</strong>.
              </p>
            </div>
          </div>

          <ul className="list-disc list-inside space-y-1.5 ml-2 text-xs sm:text-sm pt-1">
            <li>
              <strong>Tokens de Integração:</strong> Tokens de acesso e tokens de atualização (*refresh tokens*) da API do Google Calendar são armazenados com chaves seguras e isoladas, nunca sendo expostos publicamente no código-fonte ou no frontend.
            </li>
            <li>
              <strong>Retenção de Dados:</strong> Os dados de tarefas e configurações permanecem armazenados apenas enquanto a sua conta de usuário estiver ativa na plataforma ou até que você solicite sua exclusão definitiva.
            </li>
            <li>
              <strong>Senhas e Acessos:</strong> O Klip não tem acesso à sua senha da conta Google ou a quaisquer outros arquivos do seu Google Drive ou serviços não autorizados explicitamente por você.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 5 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            5
          </span>
          Direitos do Usuário, Revogação e Exclusão de Dados
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-4 leading-relaxed">
          <p>
            Em conformidade com a LGPD e as diretrizes do Google, você detém controle total sobre suas informações:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-1.5">
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold text-sm">
                <RefreshCw className="w-4 h-4 text-[#66ACCB]" />
                <span>Desconexão Imediata por Auto-Serviço (Google Calendar)</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Você pode revogar a integração a qualquer momento em <strong>Configurações &gt; Integrações &gt; Google Calendar</strong> clicando no botão <em>&quot;Desconectar&quot;</em>. Isso apaga imediatamente todos os tokens de acesso armazenados e interrompe toda comunicação com sua agenda do Google.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-1.5">
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold text-sm">
                <ExternalLink className="w-4 h-4 text-[#66ACCB]" />
                <span>Revogação Centralizada no Painel do Google</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Você também pode revogar a permissão do Klip diretamente nas configurações de segurança da sua conta Google através da página de{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[var(--text-primary)] font-medium"
                >
                  Permissões de Aplicativos de Terceiros da Google
                </a>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-1.5">
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold text-sm">
                <UserX className="w-4 h-4 text-rose-500" />
                <span>Exclusão Completa de Conta e Dados no Aplicativo (Auto-Serviço)</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Você pode realizar a exclusão completa e definitiva da sua conta, tarefas, projetos, históricos e quaisquer configurações a qualquer momento diretamente pelo <strong>botão de exclusão de conta</strong> disponibilizado na página de <strong>Configurações do Perfil</strong> da aplicação. O acionamento remove irreversivelmente todos os seus dados e registros armazenados.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-1.5">
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold text-sm">
                <Mail className="w-4 h-4 text-[#66ACCB]" />
                <span>Canal de Atendimento para Solicitações de Privacidade</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Caso prefira ou necessite de auxílio para exercer qualquer direito previsto na LGPD (como confirmação de existência de tratamento, correção ou exclusão de dados), você também pode enviar uma solicitação diretamente para{' '}
                <a
                  href={`mailto:${LEGAL_METADATA.contactEmail}?subject=Solicita%C3%A7%C3%A3o%20de%20Privacidade%20-%20Klip`}
                  className="underline font-mono text-[var(--text-primary)] font-medium"
                >
                  {LEGAL_METADATA.contactEmail}
                </a>
                . Sua mensagem será respondida sem qualquer cobrança no prazo legal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            6
          </span>
          Alterações nesta Política e Legislação
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-3 leading-relaxed">
          <p>
            Esta política poderá ser atualizada periodicamente para refletir melhorias no aplicativo ou adequações regulatórias. A data de última atualização constará sempre no topo desta página.
          </p>
          <p>
            Esta Política de Privacidade é regida pelas leis da República Federativa do Brasil, em particular a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014).
          </p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicyPage;
