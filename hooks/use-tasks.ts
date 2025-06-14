'use client';

import { useState, useEffect } from 'react';
import { Task, TaskFilters } from '@/lib/types';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/storage';

export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTasks = () => {
    setIsLoading(true);
    let allTasks = getTasks();
    
    // Apply filters
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        allTasks = allTasks.filter(task => task.status === filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        allTasks = allTasks.filter(task => task.priority === filters.priority);
      }
      if (filters.assignee && filters.assignee !== 'all') {
        allTasks = allTasks.filter(task => task.assigneeId === filters.assignee);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        allTasks = allTasks.filter(task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        allTasks.sort((a, b) => {
          let aValue: any = a[filters.sortBy!];
          let bValue: any = b[filters.sortBy!];
          
          if (filters.sortBy === 'priority') {
            const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
            aValue = priorityOrder[a.priority];
            bValue = priorityOrder[b.priority];
          }
          
          if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
          if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
      }
    }
    
    setTasks(allTasks);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshTasks();
  }, [filters]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = createTask(taskData);
    refreshTasks();
    return newTask;
  };

  const editTask = async (id: string, updates: Partial<Task>) => {
    const updatedTask = updateTask(id, updates);
    if (updatedTask) {
      refreshTasks();
    }
    return updatedTask;
  };

  const removeTask = async (id: string) => {
    const success = deleteTask(id);
    if (success) {
      refreshTasks();
    }
    return success;
  };

  return {
    tasks,
    isLoading,
    addTask,
    editTask,
    removeTask,
    refreshTasks,
  };
}