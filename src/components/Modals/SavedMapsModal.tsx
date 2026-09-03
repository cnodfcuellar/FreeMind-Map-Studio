import React from 'react';
import { SavedMapMeta, getSavedMapsIndex, loadMapById, deleteMapById } from '../../utils/storage';
import { MindMap } from '../../types/mindmap';
import { FolderOpen, Trash2, Clock, Plus, Map } from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';

interface SavedMapsModalProps {
  isOpen: boolean;
  currentMapId: string;
  onClose: () => void;
  onSelectMap: (map: MindMap) => void;
  onNewMap: () => void;
}

export const SavedMapsModal: React.FC<SavedMapsModalProps> = ({
  isOpen,
  currentMapId,
  onClose,
  onSelectMap,
  onNewMap,
}) => {
  const [mapsList, setMapsList] = React.useState<SavedMapMeta[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setMapsList(getSavedMapsIndex());
    }
  }, [isOpen]);

  const handleOpen = (id: string) => {
    const loaded = loadMapById(id);
    if (loaded) {
      onSelectMap(loaded);
      onClose();
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este mapa mental?')) {
      deleteMapById(id);
      setMapsList(getSavedMapsIndex());
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <ModalHeader
        title="Mis Mapas Mentales Guardados"
        subtitle="Mapas almacenados localmente en este navegador"
        icon={<FolderOpen className="w-5 h-5 text-amber-500" />}
        onClose={onClose}
      />

      {/* Action Button */}
      <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {mapsList.length} {mapsList.length === 1 ? 'mapa guardado' : 'mapas guardados'} en este equipo
        </span>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => {
            onNewMap();
            onClose();
          }}
        >
          Crear Nuevo
        </Button>
      </div>

      {/* List */}
      <div className="p-6 overflow-y-auto space-y-2">
        {mapsList.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-xs">
            No tienes mapas guardados todavía.
          </p>
        ) : (
          mapsList.map((m) => {
            const isCurrent = m.id === currentMapId;
            const dateStr = new Date(m.updatedAt).toLocaleString();

            return (
              <div
                key={m.id}
                onClick={() => handleOpen(m.id)}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all group ${
                  isCurrent
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Map className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {m.title} {isCurrent && <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold ml-1">(Actual)</span>}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {dateStr}
                      </span>
                      <span>• {m.nodeCount || 1} nodos</span>
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    type="button"
                    title="Eliminar mapa"
                    onClick={(e) => handleDelete(m.id, e)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </ModalBackdrop>
  );
};

