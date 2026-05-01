import clsx from 'clsx';

export function Button({ className, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-river text-white hover:bg-blue-700',
    secondary: 'bg-white text-ink border border-slate-200 hover:bg-slate-50',
    danger: 'bg-rose text-white hover:bg-rose-700',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
  };

  return (
    <button
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Input({ label, className, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      <input
        className={clsx(
          'focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm',
          className
        )}
        {...props}
      />
    </label>
  );
}

export function Select({ label, className, children, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      <select
        className={clsx(
          'focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({ label, className, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      <textarea
        className={clsx(
          'focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm',
          className
        )}
        {...props}
      />
    </label>
  );
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-700'
  };

  return <span className={clsx('rounded px-2 py-1 text-xs font-semibold', tones[tone])}>{children}</span>;
}

export function Panel({ title, action, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
