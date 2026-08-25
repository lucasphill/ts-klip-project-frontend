# Quickstart Guide: Validação da Refatoração da Barra Lateral e Modal de Grupos

**Feature**: Refatoração da Barra Lateral e Ajuste no Modal de Grupos de Projetos
**Branch**: `011-sidebar-projects-refactor`
**Date**: 2026-08-25

---

## 1. Pré-requisitos e Setup

1. Iniciar a aplicação localmente:
   ```bash
   npm run dev
   ```
2. Acessar `http://localhost:5173/` no navegador.
3. Fazer login com o usuário de testes se necessário (`teste@email.com` / `o#mUN9WMKps7rtCGclNu`).

---

## 2. Roteiro de Validação Manual e E2E

### Cenário 1: Título e Hierarquia na Barra Lateral
1. Expandir a barra lateral.
2. **Verificar**: O título da seção de projetos exibe `"PROJETOS"` (não `"PROJETOS & PASTAS"`).
3. **Verificar**: O campo `"Buscar projeto..."` está presente logo abaixo do cabeçalho da seção.
4. **Verificar**: Projetos sem pasta aparecem listados logo abaixo do campo de busca.
5. **Verificar**: Pastas de projetos criadas aparecem abaixo dos projetos sem pasta.
6. **Verificar**: Não existe nenhum rótulo ou subtítulo com o texto `"Sem pasta"`.

### Cenário 2: Destaque de Projeto Ativo
1. Clicar em um projeto na raiz (sem pasta).
2. **Verificar**: O item recebe preenchimento suave de fundo com bordas arredondadas (`bg-[var(--bg-soft-strong)]`). O texto permanece na cor padrão (`text-[var(--text-primary)]`), sem ficar azul.
3. Clicar em um projeto dentro de uma pasta/grupo.
4. **Verificar**: O projeto dentro da pasta recebe exatamente o mesmo preenchimento suave de fundo com bordas arredondadas e texto padrão, sem ficar azul.
5. Alternar entre os itens `Inbox`, `Calendário` e os projetos e conferir a paridade visual exata do estado ativo.

### Cenário 3: Seletor de Ícones no Modal de Grupos
1. Clicar no botão `Nova pasta / grupo` (ícone `FolderPlus`) na barra lateral.
2. No modal aberto, inspecionar a seção `Ícone`.
3. **Verificar**: Todos os 11 ícones estão perfeitamente visíveis, alinhados com espaçamento uniforme (`gap-2`) e sem sobreposição ou corte de bordas.
4. Clicar em diferentes ícones e verificar o feedback visual de seleção (`border-[var(--brand)] bg-[var(--brand)] text-white`).
5. Redimensionar a tela/viewport e confirmar que os ícones quebram linhas de forma fluida sem colapsar o layout.

### Cenário 4: Qualidade e Compilação
1. Executar o linter:
   ```bash
   npm run lint
   ```
   *Resultado esperado*: 0 erros.
2. Executar o build:
   ```bash
   npm run build
   ```
   *Resultado esperado*: Compilação e bundle sem erros (código de saída 0).
