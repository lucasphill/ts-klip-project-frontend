# Content Contract: Privacy Policy & Terms of Service Content Specifications

**Feature**: `005-privacy-and-terms`
**Date**: 2026-08-23

## 1. Privacy Policy (`/privacy`) Mandatory Content Outline

1. **Identificação e Visão Geral**:
   - Desenvolvido por Lucas Phill (Desenvolvedor Independente).
   - Declaração de compromisso com a privacidade e proteção de dados (LGPD / GDPR).
   - Natureza não-comercial do aplicativo Klip.

2. **Dados Pessoais Coletados**:
   - Dados de Cadastro/Autenticação: E-mail, nome e identificador de usuário fornecidos via Auth0.
   - Dados de Uso do Aplicativo: Tarefas, projetos, subtarefas, datas de vencimento e campos customizados inseridos voluntariamente pelo usuário.
   - Dados Técnicos e Logs: Registros básicos de diagnóstico e telemetria anônima (Vercel Analytics / Speed Insights).

3. **Integração com Google Calendar e Uso de Dados do Google (Google API User Data)**:
   - **Escopos Utilizados**: Acesso aos calendários do Google (`https://www.googleapis.com/auth/calendar` ou `calendar.events`) e e-mail da conta Google conectada.
   - **Finalidade Específica**: Criação, leitura, atualização e sincronização de eventos no Google Calendar que correspondem a tarefas com prazos criadas no Klip.
   - **Cláusula Obrigatória de Conformidade (Google Limited Use)**:
     > *"O uso e a transferência para qualquer outro aplicativo de informações recebidas das APIs do Google pelo Klip obedecerão à [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), incluindo os requisitos de Uso Limitado (Limited Use)."*
   - **Restrições Rígidas de Uso**:
     - Os dados do Google nunca são comercializados, alugados ou transferidos para terceiros, corretores de dados ou redes de publicidade.
     - Os dados do Google nunca são utilizados para veiculação de anúncios direcionados.
     - Os dados do Google nunca são utilizados para treinamento de modelos de inteligência artificial ou machine learning generalistas.

4. **Armazenamento e Segurança dos Dados**:
   - Criptografia e proteção de tokens de acesso OAuth.
   - Os dados são mantidos em infraestrutura em nuvem segura enquanto a conta e a integração estiverem ativas.

5. **Retenção e Exclusão de Dados**:
   - **Desconexão por Auto-Serviço**: O usuário pode desconectar sua conta Google a qualquer momento em *Configurações > Integrações > Google Calendar*, revogando e apagando imediatamente os tokens OAuth armazenados.
   - **Exclusão de Conta e Dados**: O usuário pode solicitar a exclusão definitiva de sua conta, tarefas e dados associados enviando um e-mail para `contato@klip.app.br` ou `lucasphill.dev@gmail.com`.

6. **Contato e Encarregado de Proteção de Dados**:
   - Canal direto: `contato@klip.app.br` / `lucasphill.dev@gmail.com`.
   - Perfil do desenvolvedor: `https://github.com/lucasphill`.

---

## 2. Terms of Service (`/terms`) Mandatory Content Outline

1. **Aceitação dos Termos**:
   - Ao acessar ou utilizar o Klip, o usuário concorda com estes Termos de Serviço e com a Política de Privacidade.

2. **Natureza Indie e Não-Comercial do Serviço**:
   - O Klip é um projeto de produtividade independente mantido por Lucas Phill em caráter experimental e pessoal.
   - O serviço é oferecido gratuitamente "como está" (*as-is*) e "conforme disponível" (*as-available*).

3. **Uso Aceitável e Responsabilidades do Usuário**:
   - O usuário é o único responsável pela veracidade e legalidade do conteúdo cadastrado em suas tarefas.
   - É proibido utilizar a plataforma para atividades ilícitas, engenharia reversa não autorizada, ataques de negação de serviço ou exploração de vulnerabilidades.

4. **Integrações de Terceiros**:
   - O uso de integrações (como Google Calendar e provedores de autenticação) sujeita-se adicionalmente aos termos das respectivas plataformas.

5. **Isenção de Garantias e Limitação de Responsabilidade**:
   - O desenvolvedor não garante disponibilidade ininterrupta, ausência total de falhas ou imunidade a interrupções decorrentes de terceiros.
   - O desenvolvedor não responderá por perdas de dados, lucros cessantes ou danos indiretos resultantes do uso ou da impossibilidade de uso da ferramenta.

6. **Alterações nos Termos e Descontinuação**:
   - O desenvolvedor reserva-se o direito de modificar os termos e aprimorar ou descontinuar recursos do serviço a qualquer tempo, com atualização da data no cabeçalho do documento.

7. **Legislação Aplicável e Foro**:
   - Regido pelas leis da República Federativa do Brasil, em especial o Marco Civil da Internet (Lei nº 12.965/2014) e a LGPD (Lei nº 13.709/2018).
