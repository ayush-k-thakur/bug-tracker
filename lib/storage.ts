import { Task, TimeEntry, Comment } from './types';

const STORAGE_KEYS = {
  TASKS: 'bug-tracker-tasks',
  TIME_ENTRIES: 'bug-tracker-time-entries',
  COMMENTS: 'bug-tracker-comments',
} as const;

// Mock initial data
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Login page UI bug',
    description: 'The login button is not properly aligned on mobile devices',
    priority: 'high',
    status: 'open',
    assigneeId: '1',
    createdBy: '2',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    dueDate: '2024-01-20T23:59:59Z',
    labels: ['UI', 'Mobile', 'Bug'],
    timeSpent: 45,
    estimatedTime: 120,
    comments: [],
    attachments: [],
  },
  {
    id: '2',
    title: 'Implement dark mode',
    description: 'Add dark mode support across the application',
    priority: 'medium',
    status: 'in-progress',
    assigneeId: '3',
    createdBy: '2',
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    dueDate: '2024-01-25T23:59:59Z',
    labels: ['Feature', 'UI', 'Enhancement'],
    timeSpent: 180,
    estimatedTime: 300,
    comments: [],
    attachments: [],
  },
];

export const getTasks = (): Task[] => {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  }
  return JSON.parse(stored);
};

export const saveTasks = (tasks: Task[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const getTask = (id: string): Task | null => {
  const tasks = getTasks();
  return tasks.find(task => task.id === id) || null;
};

export const createTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Task>): Task | null => {
  const tasks = getTasks();
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return null;
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveTasks(tasks);
  return tasks[index];
};

export const deleteTask = (id: string): boolean => {
  const tasks = getTasks();
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return false;
  
  tasks.splice(index, 1);
  saveTasks(tasks);
  return true;
};

export const getTimeEntries = (): TimeEntry[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES);
  return stored ? JSON.parse(stored) : [];
};

export const saveTimeEntries = (entries: TimeEntry[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries));
};

export const addTimeEntry = (entry: Omit<TimeEntry, 'id' | 'createdAt'>): TimeEntry => {
  const entries = getTimeEntries();
  const newEntry: TimeEntry = {
    ...entry,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  entries.push(newEntry);
  saveTimeEntries(entries);
  return newEntry;
};

export const getTaskTimeEntries = (taskId: string): TimeEntry[] => {
  const entries = getTimeEntries();
  return entries.filter(entry => entry.taskId === taskId);
};