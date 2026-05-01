import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { Badge, Button, Input, Panel, Select, Textarea } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getApiError } from '../lib/api.js';

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [memberForms, setMemberForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadProjects() {
    const { data } = await api.get('/projects');
    setProjects(data.projects);
  }

  useEffect(() => {
    async function loadInitialData() {
      const [projectRes, userRes] = await Promise.all([api.get('/projects'), isAdmin ? api.get('/auth/users') : Promise.resolve(null)]);
      setProjects(projectRes.data.projects);
      if (userRes) setUsers(userRes.data.users);
    }

    loadInitialData()
      .catch((error) => toast.error(getApiError(error)))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  async function createProject(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      toast.success('Project created');
      await loadProjects();
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setSaving(false);
    }
  }

  async function addMember(projectId) {
    const payload = memberForms[projectId];
    if (!payload?.userId) return toast.error('Choose a user');

    try {
      await api.post(`/projects/${projectId}/members`, payload);
      toast.success('Member saved');
      await loadProjects();
    } catch (error) {
      toast.error(getApiError(error));
    }
  }

  async function removeMember(projectId, userId) {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      toast.success('Member removed');
      await loadProjects();
    } catch (error) {
      toast.error(getApiError(error));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Projects & Team</h1>
        <p className="mt-1 text-sm text-slate-500">Create projects, manage project membership, and assign project roles.</p>
      </div>

      {isAdmin && (
        <Panel title="Create Project">
          <form onSubmit={createProject} className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
            <Input
              label="Project name"
              placeholder="Website launch"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
            <Textarea
              label="Description"
              placeholder="Short project summary"
              rows={1}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <Button type="submit" disabled={saving}>
              <Plus size={18} />
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </form>
        </Panel>
      )}

      <div className="grid gap-5">
        {loading && <p className="text-sm text-slate-500">Loading projects...</p>}
        {!loading && projects.length === 0 && (
          <Panel title="No Projects Yet">
            <p className="text-sm text-slate-500">
              {isAdmin ? 'Create your first project to start assigning work.' : 'You are not assigned to any projects yet.'}
            </p>
          </Panel>
        )}
        {projects.map((project) => (
          <Panel
            key={project._id}
            title={project.name}
            action={<Badge tone={project.status === 'Completed' ? 'green' : 'blue'}>{project.status}</Badge>}
          >
            <p className="mb-4 text-sm text-slate-600">{project.description || 'No description added.'}</p>
            <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {project.members.map((member) => (
                <div key={member.user._id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{member.user.name}</p>
                    <p className="truncate text-xs text-slate-500">{member.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={member.role === 'Admin' ? 'blue' : 'slate'}>{member.role}</Badge>
                    {isAdmin && project.owner?._id !== member.user._id && (
                      <Button
                        variant="ghost"
                        className="h-9 w-9 p-0 text-rose"
                        title="Remove member"
                        onClick={() => removeMember(project._id, member.user._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="grid gap-3 rounded-md bg-slate-50 p-3 md:grid-cols-[1fr_160px_auto] md:items-end">
                <Select
                  label="Add user"
                  value={memberForms[project._id]?.userId || ''}
                  onChange={(event) =>
                    setMemberForms((current) => ({
                      ...current,
                      [project._id]: { ...(current[project._id] || { role: 'Member' }), userId: event.target.value }
                    }))
                  }
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </Select>
                <Select
                  label="Project role"
                  value={memberForms[project._id]?.role || 'Member'}
                  onChange={(event) =>
                    setMemberForms((current) => ({
                      ...current,
                      [project._id]: { ...(current[project._id] || {}), role: event.target.value }
                    }))
                  }
                >
                  <option>Member</option>
                  <option>Admin</option>
                </Select>
                <Button type="button" onClick={() => addMember(project._id)}>
                  <UserPlus size={18} />
                  Add
                </Button>
              </div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
