type TaskHierarchyItem = {
  id: string;
  title: string;
  parentTaskId?: string | null;
};

export type ParentTaskOption = {
  id: string;
  title: string;
  depth: number;
};

const ROOT_PARENT_KEY = "__root__";

const compareTaskTitles = (left: TaskHierarchyItem, right: TaskHierarchyItem) =>
  (left.title ?? "").localeCompare(right.title ?? "", "pt-BR", {
    sensitivity: "base",
    numeric: true,
  });

export const normalizeParentTaskId = (value?: string | null) => {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const buildChildrenMap = <T extends TaskHierarchyItem>(tasks: T[]) => {
  const taskIds = new Set(tasks.map((task) => task.id));
  const childrenByParentId = new Map<string, T[]>();

  tasks.forEach((task) => {
    const parentTaskId = normalizeParentTaskId(task.parentTaskId);
    if (!parentTaskId || parentTaskId === task.id || !taskIds.has(parentTaskId)) {
      return;
    }

    const children = childrenByParentId.get(parentTaskId) ?? [];
    children.push(task);
    childrenByParentId.set(parentTaskId, children);
  });

  return childrenByParentId;
};

export const getDescendantTaskIds = <T extends TaskHierarchyItem>(tasks: T[], taskId: string) => {
  const childrenByParentId = buildChildrenMap(tasks);
  const descendants: string[] = [];
  const queue = [...(childrenByParentId.get(taskId) ?? [])];

  while (queue.length > 0) {
    const currentTask = queue.shift();
    if (!currentTask) continue;

    descendants.push(currentTask.id);
    queue.push(...(childrenByParentId.get(currentTask.id) ?? []));
  }

  return descendants;
};

export const buildParentTaskOptions = <T extends TaskHierarchyItem>(
  tasks: T[],
  currentTaskId?: string
): ParentTaskOption[] => {
  const excludedTaskIds = new Set<string>();

  if (currentTaskId) {
    excludedTaskIds.add(currentTaskId);
    getDescendantTaskIds(tasks, currentTaskId).forEach((taskId) => excludedTaskIds.add(taskId));
  }

  const allowedTasks = tasks.filter((task) => !excludedTaskIds.has(task.id));
  const allowedTaskIds = new Set(allowedTasks.map((task) => task.id));
  const childrenByParentKey = new Map<string, T[]>();

  allowedTasks.forEach((task) => {
    const parentTaskId = normalizeParentTaskId(task.parentTaskId);
    const parentKey =
      parentTaskId && parentTaskId !== task.id && allowedTaskIds.has(parentTaskId)
        ? parentTaskId
        : ROOT_PARENT_KEY;

    const siblings = childrenByParentKey.get(parentKey) ?? [];
    siblings.push(task);
    childrenByParentKey.set(parentKey, siblings);
  });

  const options: ParentTaskOption[] = [];

  const visit = (parentKey: string, depth: number) => {
    const tasksAtLevel = [...(childrenByParentKey.get(parentKey) ?? [])].sort(compareTaskTitles);

    tasksAtLevel.forEach((task) => {
      options.push({
        id: task.id,
        title: task.title,
        depth,
      });

      visit(task.id, depth + 1);
    });
  };

  visit(ROOT_PARENT_KEY, 0);

  return options;
};
