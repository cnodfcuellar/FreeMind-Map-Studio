import React, { useState } from 'react';
import { MindMap } from '../../types/mindmap';
import {
  exportToFreeplaneXML,
  importFromFreeplaneXML,
  exportToStandaloneHTML,
  exportToMarkdown,
} from '../../utils/freeplaneConverter';
import {
  FileCode,
  Globe,
  FileText,
  Upload,
  Download,
  Sparkles,
} from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';

interface ExportImportModalProps {
  mindMap: MindMap;
  isOpen: boolean;
  onClose: () => void;
  onImportMap: (importedMap: MindMap) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  mindMap,
  isOpen,
  onClose,
  onImportMap,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importError, setImportError] = useState<string | null>(null);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportFreeplaneMM = () => {
    const xml = exportToFreeplaneXML(mindMap);
    const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';
    downloadFile(xml, `${safeTitle}.mm`, 'application/xml');
  };

  const handleExportPortableHTML = () => {
    const html = exportToStandaloneHTML(mindMap);
    const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';
    downloadFile(html, `${safeTitle}_portable.html`, 'text/html');
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(mindMap, null, 2);
    const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';
    downloadFile(json, `${safeTitle}.json`, 'application/json');
  };

  const handleExportMarkdown = () => {
    const md = exportToMarkdown(mindMap);
    const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';
    downloadFile(md, `${safeTitle}.md`, 'text/markdown');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (parsed && parsed.rootId && parsed.nodes) {
            onImportMap(parsed);
            onClose();
            return;
          }
        }
        // Assume Freeplane / FreeMind .mm XML
        const imported = importFromFreeplaneXML(text);
        onImportMap(imported);
        onClose();
      } catch (err: any) {
        setImportError(err.message || 'Error al procesar el archivo. Asegúrate de que sea un archivo .mm o .json válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <ModalHeader
        title="Exportar e Importar Mapas Mentales"
        subtitle="Intercambio de archivos con Freeplane, HTML portable, Markdown e imágenes"
        icon={<Download className="w-5 h-5 text-blue-600" />}
        onClose={onClose}
      />

      {/* Tab Toggle */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'export'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Download className="w-3.5 h-3.5" /> Exportar (Formatos Portables)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'import'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Importar Archivo
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto space-y-4">
        {activeTab === 'export' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Descarga tu mapa mental en formatos estándar para compartir, presentar o abrir en otros programas:
            </p>

            {/* 1. Freeplane .mm */}
            <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-800/60 hover:bg-amber-50/70 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Formato Freeplane / FreeMind (.mm)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                      100% Compatible
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Archivo XML estándar compatible con Freeplane, FreeMind y suites de escritorio.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportFreeplaneMM}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .mm</span>
              </button>
            </div>

            {/* 2. Standalone HTML */}
            <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-800/60 hover:bg-blue-50/70 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      HTML Portable (Autónomo & Offline)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Un único archivo HTML que se abre en cualquier navegador sin internet ni servidor.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportPortableHTML}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .html</span>
              </button>
            </div>

            {/* 3. Markdown Outline */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/70 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Esquema Markdown (.md)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Texto Plano
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ideal para Obsidian, Notion o editores de texto plano con jerarquía de encabezados.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .md</span>
              </button>
            </div>

            {/* 4. JSON Backup */}
            <div className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-800/60 hover:bg-indigo-50/70 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Copia Completa JSON (.json)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800">
                      Respaldo 100%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Estructura íntegra con todas las posiciones, colores, notas y presentaciones.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .json</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">
                Arrastra o selecciona un archivo .mm o .json
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Soporta mapas mentales creados en Freeplane, FreeMind o copias de seguridad.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs">
                <span>Seleccionar Archivo</span>
                <input
                  type="file"
                  accept=".mm,.json,.xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
                {importError}
              </div>
            )}
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
};
