import { Calendar, User } from 'lucide-react';
import { Badge } from './ui';

const statusLabels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const statusVariants = { TODO: 'todo', IN_PROGRESS: 'in_progress', DONE: 'done' };
const priorityVariants = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };

export default function TaskCard({ task, onStatusChange, compact }) {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        isOverdue ? 'border-red-200 bg-red-50/50' : 'border-border bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-slate-900 ${task.status === 'DONE' ? 'line-through text-slate-500' : ''}`}>
            {task.title}
          </h3>
          {!compact && task.description && (
            <p className="text-sm text-muted mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={statusVariants[task.status]}>{statusLabels[task.status]}</Badge>
            <Badge variant={priorityVariants[task.priority]}>{task.priority}</Badge>
            {isOverdue && <Badge variant="overdue">Overdue</Badge>}
            {task.project && (
              <span className="text-xs text-muted">{task.project.name}</span>
            )}
          </div>
        </div>
        {onStatusChange && task.status !== 'DONE' && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="text-xs border border-border rounded-md px-2 py-1 bg-white shrink-0"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        )}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted">
        {task.assignee && (
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {task.assignee.name}
          </span>
        )}
        {task.dueDate && (
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-danger font-medium' : ''}`}>
            <Calendar className="w-3.5 h-3.5" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
