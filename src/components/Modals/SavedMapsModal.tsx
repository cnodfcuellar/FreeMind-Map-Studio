import React from 'react';
import { SavedMapMeta, getSavedMapsIndex, loadMapById, deleteMapById } from '../../utils/storage';
import { MindMap } from '../../types/mindmap';
import { X, FolderOpen, Trash2, Clock, Plus, Map } from 'lucide-react';

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-base text-slate-800">
              Mis Mapas Mentales Guardados
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="px-6 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs text-slate-500 font-medium">
            {mapsList.length} {mapsList.length === 1 ? 'mapa guardado' : 'mapas guardados'} en este equipo
          </span>
          <button
            onClick={() => {
              onNewMap();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Crear Nuevo
          </button>
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
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                      <Map className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">
                        {m.title} {isCurrent && <span className="text-[10px] text-blue-600 font-bold ml-1">(Actual)</span>}
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
                      title="Eliminar mapa"
                      onClick={(e) => handleDelete(m.id, e)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
