import React from 'react';

// Tone -> icon chip gradient. Purely cosmetic; only used when a page opts in
// by passing an `icon` prop (none currently do), so existing usages are
// visually upgraded (card chrome, hover elevation) without any behavior change.
const TONE_CHIP = {
  brand: 'bg-gradient-brand text-white',
  secondary: 'bg-secondary-500 text-white',
  success: 'bg-success-500 text-white',
  warning: 'bg-warning-400 text-white',
  danger: 'bg-danger-500 text-white',
  ink: 'bg-ink-800 text-white',
};

/**
 * Props are unchanged from the previous version: label, value, sub, accent.
 * `icon` and `tone` are new, optional, and safe to omit entirely — every
 * existing caller across the four dashboards continues to work as-is.
 */
export default function StatCard({ label, value, sub, accent = 'text-ink-900', icon: Icon, tone = 'brand' }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-2 font-display text-3xl font-bold ${accent}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-soft ${TONE_CHIP[tone] || TONE_CHIP.brand}`}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-gradient-brand transition-transform duration-200 group-hover:scale-x-100" aria-hidden="true" />
    </div>
  );
}
