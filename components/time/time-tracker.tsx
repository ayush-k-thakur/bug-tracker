'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { getTasks, getTaskTimeEntries, addTimeEntry, updateTask } from '@/lib/storage';
import { Task, TimeEntry } from '@/lib/types';
import { Play, Pause, Clock, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function TimeTracker() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTimer, setActiveTimer] = useState<{
    taskId: string;
    startTime: Date;
  } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    taskId: '',
    duration: '',
    description: '',
  });

  useEffect(() => {
    const allTasks = getTasks();
    const userTasks = user?.role === 'developer' 
      ? allTasks.filter(task => task.assigneeId === user.id)
      : allTasks;
    setTasks(userTasks.filter(task => task.status !== 'closed'));
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - activeTimer.startTime.getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startTimer = (taskId: string) => {
    setActiveTimer({
      taskId,
      startTime: new Date(),
    });
    setElapsedTime(0);
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    const duration = Math.floor(elapsedTime / 1000 / 60); // Convert to minutes
    if (duration > 0) {
      // Add time entry
      await addTimeEntry({
        taskId: activeTimer.taskId,
        userId: user?.id || '',
        startTime: activeTimer.startTime.toISOString(),
        endTime: new Date().toISOString(),
        duration,
      });

      // Update task time spent
      const task = tasks.find(t => t.id === activeTimer.taskId);
      if (task) {
        await updateTask(activeTimer.taskId, {
          timeSpent: task.timeSpent + duration,
        });
        // Refresh tasks
        const allTasks = getTasks();
        const userTasks = user?.role === 'developer' 
          ? allTasks.filter(task => task.assigneeId === user.id)
          : allTasks;
        setTasks(userTasks.filter(task => task.status !== 'closed'));
      }
    }

    setActiveTimer(null);
    setElapsedTime(0);
  };

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEntry.taskId || !manualEntry.duration) return;

    const duration = parseFloat(manualEntry.duration) * 60; // Convert hours to minutes
    
    await addTimeEntry({
      taskId: manualEntry.taskId,
      userId: user?.id || '',
      startTime: new Date().toISOString(),
      duration,
      description: manualEntry.description,
    });

    // Update task time spent
    const task = tasks.find(t => t.id === manualEntry.taskId);
    if (task) {
      await updateTask(manualEntry.taskId, {
        timeSpent: task.timeSpent + duration,
      });
      // Refresh tasks
      const allTasks = getTasks();
      const userTasks = user?.role === 'developer' 
        ? allTasks.filter(task => task.assigneeId === user.id)
        : allTasks;
      setTasks(userTasks.filter(task => task.status !== 'closed'));
    }

    setManualEntry({ taskId: '', duration: '', description: '' });
    setShowManualEntry(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracker</h1>
          <p className="text-gray-600 mt-1">
            Track time spent on tasks and projects
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowManualEntry(!showManualEntry)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Manual Entry
        </Button>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {tasks.find(t => t.id === activeTimer.taskId)?.title}
                  </h3>
                  <p className="text-sm text-gray-600">Timer running</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {formatTime(elapsedTime)}
                </div>
                <Button onClick={stopTimer} className="bg-red-600 hover:bg-red-700">
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Entry Form */}
      {showManualEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Log Time Manually
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualEntry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskSelect">Task</Label>
                  <Select
                    value={manualEntry.taskId}
                    onValueChange={(value) => setManualEntry(prev => ({ ...prev, taskId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    step="0.25"
                    placeholder="0.5"
                    value={manualEntry.duration}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, duration: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What did you work on?"
                  rows={2}
                  value={manualEntry.description}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowManualEntry(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Log Time
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const timeEntries = getTaskTimeEntries(task.id);
          const totalHours = Math.round(task.timeSpent / 60 * 10) / 10;
          const estimatedHours = task.estimatedTime ? Math.round(task.estimatedTime / 60 * 10) / 10 : null;
          const isActiveTask = activeTimer?.taskId === task.id;
          
          return (
            <Card key={task.id} className={isActiveTask ? 'border-blue-200' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-gray-600 text-sm">{task.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant={
                        task.priority === 'critical' ? 'destructive' :
                        task.priority === 'high' ? 'default' :
                        task.priority === 'medium' ? 'secondary' : 'outline'
                      }>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Time Spent</div>
                      <div className="font-semibold">
                        {totalHours}h
                        {estimatedHours && ` / ${estimatedHours}h`}
                      </div>
                    </div>
                    <Button
                      onClick={() => isActiveTask ? stopTimer() : startTimer(task.id)}
                      disabled={activeTimer && !isActiveTask}
                      className={isActiveTask ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                    >
                      {isActiveTask ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Time Entries */}
                {timeEntries.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Recent Time Entries
                    </h4>
                    <div className="space-y-2">
                      {timeEntries.slice(-3).map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <span className="text-gray-600">
                            {format(new Date(entry.createdAt), 'MMM dd, yyyy')}
                          </span>
                          <span className="font-medium">
                            {Math.round(entry.duration / 60 * 10) / 10}h
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Clock className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active tasks</h3>
            <p className="text-gray-600">
              Create or get assigned to tasks to start tracking time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}