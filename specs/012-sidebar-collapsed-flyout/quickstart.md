# Quickstart Guide: Validação do Menu Flutuante (Flyout) na Barra Lateral Recolhida

**Feature**: Menu Flutuante (Flyout) e Ergonomia da Barra Lateral Recolhida
**Branch**: `012-sidebar-collapsed-flyout`
**Date**: 2026-08-25

---

## 1. Pré-requisitos e Setup

1. Iniciar a aplicação localmente:
   ```bash
   npm run dev
   ```
2. Acessar `http://localhost:5173/` no navegador.
3. Fazer login com `teste@email.com` / `o#mUN9WMKps7rtCGclNu` se necessário.

---

## 2. Roteiro de Validação Visual e Interativa

### Cenário 1: Ergonomia da Barra Lateral Recolhida
1. Clicar no botão "Recolher" na parte inferior da barra lateral.
2. **Verificar**: Todos os botões de itens (Inbox, Calendário, Projetos Raiz, Pastas, Configurações) possuem dimensões padronizadas de 40x40px (`h-10 w-10`), perfeitamente centralizados e com bordas arredondadas.

### Cenário 2: Balão Flutuante (Flyout) de Pasta de Projetos
1. Com a barra lateral recolhida, posicionar o cursor sobre o ícone de uma pasta/grupo de projetos.
2. **Verificar**: Surge um balão lateral à direita ancorado com atraso suave (~150ms).
3. **Verificar**: O cabeçalho exibe ícone, cor, nome da pasta, badge com quantidade de projetos e botões de ação rápida (`+` Novo projeto, Editar pasta, Excluir pasta).
4. **Verificar**: A lista interna exibe todos os projetos cadastrados naquela pasta.
5. Mover o cursor do ícone para dentro do balão:
   - **Verificar**: O balão permanece aberto sem fechar durante o movimento.
6. Clicar em um dos projetos listados no balão:
   - **Verificar**: A página navega imediatamente para `/project/:id` e o balão fecha suavemente.

### Cenário 3: Balão Informativo de Projetos Raiz
1. Com a barra lateral recolhida, passar o cursor sobre o ponto/ícone de um projeto raiz.
2. **Verificar**: Surge um balão lateral com o nome completo do projeto, cor e botões de ação (Editar, Arquivar, Excluir).
3. Clicar no ícone disparador:
   - **Verificar**: A página navega diretamente para o projeto.

### Cenário 4: Qualidade e Compilação
1. Executar linter:
   ```bash
   npm run lint
   ```
   *Resultado esperado*: 0 erros.
2. Executar build:
   ```bash
   npm run build
   ```
   *Resultado esperado*: Compilação e bundle sem erros (código de saída 0).
