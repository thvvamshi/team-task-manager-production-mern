import { useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { CheckCircle2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiError } from '../lib/api.js';
import { Button, Input } from '../components/ui.jsx';

const emptyForm = {
  name: '',
  email: '',
  password: ''
};

export default function AuthPage() {
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  if (user) return <Navigate to="/" replace />;

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await signup({ name: form.name, email: form.email, password: form.password });
      }
      toast.success('Welcome in');
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_460px]">
      <section className="flex min-h-[42vh] items-end bg-[linear-gradient(135deg,#17202a,#2563eb_55%,#0f9f6e)] px-6 py-10 text-white lg:min-h-screen lg:px-12">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-100">Team workspace</p>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">Team Task Manager</h1>
          <p className="mt-4 max-w-xl text-base text-blue-50 md:text-lg">
            Create projects, assign work, track due dates, and keep Admin and Member workflows separated with role-based access.
          </p>
          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
            {['Secure JWT auth', 'MongoDB Atlas', 'Swagger REST API'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-river">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">{mode === 'login' ? 'Login to continue' : 'Sign up to get started'}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'login'
                ? 'Use your registered email and password.'
                : 'New users are created as Members unless your email is configured as the first Admin.'}
            </p>
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full name"
                name="name"
                placeholder="Enter your full name"
                autoComplete="name"
                value={form.name}
                onChange={updateField}
                required
              />
            )}
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder={mode === 'login' ? 'Enter your password' : 'At least 8 characters, 1 uppercase, 1 number'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={updateField}
              required
            />
          </div>

          <Button className="mt-6 w-full" type="submit" disabled={loading}>
            {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </Button>

          <div className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              className="ml-2 font-semibold text-river hover:text-blue-700"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Sign up' : 'Login'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
