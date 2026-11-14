import React, { useState, useMemo } from 'react';
import { MindMap } from '../../types/mindmap';
import {
  PdfPaperSize,
  PdfOrientation,
  PdfPaginationMode,
  PdfExportOptions,
  PAPER_SIZES_MM,
  calculatePaginationGrid,
  generateMindMapVectorSvg,
  triggerBrowserPdfPrint,
  downloadVectorSvg,
} from '../../utils/pdfExporter';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';
import {
  Printer,
  FileDown,
  Layout,
  Maximize2,
  FileText,
  Sparkles,
  Check,
  Grid,
  Crop,
  Layers,
} from 'lucide-react';

export interface PdfExportModalProps {
  mindMap: MindMap;
  isOpen: boolean;
  onClose: () => void;
}

const PAPER_OPTIONS: { id: PdfPaperSize; name: string; desc: string }[] = [
  { id: 'A4', name: 'A4 Estándar', desc: '210 × 297 mm (impresora común)' },
  { id: 'A3', name: 'A3 Mediano', desc: '297 × 420 mm (doble carta)' },
  { id: 'A2', name: 'A2 Grande', desc: '420 × 594 mm (planos y póster)' },
  { id: 'Letter', name: 'Carta (Letter)', desc: '8.5 × 11 pulgadas' },
  { id: 'Legal', name: 'Oficio (Legal)', desc: '8.5 × 14 pulgadas' },
  { id: 'Tabloid', name: 'Tabloide', desc: '11 × 17 pulgadas' },
  { id: 'Poster', name: 'Póster Continuo', desc: 'Ajuste exacto al tamaño del mapa' },
];

