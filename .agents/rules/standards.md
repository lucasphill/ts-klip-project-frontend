---
trigger: always_on
---

# Diretrizes e Padrões do Projeto (Standards)

Este documento contém instruções e regras essenciais que devem ser seguidas rigorosamente por todos os assistentes e agentes de IA durante o desenvolvimento deste repositório.

## 🔑 Credenciais para Validação (MCP)
Caso seja necessário testar a aplicação ou realizar validações integradas (como automações ou ferramentas MCP de DevTools), utilize os seguintes dados de teste:
*   **E-mail de Teste:** `testuser@example.com`
*   **Senha de Teste:** `TestPassword123!`

---

## 🛠️ Ciclo de Desenvolvimento e Qualidade
1.  **Validação Pós-Alteração**: Sempre que fizer qualquer modificação no código:
    *   Execute a validação com o linter (`npm run lint`).
    *   Execute a validação de compilação/build (`npm run build`).
    *   Corrija imediatamente quaisquer erros ou avisos (warnings/errors) reportados.

2.  **Instalação de Dependências**:
    *   **Proibido** instalar novas dependências automaticamente.
    *   Sempre peça autorização explícita ao usuário antes de executar comandos como `npm install <package>` ou `npm i`.

3.  **Comunicação e Ambiguidade**:
    *   Se algum requisito, bug ou regra de negócio não estiver totalmente claro ou parecer ambíguo, **não faça suposições**.
    *   Pergunte imediatamente ao usuário para esclarecer a intenção antes de prosseguir com a implementação.
