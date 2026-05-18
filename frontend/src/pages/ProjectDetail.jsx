import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Trash2, UserPlus } from 'lucide-react';
import { api, ApiError } from '../api/client';
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  Select,
  Textarea,
} from '../components/ui';
import TaskCard from '../components/TaskCard';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [error, setError] = useState('');

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
  });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');

  const isAdmin = project?.myRole === 'ADMIN';

  const loadProject = () => {
    api
      .getProject(id)
      .then(({ project }) => setProject(project))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createTask({
        projectId: id,
        title: taskForm.title,
        description: taskForm.description || undefined,
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
        assigneeId: taskForm.assigneeId || undefined,
      });
      setTaskModal(false);
      setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      loadProject();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.addMember(id, { email: memberEmail, role: memberRole });
      setMemberModal(false);
      setMemberEmail('');
      setMemberRole('MEMBER');
      loadProject();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add member');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.updateTask(taskId, { status });
      loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      await api.removeMember(id, memberId);
      loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      loadProject();
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

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted">Project not found</p>
        <Link to="/projects" className="text-brand-600 hover:underline text-sm mt-2 inline-block">
          Back to projects
        </Link>
      </div>
    );
  }

  const members = project.members || [];
  const tasks = project.tasks || [];
  const memberOptions = members.map((m) => m.user);

  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  };

  return (
    <div className="p-8 max-w-7xl">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <Badge variant={isAdmin ? 'admin' : 'member'}>{project.myRole}</Badge>
          </div>
          {project.description && <p className="text-muted">{project.description}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          {isAdmin && (
            <Button variant="secondary" onClick={() => setMemberModal(true)}>
              <UserPlus className="w-4 h-4" />
              Add member
            </Button>
          )}
          <Button onClick={() => setTaskModal(true)}>
            <Plus className="w-4 h-4" />
            New task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-5 lg:col-span-1 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">Team ({members.length})</h2>
          <ul className="space-y-3">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{m.user.name}</p>
                  <p className="text-xs text-muted truncate">{m.user.email}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={m.role === 'ADMIN' ? 'admin' : 'member'}>{m.role}</Badge>
                  {isAdmin && m.user.id !== project.ownerId && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1 text-slate-400 hover:text-danger rounded"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'TODO', label: 'To Do', color: 'border-t-slate-400' },
              { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-brand-600' },
              { key: 'DONE', label: 'Done', color: 'border-t-green-500' },
            ].map((col) => (
              <Card key={col.key} className={`border-t-4 ${col.color}`}>
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {col.label}
                    <span className="ml-2 text-muted font-normal">
                      ({tasksByStatus[col.key].length})
                    </span>
                  </h3>
                </div>
                <div className="p-3 space-y-3 min-h-[120px]">
                  {tasksByStatus[col.key].map((task) => (
                    <div key={task.id} className="relative group">
                      <TaskCard task={task} onStatusChange={handleStatusChange} compact />
                      {(isAdmin || task.createdBy?.id === user?.id) && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-danger bg-white rounded shadow-sm transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {tasksByStatus[col.key].length === 0 && (
                    <p className="text-xs text-muted text-center py-4">No tasks</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="Create task">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-danger">
            {error}
          </div>
        )}
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </Select>
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
          </div>
          <Input
            label="Due date"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />
          <Select
            label="Assign to"
            value={taskForm.assigneeId}
            onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {memberOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create task
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={memberModal} onClose={() => setMemberModal(false)} title="Add team member">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-danger">
            {error}
          </div>
        )}
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Member email"
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
          />
          <Select
            label="Role"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <p className="text-xs text-muted">
            The user must already have a TeamFlow account. Admins can manage members and reassign tasks.
          </p>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setMemberModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
