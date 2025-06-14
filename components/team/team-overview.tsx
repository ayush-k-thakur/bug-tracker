'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getTasks, getTimeEntries } from '@/lib/storage';
import { Task, TimeEntry, User } from '@/lib/types';
import { MOCK_USERS } from '@/lib/auth';
import { Users, Clock, TrendingUp, Target } from 'lucide-react';

export function TeamOverview() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [teamStats, setTeamStats] = useState<{[userId: string]: {
    user: User;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    totalTime: number;
    avgTimePerTask: number;
  }}>({});

  useEffect(() => {
    const allTasks = getTasks();
    const allTimeEntries = getTimeEntries();
    setTasks(allTasks);
    setTimeEntries(allTimeEntries);

    // Calculate team statistics
    const developers = MOCK_USERS.filter(user => user.role === 'developer');
    const stats: typeof teamStats = {};

    developers.forEach(user => {
      const userTasks = allTasks.filter(task => task.assigneeId === user.id);
      const userTimeEntries = allTimeEntries.filter(entry => entry.userId === user.id);
      const totalTime = userTimeEntries.reduce((sum, entry) => sum + entry.duration, 0);

      stats[user.id] = {
        user,
        totalTasks: userTasks.length,
        completedTasks: userTasks.filter(task => task.status === 'closed').length,
        inProgressTasks: userTasks.filter(task => task.status === 'in-progress').length,
        totalTime,
        avgTimePerTask: userTasks.length > 0 ? totalTime / userTasks.length : 0,
      };
    });

    setTeamStats(stats);
  }, []);

  const overallStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'closed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    pendingTasks: tasks.filter(t => t.status === 'pending-approval').length,
    totalTime: timeEntries.reduce((sum, entry) => sum + entry.duration, 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
          <p className="text-gray-600 mt-1">
            Monitor team performance and productivity
          </p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalTasks}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.completedTasks}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.inProgressTasks}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.pendingTasks}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Member Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.values(teamStats).map((memberStats) => {
              const completionRate = memberStats.totalTasks > 0 
                ? (memberStats.completedTasks / memberStats.totalTasks) * 100 
                : 0;
              
              return (
                <div key={memberStats.user.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {memberStats.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{memberStats.user.name}</h3>
                        <p className="text-sm text-gray-600">{memberStats.user.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {Math.round(completionRate)}% completion
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-gray-900">{memberStats.totalTasks}</div>
                      <div className="text-sm text-gray-600">Total Tasks</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{memberStats.completedTasks}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">{memberStats.inProgressTasks}</div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(memberStats.totalTime / 60)}h
                      </div>
                      <div className="text-sm text-gray-600">Time Logged</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Task Completion Rate</span>
                      <span>{Math.round(completionRate)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Open Tasks</span>
                <span className="text-sm text-gray-600">
                  {tasks.filter(t => t.status === 'open').length}
                </span>
              </div>
              <Progress 
                value={(tasks.filter(t => t.status === 'open').length / tasks.length) * 100} 
                className="h-2" 
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-sm text-gray-600">{overallStats.inProgressTasks}</span>
              </div>
              <Progress 
                value={(overallStats.inProgressTasks / tasks.length) * 100} 
                className="h-2" 
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm text-gray-600">{overallStats.completedTasks}</span>
              </div>
              <Progress 
                value={(overallStats.completedTasks / tasks.length) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(overallStats.totalTime / 60)}h
                </div>
                <div className="text-sm text-gray-600">Total Time Logged</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {Math.round(overallStats.totalTime / 60 / Object.keys(teamStats).length)}h
                  </div>
                  <div className="text-xs text-gray-600">Avg per Developer</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {tasks.length > 0 ? Math.round(overallStats.totalTime / tasks.length / 60) : 0}h
                  </div>
                  <div className="text-xs text-gray-600">Avg per Task</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}