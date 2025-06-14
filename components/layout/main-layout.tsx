'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Dashboard } from '@/components/dashboard/dashboard';
import { TaskList } from '@/components/tasks/task-list';
import { CreateTask } from '@/components/tasks/create-task';
import { TimeTracker } from '@/components/time/time-tracker';
import { PendingApprovals } from '@/components/tasks/pending-approvals';
import { TeamOverview } from '@/components/team/team-overview';
import { useAuth } from '@/hooks/use-auth';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskList userRole="developer" />;
      case 'all-tasks':
        return <TaskList userRole="manager" />;
      case 'create':
        return <CreateTask onTaskCreated={() => setActiveTab('tasks')} />;
      case 'time':
        return <TimeTracker />;
      case 'approvals':
        return <PendingApprovals />;
      case 'team':
        return <TeamOverview />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}