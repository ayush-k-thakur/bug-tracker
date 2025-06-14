'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/lib/types';
import { MOCK_USERS } from '@/lib/auth';
import { X } from 'lucide-react';

interface EditTaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => Promise<void>;
}

export function EditTaskDialog({ task, isOpen, onClose, onSave }: EditTaskDialogProps) {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [newLabel, setNewLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        labels: [...task.labels],
        estimatedTime: task.estimatedTime,
      });
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Prepare the updates object
      const updates: Partial<Task> = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assigneeId: formData.assigneeId,
        labels: formData.labels,
        estimatedTime: formData.estimatedTime,
      };

      // Handle due date properly
      if (formData.dueDate) {
        updates.dueDate = `${formData.dueDate}T23:59:59Z`;
      } else {
        updates.dueDate = undefined;
      }

      await onSave(updates);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && formData.labels && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...(prev.labels || []), newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: (prev.labels || []).filter(label => label !== labelToRemove)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority || ''}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Task['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending-approval">Pending Approval</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="reopened">Reopened</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={formData.assigneeId || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dueDate: e.target.value
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
            <Input
              id="estimatedTime"
              type="number"
              min="0"
              step="0.5"
              value={formData.estimatedTime ? formData.estimatedTime / 60 : ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                estimatedTime: e.target.value ? parseFloat(e.target.value) * 60 : undefined 
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.labels || []).map((label, index) => (
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
                placeholder="Add label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
              />
              <Button type="button" onClick={handleAddLabel} variant="outline">
                Add
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}