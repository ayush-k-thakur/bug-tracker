'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { Task, User } from '@/lib/types';
import { MOCK_USERS } from '@/lib/auth';
import { 
  Clock, 
  Calendar, 
  User as UserIcon, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Check,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { EditTaskDialog } from './edit-task-dialog';

interface TaskCardProps {
  task: Task;
  onEdit: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: () => void;
  userRole: 'developer' | 'manager';
}

export function TaskCard({ task, onEdit, onDelete, onUpdate, userRole }: TaskCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
  const creator = MOCK_USERS.find(u => u.id === task.createdBy);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'outline';
      case 'in-progress': return 'default';
      case 'pending-approval': return 'secondary';
      case 'closed': return 'outline';
      case 'reopened': return 'destructive';
      default: return 'outline';
    }
  };

  const canEdit = userRole === 'manager' || (userRole === 'developer' && task.assigneeId === user?.id);
  const canDelete = userRole === 'manager' || task.createdBy === user?.id;
  const canClose = userRole === 'developer' && task.assigneeId === user?.id && task.status === 'in-progress';
  const canApprove = userRole === 'manager' && task.status === 'pending-approval';

  const handleStatusChange = async (newStatus: string) => {
    try {
      await onEdit(task.id, { status: newStatus as Task['status'] });
      onUpdate();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSave = async (updates: Partial<Task>) => {
    try {
      await onEdit(task.id, updates);
      onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error; // Re-throw to let the dialog handle the error
    }
  };

  const timeSpentHours = Math.round(task.timeSpent / 60 * 10) / 10;
  const estimatedHours = task.estimatedTime ? Math.round(task.estimatedTime / 60 * 10) / 10 : null;
  const progressPercentage = estimatedHours ? Math.min((timeSpentHours / estimatedHours) * 100, 100) : 0;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{task.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Badge variant={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge variant={getStatusColor(task.status)}>
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <UserIcon className="w-4 h-4 mr-2" />
              <span>Assigned to {assignee?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Created {format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>

          {/* Time Tracking */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                Time Spent: {timeSpentHours}h
                {estimatedHours && ` / ${estimatedHours}h`}
              </span>
              {estimatedHours && (
                <span className="text-gray-500">{Math.round(progressPercentage)}%</span>
              )}
            </div>
            {estimatedHours && (
              <Progress value={progressPercentage} className="h-2" />
            )}
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
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              {canClose && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange('pending-approval')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Request Closure
                </Button>
              )}
              {canApprove && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('closed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('reopened')}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reopen
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog
        task={task}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleEditSave}
      />
    </>
  );
}