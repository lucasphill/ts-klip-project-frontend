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
