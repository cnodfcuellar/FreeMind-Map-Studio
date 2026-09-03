import React from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../atoms/IconButton';

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  badge?: React.ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  badge,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 select-none">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 shadow-xs">
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <IconButton
        icon={<X className="w-4 h-4" />}
        label="Cerrar modal"
        tooltip="Cerrar (Esc)"
        onClick={onClose}
        variant="ghost"
        size="md"
        rounded="lg"
      />
    </div>
  );
};
