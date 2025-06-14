'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { Task } from '@/lib/types';
import { MOCK_USERS } from '@/lib/auth';
import { Plus, X } from 'lucide-react';

interface CreateTaskProps {
  onTaskCreated: () => void;
}

export function CreateTask({ onTaskCreated }: CreateTaskProps) {
  const { user } = useAuth();
  const { addTask } = useTasks();
  const [isLoading, setIsLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assigneeId: user?.role === 'developer' ? user.id : '',
    dueDate: '',
    labels: [] as string[],
    estimatedTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: 'open',
        assigneeId: formData.assigneeId,
        createdBy: user?.id || '',
        dueDate: formData.dueDate ? `${formData.dueDate}T23:59:59Z` : undefined,
        labels: formData.labels,
        timeSpent: 0,
        estimatedTime: formData.estimatedTime ? parseFloat(formData.estimatedTime) * 60 : undefined,
        comments: [],
        attachments: [],
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assigneeId: user?.role === 'developer' ? user.id : '',
        dueDate: '',
        labels: [],
        estimatedTime: '',
      });
      
      onTaskCreated();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-gray-600 mt-1">
            Add a new task or bug report to track progress
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Task Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task or bug in detail"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Task['priority'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Select
                    value={formData.assigneeId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_USERS.filter(user => user.role === 'developer').map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Labels</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.labels.map((label, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {label}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleRemoveLabel(label)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add label (e.g., Bug, Feature, UI)"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                  />
                  <Button type="button" onClick={handleAddLabel} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onTaskCreated}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}