const PAGINATION_OPTIONS: { id: PdfPaginationMode; name: string; pages: string; icon: string }[] = [
  { id: 'single', name: '1 Sola Hoja (Póster)', pages: '1 pág.', icon: '1' },
  { id: 'grid-2x1', name: 'Mosaico 2×1 (Horizontal)', pages: '2 págs.', icon: '2' },
  { id: 'grid-2x2', name: 'Mosaico 2×2 (Cuadrícula)', pages: '4 págs.', icon: '4' },
  { id: 'grid-3x2', name: 'Mosaico 3×2 (Panorámico)', pages: '6 págs.', icon: '6' },
  { id: 'grid-3x3', name: 'Mosaico 3×3 (Mural Gigante)', pages: '9 págs.', icon: '9' },
];

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ mindMap, isOpen, onClose }) => {
  const [paperSize, setPaperSize] = useState<PdfPaperSize>('A4');
  const [orientation, setOrientation] = useState<PdfOrientation>('landscape');
  const [paginationMode, setPaginationMode] = useState<PdfPaginationMode>('single');
  const [includeBackground, setIncludeBackground] = useState(true);
  const [includeHeaderFooter, setIncludeHeaderFooter] = useState(true);
  const [includeCropMarks, setIncludeCropMarks] = useState(true);
  const [marginMm, setMarginMm] = useState<number>(8);

  const currentOptions: PdfExportOptions = useMemo(
    () => ({
      paperSize,
      orientation,
      paginationMode,
      includeBackground,
      includeHeaderFooter,
      includeCropMarks,
      marginMm,
    }),
    [paperSize, orientation, paginationMode, includeBackground, includeHeaderFooter, includeCropMarks, marginMm]
  );

  const gridInfo = useMemo(() => {
    return calculatePaginationGrid(mindMap, currentOptions);
  }, [mindMap, currentOptions]);

  // Live SVG for Sheet Preview
  const previewSvg = useMemo(() => {
    return generateMindMapVectorSvg(mindMap, undefined, { includeBackground });
  }, [mindMap, includeBackground]);

  // Aspect ratio calculation for virtual sheet preview
  const sheetAspectRatio = gridInfo.paperWidthMm / gridInfo.paperHeightMm;

  const handlePrint = () => {
    triggerBrowserPdfPrint(mindMap, currentOptions);
  };

  const handleDownloadSvg = () => {
    downloadVectorSvg(mindMap, currentOptions);
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <ModalHeader
        title="Exportar a PDF Vectorial e Impresión Profesional"
        subtitle="Generación vectorial sin pérdida de calidad para 'Guardar como PDF' o descargar en SVG"
        icon={<Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        onClose={onClose}
      />

      {/* Main Grid: Controls + Live Sheet Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto max-h-[75vh]">
        {/* Left Column: Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          {/* 1. Paper Size */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Tamaño de Papel</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PAPER_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaperSize(p.id)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    paperSize === p.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-500 font-semibold shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-[11px] truncate">{p.name}</div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Orientation */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-indigo-600" />
              <span>Orientación de Hoja</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  orientation === 'landscape'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-500 font-semibold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-4 h-3 border border-current rounded-xs shrink-0" />
                <span>Horizontal (Apaisado)</span>
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  orientation === 'portrait'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-500 font-semibold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-3 h-4 border border-current rounded-xs shrink-0" />
                <span>Vertical (Retrato)</span>
              </button>
            </div>
          </div>

          {/* 3. Pagination Mode */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-purple-600" />
              <span>Modo de Paginación / Mosaico Mural</span>
            </label>
            <div className="space-y-1.5">
              {PAGINATION_OPTIONS.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setPaginationMode(mode.id)}
                  className={`w-full p-2 px-3 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    paginationMode === mode.id
                      ? 'border-purple-600 bg-purple-50/70 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-500 font-semibold shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {mode.icon}
                    </span>
                    <span>{mode.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {mode.pages}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Fine Tune Checkboxes */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeBackground}
                onChange={(e) => setIncludeBackground(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Incluir fondo y trama del mapa (desmarcar para fondo blanco)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeHeaderFooter}
                onChange={(e) => setIncludeHeaderFooter(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Incluir título, autor y pie técnico de página</span>
            </label>

            {gridInfo.totalPages > 1 && (
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeCropMarks}
                  onChange={(e) => setIncludeCropMarks(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="flex items-center gap-1">
                  <Crop className="w-3 h-3 text-purple-600" /> Marcas de corte y solapamiento de 15mm para unir hojas
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Right Column: Live Sheet Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-100/70 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 min-h-[380px]">
          <div className="w-full flex items-center justify-between text-xs mb-3 text-slate-500 dark:text-slate-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulación de Hoja de Impresión</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              {gridInfo.paperWidthMm} × {gridInfo.paperHeightMm} mm • {gridInfo.totalPages} {gridInfo.totalPages === 1 ? 'Página' : 'Páginas'}
            </span>
          </div>

          {/* Virtual Paper Sheet Container */}
          <div className="w-full flex-1 flex items-center justify-center p-2">
            <div
              className="relative bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden transition-all duration-200"
              style={{
                width: sheetAspectRatio >= 1 ? '100%' : `${Math.round(sheetAspectRatio * 100)}%`,
                aspectRatio: `${gridInfo.paperWidthMm} / ${gridInfo.paperHeightMm}`,
                maxHeight: '340px',
              }}
            >
              {/* Header inside sheet */}
              {includeHeaderFooter && (
                <div className="absolute top-0 inset-x-0 h-4 bg-slate-50/90 border-b border-slate-100 px-2 flex items-center justify-between text-[7px] text-slate-400 font-medium z-10">
                  <span className="truncate">{mindMap.title}</span>
                  <span>100% Vectorial</span>
                </div>
              )}

              {/* Vector SVG Rendered inside Sheet */}
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />

              {/* Tiling Grid Overlay in Preview */}
              {gridInfo.totalPages > 1 && (
                <div className="absolute inset-0 grid pointer-events-none z-20"
                  style={{
                    gridTemplateColumns: `repeat(${gridInfo.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridInfo.rows}, 1fr)`,
                  }}
                >
                  {gridInfo.tiles.map((t) => (
                    <div
                      key={t.pageNumber}
                      className="border border-dashed border-purple-500/60 bg-purple-500/5 flex items-center justify-center p-1 relative"
                    >
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-600/90 text-white font-mono font-bold text-[8px] shadow-xs">
                        Pág. {t.pageNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 text-center text-[10px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Resolución Vectorial Nativa: el PDF mantendrá texto y curvas 100% nítidas al hacer zoom.</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={handleDownloadSvg}>
          <FileDown className="w-3.5 h-3.5 mr-1 text-purple-600" />
          <span>Descargar SVG Vectorial (.svg)</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5 mr-1" />
            <span>Imprimir / Guardar como PDF Vectorial</span>
          </Button>
        </div>
      </div>
    </ModalBackdrop>
  );
};
