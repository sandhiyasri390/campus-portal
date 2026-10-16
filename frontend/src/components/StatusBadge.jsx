import React from 'react';
import {
  Send, Eye, Star, ClipboardList, Code2, Handshake, Trophy, XCircle,
  Clock, Hourglass, CheckCircle2, BadgeCheck, Lock,
} from 'lucide-react';

// Same exact status keys as before — every value the app ever passes here
// (Application.STATUS_FLOW, Job.status, Company.status, verificationStatus)
// is covered, plus the same slate fallback for anything unrecognized.
const STYLES = {
  applied: { cls: 'bg-slate-100 text-slate-700 ring-slate-200', icon: Send },
  under_review: { cls: 'bg-secondary-50 text-secondary-700 ring-secondary-200', icon: Eye },
  shortlisted: { cls: 'bg-brand-50 text-brand-700 ring-brand-200', icon: Star },
  assessment: { cls: 'bg-warning-50 text-warning-700 ring-warning-200', icon: ClipboardList },
  technical_interview: { cls: 'bg-purple-50 text-purple-700 ring-purple-200', icon: Code2 },
  hr_interview: { cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200', icon: Handshake },
  selected: { cls: 'bg-success-50 text-success-700 ring-success-200', icon: Trophy },
  rejected: { cls: 'bg-danger-50 text-danger-700 ring-danger-200', icon: XCircle },
  pending: { cls: 'bg-slate-100 text-slate-700 ring-slate-200', icon: Clock },
  pending_approval: { cls: 'bg-warning-50 text-warning-700 ring-warning-200', icon: Hourglass },
  approved: { cls: 'bg-success-50 text-success-700 ring-success-200', icon: CheckCircle2 },
  verified: { cls: 'bg-success-50 text-success-700 ring-success-200', icon: BadgeCheck },
  closed: { cls: 'bg-slate-200 text-slate-600 ring-slate-300', icon: Lock },
};

const FALLBACK = { cls: 'bg-slate-100 text-slate-700 ring-slate-200', icon: null };

export default function StatusBadge({ status }) {
  const label = (status || '').replace(/_/g, ' ');
  const { cls, icon: Icon } = STYLES[status] || FALLBACK;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${cls}`}>
      {Icon && <Icon className="h-3 w-3 flex-shrink-0" strokeWidth={2.5} />}
      {label}
    </span>
  );
}
