import React from 'react';
import { X, Sparkles, Map, Zap, Layers, Video, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface ComingSoonModalData {
  title: string;
  subtitle: string;
  mode: 'elaborate' | 'dynamic';
}

interface ComingSoonModalProps {
  isOpen: boolean;
  data: ComingSoonModalData | null;
  onClose: () => void;
  onStartClassic?: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  data,
  onClose,
  onStartClassic,
}) => {
  if (!isOpen || !data) return null;

  const isElaborate = data.mode === 'elaborate';

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Top Gradient Banner */}
        <div
          className={`p-6 relative overflow-hidden text-white ${
            isElaborate
              ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-600'
              : 'bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500'
          }`}
        >
          {/* Decorative background glow circles */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/15 blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/15 blur-lg pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-[11px] font-bold tracking-wide uppercase backdrop-blur-sm shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Próximamente
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-md shrink-0 backdrop-blur-sm">
              {isElaborate ? (
                <Map className="w-6 h-6 text-white" />
              ) : (
                <Zap className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight leading-tight">
                {data.title}
              </h2>
              <p className="text-xs text-white/85 font-medium mt-0.5">
                {data.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Estamos perfeccionando esta modalidad de presentación para ofrecerte una experiencia fluida e interactiva de nivel profesional.
          </p>

          {/* Feature Highlights */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Lo que incluirá este modo:
            </span>
            {isElaborate ? (
              <>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Cámara de Enfoque Dinámico:</strong> Desplazamiento y zoom suave automático siguiendo el flujo del mapa.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Atenuación Contextual:</strong> Resalta la rama activa mientras atenúa el resto del mapa para máxima claridad.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Panel HUD de Notas:</strong> Despliega notas y detalles del nodo en una tarjeta flotante transparente.</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span><strong>Transiciones Cinemáticas:</strong> Animaciones 3D fluidas entre nodos y cambios de nivel jerárquico.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span><strong>Auto-Reproducción con Temporizador:</strong> Presentación automática con pausas configurables por nodo.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span><strong>Línea de Tiempo Interactiva:</strong> Barra de progreso visual con vista previa de ramas en miniatura.</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          {onStartClassic ? (
            <button
              onClick={() => {
                onClose();
                onStartClassic();
              }}
              className="text-xs text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              Usar Modo Clásico <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
