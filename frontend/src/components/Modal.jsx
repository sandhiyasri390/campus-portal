import React from 'react';
import { X } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Same props and behavior as before: open, onClose, title, children, footer.
 * The only way to close is still the explicit close button (or whatever the
 * caller's `footer` buttons do) — no new backdrop-click-to-close behavior
 * has been introduced, so existing call sites behave identically.
 */
export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-ink-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-scale-in overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-brand-soft px-5 py-4">
          <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="text-slate-500 hover:text-ink-800">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
