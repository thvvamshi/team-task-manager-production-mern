import { useEffect, useMemo, useState } from 'react';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import { AlertTriangle, Plus, Save, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Button, Input, Panel, Select, Textarea } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getApiError } from '../lib/api.js';

const emptyTask = {
  title: '',
  description: '',
  project: '',
  assignedTo: '',
  priority: 'Medium',
  status: 'Todo',
  dueDate: ''
};

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [filter, setFilter] = useState({ project: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedProject = useMemo(() => projects.find((project) => project._id === form.project), [projects, form.project]);
  const overdueMode = searchParams.get('view') === 'overdue';
  const boardTasks = overdueMode ? tasks.filter((task) => isPast(new Date(task.dueDate)) && task.status !== 'Done') : tasks;

  async function loadData() {
    const [projectRes, taskRes] = await Promise.all([api.get('/projects'), api.get('/tasks')]);
    setProjects(projectRes.data.projects);
    setTasks(taskRes.data.tasks);
  }

  useEffect(() => {
    loadData()
      .catch((error) => toast.error(getApiError(error)))
      .finally(() => setLoading(false));
  }, []);

  async function loadTasks(nextFilter = filter) {
    const params = {};
    if (nextFilter.project) params.project = nextFilter.project;
    if (nextFilter.status) params.status = nextFilter.status;
    const { data } = await api.get('/tasks', { params });
    setTasks(data.tasks);
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'project' ? { assignedTo: '' } : {})
    }));
  }

  async function createTask(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await api.post('/tasks', { ...form, dueDate: new Date(form.dueDate).toISOString() });
      setForm(emptyTask);
      toast.success('Task created');
      await loadTasks();
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setSaving(false);
    }
  }

  async function updateTask(taskId, updates) {
    try {
      await api.patch(`/tasks/${taskId}`, updates);
      toast.success('Task updated');
      await loadTasks();
    } catch (error) {
      toast.error(getApiError(error));
    }
  }

  async function deleteTask(taskId) {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      await loadTasks();
    } catch (error) {
      toast.error(getApiError(error));
    }
  }

  async function applyFilter(field, value) {
    const nextFilter = { ...filter, [field]: value };
    setFilter(nextFilter);
    await loadTasks(nextFilter);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">Create, assign, filter, and update task status.</p>
      </div>

      {isAdmin && (
        <Panel title="Create Task">
          <form onSubmit={createTask} className="grid gap-4 xl:grid-cols-2">
            <Input
              label="Title"
              placeholder="Write a clear task title"
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
              required
            />
            <Select label="Project" value={form.project} onChange={(event) => updateForm('project', event.target.value)} required>
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Select>
            <Select label="Assignee" value={form.assignedTo} onChange={(event) => updateForm('assignedTo', event.target.value)} required>
              <option value="">Select assignee</option>
              {selectedProject?.members?.map((member) => (
                <option key={member.user._id} value={member.user._id}>
                  {member.user.name}
                </option>
              ))}
            </Select>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Priority" value={form.priority} onChange={(event) => updateForm('priority', event.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </Select>
              <Select label="Status" value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </Select>
              <Input label="Due date" type="date" value={form.dueDate} onChange={(event) => updateForm('dueDate', event.target.value)} required />
            </div>
            <Textarea
              label="Description"
              placeholder="Add details, acceptance criteria, or notes"
              rows={3}
              className="xl:col-span-2"
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
            />
            <div className="xl:col-span-2">
              <Button type="submit" disabled={saving || projects.length === 0}>
                <Plus size={18} />
                {saving ? 'Creating...' : 'Create task'}
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title="Task Board">
        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <Select label="Filter by project" value={filter.project} onChange={(event) => applyFilter('project', event.target.value)}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select label="Filter by status" value={filter.status} onChange={(event) => applyFilter('status', event.target.value)}>
            <option value="">All statuses</option>
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
          </Select>
        </div>

        {overdueMode && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose">
            <span className="flex items-center gap-2 font-semibold">
              <AlertTriangle size={17} />
              Showing overdue tasks only
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1 font-semibold hover:text-rose-700"
              onClick={() => setSearchParams({})}
            >
              <X size={15} />
              Clear filter
            </button>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-3">
          {loading && <p className="text-sm text-slate-500 xl:col-span-3">Loading tasks...</p>}
          {!loading && boardTasks.length === 0 && (
            <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 xl:col-span-3">
              {overdueMode
                ? 'No overdue tasks. Everything is on track.'
                : isAdmin
                  ? 'No tasks yet. Create a task after adding members to a project.'
                  : 'No tasks are assigned to your projects yet.'}
            </div>
          )}
          {['Todo', 'In Progress', 'Done'].map((status) => (
            <section key={status} className="min-h-40 rounded-md bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">{status}</h2>
                <Badge tone={status === 'Done' ? 'green' : status === 'In Progress' ? 'blue' : 'amber'}>
                  {boardTasks.filter((task) => task.status === status).length}
                </Badge>
              </div>
              <div className="space-y-3">
                {boardTasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      currentUser={user}
                      canManage={isAdmin}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function TaskCard({ task, currentUser, canManage, onUpdate, onDelete }) {
  const isAssignee = task.assignedTo?._id === currentUser?._id;
  const canChangeStatus = canManage || isAssignee;

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-bold text-ink">{task.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{task.project?.name}</p>
        </div>
        <Badge tone={task.priority === 'High' ? 'rose' : task.priority === 'Medium' ? 'amber' : 'green'}>
          {task.priority}
        </Badge>
      </div>
      {task.description && <p className="mb-3 text-sm text-slate-600">{task.description}</p>}
      <div className="mb-3 grid gap-2 text-xs text-slate-500">
        <span>Assigned to: {task.assignedTo?.name}</span>
        <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          aria-label="Status"
          className="min-w-36"
          value={task.status}
          disabled={!canChangeStatus}
          onChange={(event) => onUpdate(task._id, { status: event.target.value })}
        >
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </Select>
        {canManage && (
          <>
            <Button
              variant="secondary"
              title="Mark done"
              className="h-10 w-10 p-0"
              onClick={() => onUpdate(task._id, { status: 'Done' })}
            >
              <Save size={16} />
            </Button>
            <Button variant="danger" title="Delete task" className="h-10 w-10 p-0" onClick={() => onDelete(task._id)}>
              <Trash2 size={16} />
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
