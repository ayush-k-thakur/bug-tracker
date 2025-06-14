'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Bug, 
  Plus, 
  Clock, 
  Settings, 
  LogOut, 
  CheckCircle2,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, signOut } = useAuth();

  const developerMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: Bug },
    { id: 'create', label: 'Create Task', icon: Plus },
    { id: 'time', label: 'Time Tracker', icon: Clock },
  ];

  const managerMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all-tasks', label: 'All Tasks', icon: Bug },
    { id: 'approvals', label: 'Pending Approvals', icon: CheckCircle2 },
    { id: 'team', label: 'Team Overview', icon: Users },
    { id: 'create', label: 'Create Task', icon: Plus },
  ];

  const menuItems = user?.role === 'manager' ? managerMenuItems : developerMenuItems;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Bug Tracker</h1>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <Badge variant={user?.role === 'manager' ? 'default' : 'secondary'} className="text-xs">
              {user?.role}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                activeTab === item.id && 'bg-blue-500 text-white hover:bg-blue-600'
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}