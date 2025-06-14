'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { getTasks, updateTask } from '@/lib/storage';
import { Task } from '@/lib/types';
import { MOCK_USERS } from '@/lib/auth';
import { CheckCircle2, RotateCcw, Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function PendingApprovals() {
  const { user } = useAuth();
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPendingTasks();
  }, []);

  const loadPendingTasks = () => {
    const allTasks = getTasks();
    const pending = allTasks.filter(task => task.status === 'pending-approval');
    setPendingTasks(pending);
    setIsLoading(false);
  };

  const handleApprove = async (taskId: string) => {
    await updateTask(taskId, { status: 'closed' });
    loadPendingTasks();
  };

  const handleReopen = async (taskId: string) => {
    await updateTask(taskId, { status: 'reopened' });
    loadPendingTasks();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">
            Review and approve task closures from developers
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {pendingTasks.length} pending
        </Badge>
      </div>

      {pendingTasks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <CheckCircle2 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
            <p className="text-gray-600">
              All task closures have been reviewed. Great job!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingTasks.map((task) => {
            const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
            const creator = MOCK_USERS.find(u => u.id === task.createdBy);
            
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{task.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge variant={
                        task.priority === 'critical' ? 'destructive' :
                        task.priority === 'high' ? 'default' :
                        task.priority === 'medium' ? 'secondary' : 'outline'
                      }>
                        {task.priority}
                      </Badge>
                      <Badge variant="secondary">
                        pending approval
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>Assigned to {assignee?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Updated {format(new Date(task.updatedAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Time: {Math.round(task.timeSpent / 60 * 10) / 10}h</span>
                    </div>
                  </div>

                  {/* Labels */}
                  {task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {task.labels.map((label, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReopen(task.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reopen Task
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(task.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve Closure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}