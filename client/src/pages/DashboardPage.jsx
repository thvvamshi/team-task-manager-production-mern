import { useEffect, useState } from 'react';
import { format, isPast } from 'date-fns';
import { AlertTriangle, ArrowUpRight, CheckCircle2, FolderKanban, ListTodo } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge, Panel } from '../components/ui.jsx';
import { api, getApiError } from '../lib/api.js';

const colors = ['#2563eb', '#0f9f6e', '#b7791f', '#e11d48'];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data } = await api.get('/dashboard');
        setDashboard(data);
      } catch (error) {
        toast.error(getApiError(error));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading dashboard...</p>;

  const summary = dashboard?.summary || {};
  const statusData = dashboard?.statusCounts?.map((item) => ({ name: item._id, value: item.count })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Status, progress, and upcoming work across accessible projects.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Projects"
          value={summary.totalProjects || 0}
          icon={FolderKanban}
          tone="blue"
          hint="Manage teams"
          onClick={() => navigate('/projects')}
        />
        <Metric
          title="Tasks"
          value={summary.totalTasks || 0}
          icon={ListTodo}
          tone="slate"
          hint="Open task board"
          onClick={() => navigate('/tasks')}
        />
        <Metric
          title="Overdue"
          value={summary.overdueTasks || 0}
          icon={AlertTriangle}
          tone="rose"
          hint="Review delays"
          onClick={() => navigate('/tasks?view=overdue')}
        />
        <Metric title="Progress" value={`${summary.progress || 0}%`} icon={CheckCircle2} tone="green" hint="Completed tasks" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Panel title="Task Status">
          <div className="h-72">
            {statusData.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={4}>
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-500">No tasks yet</div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusData.map((item, index) => (
              <span key={item.name} className="text-sm text-slate-600">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
                {item.name}: {item.value}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming Tasks">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-3">Task</th>
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Assignee</th>
                  <th className="pb-3">Due</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard?.upcomingTasks?.map((task) => (
                  <tr key={task._id} className="transition hover:bg-slate-50">
                    <td className="py-3 font-medium text-ink">{task.title}</td>
                    <td className="py-3 text-slate-600">{task.project?.name}</td>
                    <td className="py-3 text-slate-600">{task.assignedTo?.name}</td>
                    <td className="py-3">
                      <span className={isPast(new Date(task.dueDate)) && task.status !== 'Done' ? 'font-semibold text-rose' : 'text-slate-600'}>
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Metric({ title, value, icon: Icon, tone, hint, onClick }) {
  const tones = {
    blue: {
      shell: 'from-blue-50 to-white hover:border-blue-200',
      icon: 'bg-blue-100 text-river',
      value: 'text-river'
    },
    green: {
      shell: 'from-emerald-50 to-white',
      icon: 'bg-emerald-100 text-mint',
      value: 'text-mint'
    },
    rose: {
      shell: 'from-rose-50 to-white hover:border-rose-200',
      icon: 'bg-rose-100 text-rose',
      value: 'text-rose'
    },
    slate: {
      shell: 'from-slate-100 to-white hover:border-slate-300',
      icon: 'bg-slate-200 text-slate-700',
      value: 'text-ink'
    }
  };
  const palette = tones[tone];
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group w-full rounded-lg border border-slate-200 bg-gradient-to-br ${palette.shell} p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-river/25`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${palette.value}`}>{value}</p>
          <p className="mt-2 text-xs font-medium text-slate-500">{hint}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-md ${palette.icon}`}>
          <Icon size={21} />
        </div>
      </div>
      {onClick && (
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-500 transition group-hover:text-river">
          Open
          <ArrowUpRight size={14} />
        </div>
      )}
    </Component>
  );
}

function StatusBadge({ status }) {
  const tone = status === 'Done' ? 'green' : status === 'In Progress' ? 'blue' : 'amber';
  return <Badge tone={tone}>{status}</Badge>;
}
