import React from 'react';

/**
 * Same props/defaults/behavior as before: value, colorClass, trackClass,
 * height. Visual-only upgrade — inset track shading, softer fill shadow,
 * same clamp + width-transition mechanics.
 */
export default function ProgressBar({ value, colorClass = 'bg-brand-500', trackClass = 'bg-slate-100', height = 'h-2' }) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  return (
    <div
      className={`w-full ${trackClass} rounded-full ${height} overflow-hidden shadow-[inset_0_1px_2px_rgba(17,21,43,0.06)]`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`${colorClass} ${height} rounded-full shadow-sm transition-all duration-500 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
