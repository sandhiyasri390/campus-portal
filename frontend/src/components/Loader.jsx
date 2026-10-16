import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Same prop/default as before: label = 'Loading…'. Visual swap from the
 * three-dot pulse to a spinning icon + skeleton shimmer bars, same
 * centered, self-contained layout so it drops into the same spots.
 */
export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin text-brand-500" strokeWidth={2.25} />
      <span>{label}</span>
      <div className="mt-1 flex w-full max-w-xs flex-col gap-2" aria-hidden="true">
        <div className="skeleton h-2.5 w-full rounded-full" />
        <div className="skeleton h-2.5 w-3/5 self-center rounded-full" />
      </div>
    </div>
  );
}
