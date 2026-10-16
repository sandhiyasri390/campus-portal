import React from 'react';

/**
 * Shared button primitive for the design system.
 * New component — nothing in the app consumes a different Button API yet,
 * so this has no backward-compatibility surface to preserve.
 */
const VARIANTS = {
  primary:
    'bg-gradient-brand text-white shadow-soft hover:shadow-glow-sm active:shadow-none focus-visible:ring-brand-400',
  secondary:
    'bg-secondary-50 text-secondary-700 hover:bg-secondary-100 focus-visible:ring-secondary-400',
  outline:
    'border border-slate-300 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-700 focus-visible:ring-brand-400',
  ghost:
    'text-slate-500 hover:bg-slate-100 hover:text-ink-800 focus-visible:ring-brand-400',
  dark:
    'bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-brand-400',
  danger:
    'bg-danger-50 text-danger-700 hover:bg-danger-100 focus-visible:ring-danger-400',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 p-0',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  type = 'button',
  disabled = false,
  ...rest
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`focus-ring inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none active:scale-[0.98] ${variantClass} ${sizeClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
