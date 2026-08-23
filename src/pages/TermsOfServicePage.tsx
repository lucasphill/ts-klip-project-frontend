import { type FC } from 'react';
import { Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import LegalLayout from '../components/LegalLayout';
import { LEGAL_METADATA } from '../types/legalTypes';

export const TermsOfServicePage: FC = () => {
  return (
    <LegalLayout
      title="Termos de Serviço"
      subtitle="Condições de uso, responsabilidades e diretrizes para utilização do gerenciador de tarefas Klip."
      documentType="terms"
      effectiveDate={LEGAL_METADATA.effectiveDate}
      version={LEGAL_METADATA.version}
    >
      {/* Intro Summary Box */}
      <div className="bg-[var(--bg-soft)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-7 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
          Visão Geral do Serviço
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          O <strong>{LEGAL_METADATA.appName}</strong> é um aplicativo de produtividade e gerenciamento de tarefas pessoal mantido e desenvolvido de forma independente por{' '}
          <a
            href={LEGAL_METADATA.developerGithub}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-[var(--text-primary)] hover:text-[#66ACCB]"
          >
            {LEGAL_METADATA.developerName}
          </a>
          . Ao criar uma conta ou utilizar a plataforma, você concorda com os termos e diretrizes descritos a seguir.
        </p>
      </div>

      {/* Section 1 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            1
          </span>
          Aceitação e Objeto do Serviço
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-3 leading-relaxed">
          <p>
            Ao acessar ou utilizar qualquer parte do aplicativo {LEGAL_METADATA.appName} disponível em{' '}
            <a href={LEGAL_METADATA.appUrl} className="underline text-[var(--text-primary)] font-mono">
              {LEGAL_METADATA.appUrl}
            </a>
            , você declara ter lido, compreendido e concordado com estes <strong>Termos de Serviço</strong> e com a{' '}
            <a href="/privacy" className="underline text-[var(--text-primary)] font-medium">
              Política de Privacidade
            </a>
            .
          </p>
          <p>
            O serviço destina-se ao gerenciamento de tarefas, projetos, prazos e anotações pessoais ou profissionais por meio de interfaces visuais e integrações autorizadas pelo usuário (como o Model Context Protocol e o Google Calendar).
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            2
          </span>
          Natureza Indie e Fornecimento Gratuito (&quot;As-Is&quot;)
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-3 leading-relaxed">
          <p>
            O {LEGAL_METADATA.appName} é um software desenvolvido de forma <strong>independente (indie)</strong>, disponibilizado gratuitamente no estado em que se encontra (<em>&quot;as-is&quot;</em>) e conforme a disponibilidade (<em>&quot;as-available&quot;</em>).
          </p>
          <p>
            Por se tratar de uma ferramenta não-comercial em contínua evolução:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm pt-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#66ACCB] shrink-0 mt-0.5" />
              <span>Não são cobradas mensalidades, assinaturas ou taxas de uso para as funcionalidades padrão disponibilizadas.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#66ACCB] shrink-0 mt-0.5" />
              <span>O serviço não oferece garantias comerciais explícitas de nível de serviço (SLA), tempos mínimos de resposta de suporte ou disponibilidade ininterrupta 24/7.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#66ACCB] shrink-0 mt-0.5" />
              <span>Eventuais doações voluntárias de apoio ao desenvolvedor (como &quot;Buy me a coffee&quot;) não configuram compra de cotas ou relação de prestação comercial de serviços corporativos.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            3
          </span>
          Responsabilidades do Usuário e Uso Aceitável
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-3 leading-relaxed">
          <p>Ao utilizar o Klip, você se compromete a:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 text-xs sm:text-sm">
            <li>Manter a segurança e a confidencialidade de sua conta e métodos de autenticação;</li>
            <li>Ser o único responsável pela veracidade, licitude e integridade de todo o conteúdo inserido em suas tarefas, notas e campos customizados;</li>
            <li>Não utilizar a plataforma para qualquer atividade ilícita, disseminação de malware, tentativas de intrusão, exploração de falhas ou sobrecarga intencional dos servidores (ataques de negação de serviço);</li>
            <li>Não tentar realizar engenharia reversa não autorizada dos serviços de backend ou violar medidas de segurança implementadas.</li>
          </ul>
        </div>
      </section>

      {/* Section 4 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            4
          </span>
          Integrações com Terceiros (Google Calendar, Auth0 e MCP)
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-3 leading-relaxed">
          <p>
            O Klip permite a conexão opcional com ferramentas e APIs fornecidas por terceiros, tais como o <strong>Google Calendar</strong> (para sincronização de eventos e prazos) e o <strong>Auth0</strong> (para autenticação de usuários).
          </p>
          <p>
            O funcionamento adequado dessas integrações depende da disponibilidade, manutenção e termos de uso dos respectivos provedores. O desenvolvedor do Klip não se responsabiliza por alterações nas políticas de APIs, instabilidades técnicas temporárias ou descontinuações implementadas diretamente por essas plataformas terceiras.
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            5
          </span>
          Isenção de Garantias e Limitação de Responsabilidade
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-3 leading-relaxed">
          <p>
            Na extensão máxima permitida pela legislação aplicável (incluindo o Marco Civil da Internet):
          </p>
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#66ACCB]" />
              <span>Limitação Legal</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              O desenvolvedor não será responsabilizado por danos diretos, indiretos, incidentais ou lucros cessantes decorrentes do uso, da incapacidade de uso, da perda de anotações ou tarefas por falhas técnicas locais, ou da interrupção do serviço. Recomendamos que o usuário mantenha backups adequados de informações críticas.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            6
          </span>
          Modificações dos Termos e Encerramento
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-3 leading-relaxed">
          <p>
            O desenvolvedor poderá atualizar estes Termos de Serviço periodicamente para refletir novas funcionalidades ou adequações legais. A continuidade no uso da aplicação após tais publicações representará a aceitação dos novos termos.
          </p>
          <p>
            O usuário pode cessar o uso do Klip a qualquer momento, descontinuando o acesso ou excluindo permanentemente a sua conta e dados através do botão de exclusão nas configurações do perfil da aplicação (ou mediante solicitação por e-mail).
          </p>
        </div>
      </section>

      {/* Section 7 */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#66ACCB]/10 text-[#66ACCB] text-xs font-bold">
            7
          </span>
          Legislação Aplicável e Canal de Atendimento
        </h2>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-3 leading-relaxed">
          <p>
            Estes Termos de Serviço são regidos pelas leis vigentes da República Federativa do Brasil, em especial o Marco Civil da Internet (Lei nº 12.965/2014).
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="text-[var(--text-muted)]">Dúvidas sobre estes Termos:</span>
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
    </LegalLayout>
  );
};

export default TermsOfServicePage;
