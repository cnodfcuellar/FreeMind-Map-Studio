import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const SHORTCUTS = [
    { key: 'Tab / Insert', desc: 'Crear nuevo nodo hijo del nodo seleccionado', cat: 'Nodos' },
    { key: 'Enter', desc: 'Crear nuevo nodo hermano al mismo nivel', cat: 'Nodos' },
    { key: 'Shift + Enter', desc: 'Salto de línea multilínea dentro del nodo', cat: 'Edición' },
    { key: 'F2 / Doble Clic', desc: 'Editar el texto del nodo en el mapa', cat: 'Edición' },
    { key: 'Supr / Delete', desc: 'Eliminar el nodo seleccionado y sus hijos', cat: 'Nodos' },
    { key: 'Espacio (Space)', desc: 'Plegar o desplegar la rama del nodo', cat: 'Navegación' },
    { key: 'Flechas (↑ ↓ ← →)', desc: 'Navegar rápidamente entre nodos y ramas', cat: 'Navegación' },
    { key: 'Escape', desc: 'Volver al nodo raíz o cancelar edición', cat: 'Navegación' },
    { key: 'Ctrl + Z', desc: 'Deshacer la última acción', cat: 'Historial' },
    { key: 'Ctrl + Y', desc: 'Rehacer la acción deshecha', cat: 'Historial' },
    { key: 'Ctrl + C / X / V', desc: 'Copiar, cortar y pegar ramas completas', cat: 'Portapapeles' },
    { key: 'Ctrl + F', desc: 'Abrir la barra de búsqueda y filtrado', cat: 'Vistas' },
    { key: 'Alt + O', desc: 'Mostrar u ocultar el panel lateral de esquema', cat: 'Vistas' },
    { key: 'Alt + P', desc: 'Mostrar u ocultar el panel de propiedades', cat: 'Vistas' },
    { key: 'F5', desc: 'Iniciar el modo presentación de diapositivas', cat: 'Vistas' },
    { key: 'F11', desc: 'Alternar modo pantalla completa', cat: 'Vistas' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-800">
              Atajos de Teclado (Tipo Freeplane)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 overflow-y-auto space-y-2 text-xs">
          {SHORTCUTS.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
            >
              <span className="text-slate-700 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg font-mono text-[11px] font-semibold text-slate-800 shrink-0 ml-4">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
