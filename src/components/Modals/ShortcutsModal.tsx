import React from 'react';
import { Keyboard } from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
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
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <ModalHeader
        title="Atajos de Teclado"
        subtitle="Accesos rápidos compatibles con Freeplane y FreeMind"
        icon={<Keyboard className="w-5 h-5 text-blue-600" />}
        onClose={onClose}
      />

      {/* Shortcuts List */}
      <div className="p-6 overflow-y-auto space-y-2 text-xs">
        {SHORTCUTS.map((sc, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
          >
            <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.desc}</span>
            <kbd className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 shrink-0 ml-4">
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
        <Button variant="primary" size="sm" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </ModalBackdrop>
  );
};

