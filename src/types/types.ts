export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  owner_id?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  isCompleted: boolean;
  ownerAuth0Id: string;
  parentTaskId?: string;
  projectId?: string;
}

export interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
  badge?: number;
  color?: string;
  onClick?: () => void;
}

export interface HealthStatus {
    status?: string;
    version?: string;
};
