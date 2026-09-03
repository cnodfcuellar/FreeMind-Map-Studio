import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { IconButton } from '../atoms/IconButton';

export interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
}

export const HistoryControls: React.FC<HistoryControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <IconButton
        icon={<Undo2 className="w-4 h-4" />}
        tooltip="Deshacer (Ctrl + Z)"
        onClick={onUndo}
        disabled={!canUndo}
        size="md"
        rounded="lg"
      />
      <IconButton
        icon={<Redo2 className="w-4 h-4" />}
        tooltip="Rehacer (Ctrl + Y / Ctrl + Shift + Z)"
        onClick={onRedo}
        disabled={!canRedo}
        size="md"
        rounded="lg"
      />
    </div>
  );
};
