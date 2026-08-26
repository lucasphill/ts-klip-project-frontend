# Quickstart Guide: Validação do Loading Animado e Transições da Barra Lateral

**Feature**: Estado de Carregamento Animado, Sincronização e Transição Suave da Barra Lateral
**Branch**: `013-sidebar-loading-state`
**Date**: 2026-08-25

---

## 1. Pré-requisitos e Setup

1. Iniciar a aplicação:
   ```bash
   npm run dev
   ```
2. Acessar `http://localhost:5173/` no navegador.

---

## 2. Roteiro de Validação

### Cenário 1: Loading Animado e Ausência de Pulos Visuais
1. Recarregar a página (F5).
2. **Verificar**: Na seção de projetos da barra lateral, surgem os 3 pontos animados (*dots loading*) pulsantes em sequência.
3. **Verificar**: Assim que os dados carregam, a lista de projetos e pastas surge suavemente. Projetos pertencentes a pastas aparecem diretamente dentro de suas pastas, com 0% de pulos ou aparições na raiz.

### Cenário 2: Transição Suave ao Abrir e Fechar a Barra Lateral
1. Clicar repetidamente no botão "Recolher" / "Expandir" no rodapé da barra lateral.
2. **Verificar**:
   - Os textos e botões esmaecem e deslizam suavemente em sincronia com o redimensionamento do menu (`duration-200`).
   - Não há quebra de linha de texto (*no text wrapping*), tremulação de ícones ou saltos visuais instantâneos (*pop-in/out*).

### Cenário 3: Qualidade de Código e Compilação
1. Executar linter:
   ```bash
   npm run lint
   ```
   *Resultado esperado*: 0 erros.
2. Executar build:
   ```bash
   npm run build
   ```
   *Resultado esperado*: Build de produção bem-sucedido com código 0.
