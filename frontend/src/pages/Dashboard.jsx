import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, ListTodo, User } from 'lucide-react';
import { api } from '../api/client';
import { Card, PageHeader } from '../components/ui';
import TaskCard from '../components/TaskCard';

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-sky-50 text-sky-700',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-muted">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.updateTask(taskId, { status });
      const updated = await api.getDashboard();
      setData(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, overdueTasks, recentTasks, myTasks } = data || {
    stats: {},
    overdueTasks: [],
    recentTasks: [],
    myTasks: [],
  };

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your tasks and team progress"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={ListTodo} label="Total tasks" value={stats.total || 0} color="brand" />
        <StatCard icon={Clock} label="To do" value={stats.todo || 0} color="amber" />
        <StatCard icon={CheckCircle2} label="In progress" value={stats.inProgress || 0} color="blue" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.done || 0} color="green" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue || 0} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              Overdue tasks
            </h2>
            <span className="text-sm text-muted">{overdueTasks.length} tasks</span>
          </div>
          {overdueTasks.length === 0 ? (
            <Card className="p-8 text-center text-muted text-sm">
              No overdue tasks — great work!
            </Card>
          ) : (
            <div className="space-y-3">
              {overdueTasks.map((task) => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} compact />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" />
              My tasks
            </h2>
            <span className="text-sm text-muted">{stats.assignedToMe || 0} active</span>
          </div>
          {myTasks.length === 0 ? (
            <Card className="p-8 text-center text-muted text-sm">
              No tasks assigned to you yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {myTasks.slice(0, 5).map((task) => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} compact />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
          <Link to="/projects" className="text-sm text-brand-600 hover:underline font-medium">
            View all projects →
          </Link>
        </div>
        {recentTasks.length === 0 ? (
          <Card className="p-8 text-center text-muted text-sm">
            No tasks yet. <Link to="/projects" className="text-brand-600 hover:underline">Create a project</Link> to get started.
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
