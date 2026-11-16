import React, { useState, useMemo } from 'react';
import { MindMap } from '../../types/mindmap';
import {
  ImageFormat,
  ImageBackgroundMode,
  getImageDimensions,
  downloadMindMapImage,
  copyMindMapImageToClipboard,
  exportMindMapToSvg,
} from '../../utils/imageExporter';
import {
  exportToMarkdown,
  exportToOPML,
  MarkdownMode,
} from '../../utils/outlineExporter';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';
import {
  Image,
  FileText,
  Copy,
  Download,
  Check,
  Sparkles,
  Layers,
  Code,
  CheckSquare,
  List,
  Heading,
  Maximize2,
} from 'lucide-react';

export interface ImageExportModalProps {
  mindMap: MindMap;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'image' | 'outline';
}

export const ImageExportModal: React.FC<ImageExportModalProps> = ({
  mindMap,
  isOpen,
  onClose,
  initialTab = 'image',
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'outline'>(initialTab);

  // Estados de Imagen
  const [format, setFormat] = useState<ImageFormat>('png');
  const [scale, setScale] = useState<number>(2); // 1x, 2x, 4x
  const [bgMode, setBgMode] = useState<ImageBackgroundMode>('transparent');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  // Estados de Esquema
  const [outlineFormat, setOutlineFormat] = useState<'md-headers' | 'md-bullets' | 'md-tasks' | 'opml'>('md-headers');
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);
  const [includeBody, setIncludeBody] = useState<boolean>(true);
  const [includeLinks, setIncludeLinks] = useState<boolean>(true);
  const [includeTags, setIncludeTags] = useState<boolean>(true);
  const [includeConnectors, setIncludeConnectors] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Dimensiones calculadas
  const dimensions = useMemo(() => {
    return getImageDimensions(mindMap, scale);
  }, [mindMap, scale]);

  // Preview SVG
  const previewSvg = useMemo(() => {
    return exportMindMapToSvg(mindMap, {
      background: bgMode,
    });
  }, [mindMap, bgMode]);

  // Contenido de Esquema
  const outlineContent = useMemo(() => {
    if (outlineFormat === 'opml') {
      return exportToOPML(mindMap);
    }
    const mode: MarkdownMode =
      outlineFormat === 'md-headers'
        ? 'headers'
        : outlineFormat === 'md-tasks'
        ? 'tasks'
        : 'bullets';

    return exportToMarkdown(mindMap, {
      mode,
      includeNotes,
      includeBody,
      includeLinks,
      includeTags,
      includeConnectors,
    });
  }, [
    mindMap,
    outlineFormat,
    includeNotes,
    includeBody,
    includeLinks,
    includeTags,
    includeConnectors,
  ]);

  // Manejador descarga imagen
  const handleDownloadImage = async () => {
    try {
      setIsExporting(true);
      await downloadMindMapImage(mindMap, {
        format,
        scale,
        background: bgMode,
      });
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Manejador copiar imagen al portapapeles
  const handleCopyImage = async () => {
    try {
      setIsExporting(true);
      const success = await copyMindMapImageToClipboard(mindMap, {
        scale,
        background: bgMode,
      });
      if (success) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2200);
      }
    } catch (err) {
      console.error('Error al copiar imagen:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Manejador copiar esquema de texto
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(outlineContent);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2200);
    } catch (err) {
      console.error('Error al copiar texto:', err);
    }
  };

  // Manejador descarga archivo de esquema
  const handleDownloadOutline = () => {
    const isOpml = outlineFormat === 'opml';
    const extension = isOpml ? 'opml' : 'md';
    const mimeType = isOpml ? 'text/xml' : 'text/markdown';
    const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';

    const blob = new Blob([outlineContent], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <ModalHeader
        title="Exportar Mapa: Imagen HD y Esquemas"
        subtitle="Genera imágenes retina en alta resolución (PNG/JPEG) o esquemas estructurados para Notion, Obsidian y OPML"
        icon={<Sparkles className="w-5 h-5 text-blue-600" />}
        onClose={onClose}
      />

      {/* Selector de Pestañas Superiores */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'image'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Imagen en Alta Resolución (PNG / JPG / SVG)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('outline')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'outline'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Esquemas & Notas (Markdown / OPML)</span>
        </button>
      </div>

      {/* Contenido según pestaña */}
      <div className="p-6 overflow-y-auto max-h-[75vh]">
        {activeTab === 'image' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Controles y Opciones */}
            <div className="lg:col-span-5 space-y-4">
              {/* 1. Formato */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Formato de Imagen
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'png' as ImageFormat, label: 'PNG', desc: 'Sin pérdida' },
                    { id: 'jpeg' as ImageFormat, label: 'JPEG', desc: 'Comprimido' },
                    { id: 'svg' as ImageFormat, label: 'SVG', desc: 'Vectorial' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormat(item.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        format === item.id
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs uppercase">{item.label}</span>
                      <span className="block text-[9.5px] opacity-75">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Escala de Resolución */}
              {format !== 'svg' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Resolución / Nitidez
                    </label>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {dimensions.width} × {dimensions.height} px
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { s: 1, label: '1x', desc: 'Web / Email' },
                      { s: 2, label: '2x Retina', desc: 'Presentación PPT' },
                      { s: 4, label: '4x Ultra', desc: 'Impresión 4K' },
                    ].map((item) => (
                      <button
                        key={item.s}
                        type="button"
                        onClick={() => setScale(item.s)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          scale === item.s
                            ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-xs font-bold">{item.label}</span>
                        <span className="block text-[9.5px] opacity-75">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Fondo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Fondo de la Imagen
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'transparent' as ImageBackgroundMode, label: 'Transparente', disabled: format === 'jpeg' },
                    { id: 'theme' as ImageBackgroundMode, label: 'Lienzo Mapa', disabled: false },
                    { id: 'white' as ImageBackgroundMode, label: 'Blanco Puro', disabled: false },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => setBgMode(item.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        item.disabled
                          ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800'
                          : bgMode === item.id
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-2xs cursor-pointer'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <span className="block text-[11px]">{item.label}</span>
                    </button>
                  ))}
                </div>
                {format === 'jpeg' && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                    * El formato JPEG no soporta canal alfa de transparencia.
                  </p>
                )}
              </div>

              {/* Acciones principales */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleDownloadImage}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isExporting ? 'Procesando imagen...' : `Descargar ${format.toUpperCase()} (${scale}x)`}
                  </span>
                </button>

                {format === 'png' && (
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleCopyImage}
                    className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {copiedImage ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          ¡Imagen copiada al portapapeles!
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Copiar Imagen PNG (Pegar en PPT/Word)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Columna Derecha: Previsualización */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Vista Previa de Renderizado</span>
                <span className="text-[10.5px]">
                  {dimensions.width} × {dimensions.height} px
                </span>
              </div>

              <div
                className="w-full h-80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex items-center justify-center shadow-inner"
                style={{
                  background:
                    bgMode === 'transparent'
                      ? 'repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%) 50% / 16px 16px'
                      : bgMode === 'white'
                      ? '#ffffff'
                      : undefined,
                }}
              >
                <div
                  className="w-full h-full p-4 flex items-center justify-center select-none"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                La imagen final se generará directamente con la nitidez nativa especificada.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Opciones de Esquema */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Estilo de Esquema
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'md-headers' as const, label: 'Encabezados #', desc: 'Notion / Obsidian' },
                    { id: 'md-bullets' as const, label: 'Viñetas -', desc: 'Listas anidadas' },
                    { id: 'md-tasks' as const, label: 'Checklist [ ]', desc: 'Lista de tareas' },
                    { id: 'opml' as const, label: 'OPML 2.0', desc: 'Estándar XML' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOutlineFormat(item.id)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        outlineFormat === item.id
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs">{item.label}</span>
                      <span className="block text-[9.5px] opacity-75">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opciones booleanas de inclusión */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Contenido a Incluir
                </span>

                <div className="space-y-1.5">
                  {[
                    { id: 'body', label: 'Cuerpo y descripciones de nodos', val: includeBody, set: setIncludeBody },
                    { id: 'notes', label: 'Notas extensas en citas (> quote)', val: includeNotes, set: setIncludeNotes },
                    { id: 'links', label: 'Enlaces e hipervínculos externos', val: includeLinks, set: setIncludeLinks },
                    { id: 'tags', label: 'Etiquetas (#tags)', val: includeTags, set: setIncludeTags },
                    { id: 'connectors', label: 'Tabla de relaciones libres', val: includeConnectors, set: setIncludeConnectors },
                  ].map((chk) => (
                    <label key={chk.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={chk.val}
                        onChange={(e) => chk.set(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>{chk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Acciones principales */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={handleDownloadOutline}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    Descargar Archivo {outlineFormat === 'opml' ? '.opml' : '.md'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        ¡Texto copiado al portapapeles!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copiar Texto Completo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Columna Derecha: Vista previa de código */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Vista Previa del Archivo Generado</span>
                <span className="text-[10px] font-mono">
                  {outlineContent.split('\n').length} líneas
                </span>
              </div>

              <textarea
                readOnly
                value={outlineContent}
                rows={14}
                className="w-full font-mono text-[11px] bg-slate-900 text-slate-200 p-3 rounded-2xl border border-slate-800 outline-none resize-none shadow-inner select-all"
              />
            </div>
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
};
