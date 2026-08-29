# Quickstart: Validação do Botão de Criação na Barra Colapsada

**Feature**: Botão de Criação de Projetos e Pastas na Barra Lateral Colapsada
**Branch**: `014-collapsed-sidebar-add-project`
**Date**: 2026-08-29

## Pré-requisitos
1. Servidor de desenvolvimento rodando (`npm run dev`).
2. Usuário autenticado na aplicação.

## Cenários de Teste Manual

### Cenário 1: Criação de Projeto via Clique Direto na Barra Colapsada
1. Clique no botão de recolher barra lateral (ou pressione o atalho de toggle) para deixá-la colapsada (largura compacta de 3.5rem).
2. Localize o botão `+` localizado logo abaixo do ícone de Calendário.
3. Dê um clique direto no botão `+`.
4. **Resultado esperado**: O modal de criação de projeto (`AddProjectModal`) abre instantaneamente na tela.

### Cenário 2: Exibição do Balão (HoverCard) e Criação de Projeto
1. Com a barra colapsada, posicione o cursor sobre o botão `+` acima dos projetos.
2. Aguarde ~150ms sem clicar.
3. **Resultado esperado**: Um balão flutuante surge à direita com duas opções: "Novo projeto" e "Nova pasta".
4. Clique na opção "Novo projeto".
5. **Resultado esperado**: O modal de criação de projeto abre e o balão fecha.

### Cenário 3: Criação de Pasta via Balão (HoverCard)
1. Com a barra colapsada, posicione o cursor sobre o botão `+`.
2. No balão flutuante exibido à direita, clique na opção "Nova pasta".
3. **Resultado esperado**: O modal de criação de pasta/grupo (`AddProjectGroupModal`) abre na tela.

### Cenário 4: Transição para Barra Expandida
1. Clique no botão de expandir a barra lateral.
2. **Resultado esperado**: O botão compacto `+` desaparece suavemente e a seção "PROJETOS" volta a exibir seu cabeçalho padrão com busca e os botões individuais de pasta e projeto.
