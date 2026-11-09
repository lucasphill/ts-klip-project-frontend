/**
 * Normaliza uma data para o formato YYYY-MM-DD se válida.
 */
export const normalizeDateString = (value?: string | null): string => {
  if (!value) return "";
  return value.trim().split("T")[0];
};

/**
 * Obtém a data atual do cliente no formato YYYY-MM-DD (fuso horário local).
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Determina se uma tarefa está com o prazo vencido.
 * Uma tarefa é considerada vencida quando NÃO está concluída, possui uma data de vencimento
 * e essa data é estritamente anterior à data de hoje no fuso horário local.
 *
 * @param dueDate Data de vencimento da tarefa (formato YYYY-MM-DD ou ISO)
 * @param isCompleted Status de conclusão da tarefa
 * @returns boolean indicando se a tarefa está vencida
 */
export const isTaskOverdue = (dueDate?: string | null, isCompleted?: boolean): boolean => {
  if (isCompleted || !dueDate) return false;

  const normalizedDueDate = normalizeDateString(dueDate);
  if (!normalizedDueDate) return false;

  const today = getTodayDateString();
  return normalizedDueDate < today;
};

const shiftDateString = (dateString: string, days: number): string => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export type DueDateStatus = "none" | "overdue" | "today" | "tomorrow" | "upcoming";

/**
 * Classifica o prazo de uma tarefa em relação a hoje (fuso local).
 * Tarefas concluídas nunca são consideradas vencidas.
 */
export const getDueDateStatus = (
  dueDate?: string | null,
  isCompleted?: boolean,
  today: string = getTodayDateString(),
): DueDateStatus => {
  const normalizedDueDate = normalizeDateString(dueDate);
  if (!normalizedDueDate) return "none";
  if (normalizedDueDate === today) return "today";
  if (normalizedDueDate === shiftDateString(today, 1)) return "tomorrow";
  if (normalizedDueDate < today) return isCompleted ? "upcoming" : "overdue";
  return "upcoming";
};

/**
 * Rótulo relativo curto ("Hoje", "Amanhã", "Ontem") para prazos próximos.
 * Retorna null quando a data deve ser exibida no formato completo.
 */
export const getRelativeDueDateLabel = (
  dueDate?: string | null,
  today: string = getTodayDateString(),
): string | null => {
  const normalizedDueDate = normalizeDateString(dueDate);
  if (!normalizedDueDate) return null;
  if (normalizedDueDate === today) return "Hoje";
  if (normalizedDueDate === shiftDateString(today, 1)) return "Amanhã";
  if (normalizedDueDate === shiftDateString(today, -1)) return "Ontem";
  return null;
};
