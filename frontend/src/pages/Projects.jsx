import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Users } from 'lucide-react';
import { api, ApiError } from '../api/client';
import { Badge, Button, Card, Input, Modal, PageHeader, Textarea } from '../components/ui';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = () => {
    api
      .getProjects()
      .then(({ projects }) => setProjects(projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.createProject({ name, description });
      setModalOpen(false);
      setName('');
      setDescription('');
      loadProjects();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Projects"
        subtitle="Manage your team projects and members"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            New project
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-1">No projects yet</h3>
          <p className="text-muted text-sm mb-4">Create your first project to start managing tasks.</p>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Create project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="p-5 hover:border-brand-500/40 hover:shadow-md transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-brand-600" />
                  </div>
                  <Badge variant={project.myRole === 'ADMIN' ? 'admin' : 'member'}>
                    {project.myRole}
                  </Badge>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-muted line-clamp-2 mb-3">{project.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {project.members?.length || 0} members
                  </span>
                  <span>{project._count?.tasks || 0} tasks</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create project">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-danger">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Marketing Campaign"
            required
          />
          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the project..."
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
