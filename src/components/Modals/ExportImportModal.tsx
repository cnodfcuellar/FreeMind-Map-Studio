import React, { useState } from 'react';
import { MindMap } from '../../types/mindmap';
import {
  exportToFreeplaneXML,
  importFromFreeplaneXML,
  exportToStandaloneHTML,
  exportToMarkdown,
} from '../../utils/freeplaneConverter';
import {
  X,
  FileCode,
  Globe,
  FileText,
  Image,
  Upload,
  Download,
  Check,
  Sparkles,
} from 'lucide-react';

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-800">
              Exportar e Importar Mapas Mentales
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Exportar (Formatos Portables)
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Importar Archivo
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-3">
              {/* 1. Freeplane .mm */}
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/30 hover:bg-orange-50/60 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-800">
                        Formato Freeplane / FreeMind (.mm)
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                        100% Compatible
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Archivo XML estándar compatible con Freeplane, FreeMind y Mindomo.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportFreeplaneMM}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .mm</span>
                </button>
              </div>

              {/* 2. Standalone HTML */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-800">
                        HTML Portable (Autónomo & Offline)
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Un único archivo HTML que se abre en cualquier navegador sin internet ni servidor.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportPortableHTML}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .html</span>
                </button>
              </div>

              {/* 3. Markdown Outline */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-800">
                        Esquema Markdown (.md)
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Texto Plano
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Ideal para Obsidian, Notion o editores de texto plano.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportMarkdown}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .md</span>
                </button>
              </div>

              {/* 4. JSON Backup */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-800">
                        Copia Completa JSON (.json)
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                        Respaldo 100%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Estructura íntegra con todas las posiciones, colores, notas y presentaciones.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .json</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <h3 className="font-semibold text-sm text-slate-800 mb-1">
                  Arrastra o selecciona un archivo .mm o .json
                </h3>
                <p className="text-xs text-slate-500 mb-4">
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
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {importError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
