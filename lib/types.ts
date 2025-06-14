export interface User {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'manager';
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'pending-approval' | 'closed' | 'reopened';
  assigneeId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  labels: string[];
  timeSpent: number; // in minutes
  estimatedTime?: number; // in minutes
  comments: Comment[];
  attachments: string[];
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  description?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignee?: string;
  search?: string;
  sortBy?: 'createdAt' | 'priority' | 'status' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
}