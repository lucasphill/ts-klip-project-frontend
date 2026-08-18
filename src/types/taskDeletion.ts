export type TaskDeletionStrategy = 'cascade' | 'detach';

export interface DeleteTaskTarget {
  id: string;
  title: string;
  subtaskCount: number;
  descendantTaskIds?: string[];
}

export interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: DeleteTaskTarget | null;
  onConfirm: (taskId: string, cascade?: boolean) => Promise<boolean | void>;
}
