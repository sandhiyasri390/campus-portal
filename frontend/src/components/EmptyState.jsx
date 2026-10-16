import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Props unchanged: title, description, action. `icon` is new and optional
 * (defaults to a generic inbox glyph) — no existing caller passes one, so
 * every current usage just gets the upgraded default visual treatment.
 */
export default function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-gradient-mesh bg-white/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <p className="font-display text-lg font-semibold text-ink-800">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
