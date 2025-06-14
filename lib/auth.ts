import { User } from './types';

// Mock users for demonstration
export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Developer',
    email: 'john@company.com',
    role: 'developer',
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'sarah@company.com',
    role: 'manager',
  },
  {
    id: '3',
    name: 'Mike Developer',
    email: 'mike@company.com',
    role: 'developer',
  },
];

export const authenticateUser = (email: string, password: string): User | null => {
  // Simple mock authentication
  const user = MOCK_USERS.find(u => u.email === email);
  if (user && password === 'password') {
    return user;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUser');
};