import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  isOpen,
  onToggle,
  icon,
  badge,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all ${className}`}>
      <div className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors select-none">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer text-left"
        >
          {icon && (
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
              {title}
            </span>
            {subtitle && (
              <span className="text-[10px] text-slate-400 font-normal block truncate">
                {subtitle}
              </span>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {action}
          {badge}
          <button
            type="button"
            onClick={onToggle}
            className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-slate-200/60 animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  );
};
