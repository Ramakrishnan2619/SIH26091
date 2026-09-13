import React from 'react';
import { Check } from 'lucide-react';

/**
 * Universal StepBadge component for VyapaarSathi
 * ONE standard component for numbered circles used across both
 * Homepage "How It Works" and /assess 3-step wizard.
 * 
 * @param {'active' | 'completed' | 'upcoming'} state
 * @param {number | string} stepNumber
 * @param {'default' | 'sm'} size
 */
export function StepBadge({
  state = 'upcoming',
  stepNumber = 1,
  size = 'default',
  className = ''
}) {
  const sizeStyles = {
    default: "w-8 h-8 text-xs",
    sm: "w-6 h-6 text-[11px]"
  }[size] || "w-8 h-8 text-xs";

  // Exact state colors per specification:
  // - active: filled eagle-green (#006B7A)
  // - completed: filled wintergreen-dream (#009DB3) with checkmark
  // - upcoming: outlined gray (border-slate-300, text-slate-500, bg-white)
  const stateStyles = {
    active: "bg-[#006B7A] text-white border-2 border-[#006B7A] shadow-xs font-black",
    completed: "bg-[#009DB3] text-white border-2 border-[#009DB3] shadow-xs font-bold",
    upcoming: "bg-white text-slate-500 border-2 border-slate-300 font-bold"
  }[state] || "bg-white text-slate-500 border-2 border-slate-300 font-bold";

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 transition-all duration-200 select-none ${sizeStyles} ${stateStyles} ${className}`.trim()}
      aria-label={`Step ${stepNumber} ${state}`}
    >
      {state === 'completed' ? (
        <Check className={size === 'sm' ? "w-3.5 h-3.5 stroke-[3]" : "w-4 h-4 stroke-[3]"} />
      ) : (
        <span>{stepNumber}</span>
      )}
    </div>
  );
}
