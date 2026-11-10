/* Textos da landing page (pt-BR). Centralizados para facilitar futura tradução. */

export const BRAND = { blue: "#66ACCB", orange: "#EE805B" } as const;

export const content = {
  nav: { login: "Entrar", dashboard: "Ir para o app" },
  hero: {
    badge: "Gestão pessoal de tarefas",
    titleStart: "Organize tudo.",
    titleHighlight: "Do seu jeito.",
    subtitle: "Gestão pessoal de tarefas, totalmente configurável.",
    support:
      "Crie projetos, defina seus próprios campos e acompanhe tudo em um espaço privado, feito só para você.",
    cta: "Acessar minha conta",
    ctaAuthenticated: "Abrir meu Klip",
    secondary: "Ver recursos",
  },
  features: {
    eyebrow: "Recursos",
    title: "Uma ferramenta que se molda a você",
    subtitle:
      "Sem fluxos impostos. Monte a estrutura que faz sentido para a sua rotina — do trabalho aos projetos pessoais.",
    items: [
      {
        id: "fields",
        title: "Campos customizados",
        text: "Crie campos próprios por projeto — texto, número, seleção, checkbox — e registre exatamente o que importa para você.",
      },
      {
        id: "projects",
        title: "Projetos com a sua cara",
        text: "Separe a vida em projetos, escolha cores e mantenha tudo fácil de encontrar.",
      },
      {
        id: "subtasks",
        title: "Sub-tarefas",
        text: "Quebre o que é grande em passos pequenos e acompanhe o progresso.",
      },
      {
        id: "notes",
        title: "Notas em markdown",
        text: "Anote contexto, links e checklists direto na tarefa.",
      },
      {
        id: "filters",
        title: "Filtros que ficam salvos",
        text: "Ordene e filtre do seu jeito — o Klip lembra suas preferências em cada visualização.",
      },
      {
        id: "inbox",
        title: "Inbox e calendário",
        text: "Capture rápido no Inbox e visualize seus prazos por mês ou semana.",
      },
    ],
  },
  privacy: {
    eyebrow: "Privado e seguro",
    title: "Seu espaço. Só seu.",
    subtitle:
      "O Klip é feito para gestão pessoal: suas tarefas não são compartilhadas com ninguém.",
    items: [
      { id: "personal", title: "100% pessoal", text: "Sem workspaces nem compartilhamento — ninguém além de você vê seus dados." },
      { id: "encrypted", title: "Criptografia", text: "Tudo trafega via HTTPS/TLS. No banco, tarefas, notas e tokens são salvos cifrados com AES-256 — legíveis apenas pelo dono." },
      { id: "control", title: "Você no controle", text: "Revogue acessos ou exclua sua conta definitivamente quando quiser." },
    ],
  },
  mcp: {
    eyebrow: "Bônus",
    title: "Converse com suas tarefas",
    subtitle:
      "Se você usa assistentes de IA como Claude, ChatGPT ou Gemini, pode conectá-los ao Klip e pedir em linguagem natural. É opcional — o Klip funciona perfeitamente sem isso.",
    steps: [
      "Gere uma chave de acesso nas configurações",
      "Conecte no seu assistente de IA favorito",
      "Peça o que precisar, em português mesmo",
    ],
    chat: [
      {
        prompt: "Quais tarefas eu tenho para hoje?",
        reply: "Você tem 3 tarefas: revisar o orçamento do mês, marcar dentista e terminar o capítulo 4 do curso. A do orçamento está como prioridade alta.",
      },
      {
        prompt: "Marque o dentista como feito e crie \"comprar presente da Ana\" no projeto Pessoal.",
        reply: "Pronto! \"Marcar dentista\" foi concluída e a nova tarefa foi criada no projeto Pessoal.",
      },
    ],
  },
  finalCta: {
    title: "Pronto para organizar do seu jeito?",
    subtitle: "Acesse sua conta e comece a montar sua estrutura em minutos.",
  },
} as const;
