export interface Project {
  id: string; // Guid no C#
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  owner_id?: string;
}

export interface Task {
  id: string; // Guid no C#
  title: string;
  notes?: string;
  dueDate?: string;
  isCompleted: boolean;
  ownerAuth0Id: string;
  parentTaskId?: string;
  projectId?: string; // Relacionamento via ProjectsTasks
}

export interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
  onClick?: () => void;
  badge?: number;
  color?: string;
}