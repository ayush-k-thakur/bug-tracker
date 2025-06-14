'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { getTasks, getTimeEntries } from '@/lib/storage';
import { Task, TimeEntry } from '@/lib/types';
import { 
  Bug, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Users
} from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [trendData, setTrendData] = useState<{date: string, count: number}[]>([]);

  useEffect(() => {
    const allTasks = getTasks();
    const allTimeEntries = getTimeEntries();
    
    if (user?.role === 'developer') {
      setTasks(allTasks.filter(task => task.assigneeId === user.id));
      setTimeEntries(allTimeEntries.filter(entry => entry.userId === user.id));
    } else {
      setTasks(allTasks);
      setTimeEntries(allTimeEntries);
    }

    // Generate trend data for last 7 days
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    const trend = last7Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTasks = allTasks.filter(task => 
        format(new Date(task.createdAt), 'yyyy-MM-dd') === dateStr
      );
      return {
        date: format(date, 'MMM dd'),
        count: dayTasks.length
      };
    });

    setTrendData(trend);
  }, [user]);

  const stats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === 'open').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending-approval').length,
    closed: tasks.filter(t => t.status === 'closed').length,
    highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length,
  };

  const totalTimeSpent = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const avgTimePerTask = tasks.length > 0 ? Math.round(totalTimeSpent / tasks.length) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'manager' ? 'Management Dashboard' : 'Developer Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {format(new Date(), 'MMMM dd, yyyy')}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bug className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Task Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Open</span>
                <span className="text-sm text-gray-600">{stats.open}</span>
              </div>
              <Progress value={(stats.open / stats.total) * 100} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-sm text-gray-600">{stats.inProgress}</span>
              </div>
              <Progress value={(stats.inProgress / stats.total) * 100} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Approval</span>
                <span className="text-sm text-gray-600">{stats.pending}</span>
              </div>
              <Progress value={(stats.pending / stats.total) * 100} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Closed</span>
                <span className="text-sm text-gray-600">{stats.closed}</span>
              </div>
              <Progress value={(stats.closed / stats.total) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Time Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(totalTimeSpent / 60)}h
                </p>
                <p className="text-sm text-gray-600">Total Time</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(avgTimePerTask / 60)}h
                </p>
                <p className="text-sm text-gray-600">Avg per Task</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>This Week</span>
                <span className="font-medium">{Math.round(totalTimeSpent / 60)}h logged</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Tasks</span>
                <span className="font-medium">{stats.inProgress} tasks</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      task.priority === 'critical' ? 'destructive' :
                      task.priority === 'high' ? 'default' :
                      task.priority === 'medium' ? 'secondary' : 'outline'
                    }
                  >
                    {task.priority}
                  </Badge>
                  <Badge variant="outline">
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}