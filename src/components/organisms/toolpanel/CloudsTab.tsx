import React from 'react';
import { MindNode, CloudShape, NodePatternStyle, NodeGradientDirection, NodeBgImageMode } from '../../../types/mindmap';
import { CollapsibleSection } from '../../atoms/CollapsibleSection';
import { ColorPicker } from '../../atoms/ColorPicker';
import { SliderInput } from '../../atoms/SliderInput';
import { ToggleButtonGroup } from '../../atoms/ToggleButtonGroup';
import {
  Cloud,
  Layers,
  Sparkles,
  Paintbrush,
  Square,
  Circle,
  Hexagon,
  Star,
  MessageSquare,
} from 'lucide-react';

interface CloudsTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
}

const CLOUD_SHAPES: { id: CloudShape; name: string; icon: React.ReactNode }[] = [
  { id: 'cloud-scallop', name: 'Nube', icon: <Cloud className="w-4 h-4" /> },
  { id: 'arc', name: 'Arco', icon: <Circle className="w-4 h-4" /> },
  { id: 'round-rectangle', name: 'Redondeado', icon: <Square className="w-4 h-4 rounded-md" /> },
  { id: 'rectangle', name: 'Rectángulo', icon: <Square className="w-4 h-4" /> },
  { id: 'bubble', name: 'Burbuja', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'oval', name: 'Óvalo', icon: <Circle className="w-4 h-4 scale-x-125" /> },
  { id: 'hexagon', name: 'Hexágono', icon: <Hexagon className="w-4 h-4" /> },
  { id: 'star', name: 'Estrella', icon: <Star className="w-4 h-4" /> },
];

export const CloudsTab: React.FC<CloudsTabProps> = ({ selectedNode, onUpdateNode }) => {
  const isCloudEnabled = Boolean(selectedNode.cloud?.enabled);
  const currentCloud = selectedNode.cloud || {
    enabled: false,
    color: '#3b82f6',
    shape: 'cloud-scallop',
    opacity: 0.08,
    bgType: 'color',
    borderColor: '#3b82f6',
    borderWidth: 1.5,
    borderDash: 'dashed',
    shadow: true,
  };

  const [sectionsOpen, setSectionsOpen] = React.useState<Record<string, boolean>>({
    shape: true,
    fill: false,
    border: false,
  });

  const toggleSection = (s: string) => {
    setSectionsOpen((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const handleToggleCloud = () => {
    if (isCloudEnabled) {
      onUpdateNode(selectedNode.id, { cloud: undefined });
    } else {
      onUpdateNode(selectedNode.id, {
        cloud: {
          enabled: true,
          color: '#3b82f6',
          shape: 'cloud-scallop',
          opacity: 0.08,
          bgType: 'color',
          borderColor: '#3b82f6',
          borderWidth: 1.5,
          borderDash: 'dashed',
          shadow: true,
        },
      });
    }
  };

  const updateCloudProps = (updates: Partial<typeof currentCloud>) => {
    onUpdateNode(selectedNode.id, {
      cloud: {
        ...currentCloud,
        enabled: true,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Interruptor maestro de nube */}
      <div className="flex items-center justify-between p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-600" />
          <div>
            <span className="font-semibold text-xs text-blue-900 block">Nube de Agrupación</span>
            <span className="text-[10px] text-blue-600 font-normal">
              Envuelve visualmente este nodo y sus descendientes
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleCloud}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isCloudEnabled ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isCloudEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {isCloudEnabled && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* 1. Forma y Dimensiones de la Nube */}
          <CollapsibleSection
            title="Forma y Márgenes"
            subtitle="Geometría y tamaño de envolvente"
            isOpen={sectionsOpen.shape}
            onToggle={() => toggleSection('shape')}
            icon={<Square className="w-3.5 h-3.5" />}
          >
            <div className="grid grid-cols-4 gap-1.5">
              {CLOUD_SHAPES.map((s) => {
                const isSelected = (currentCloud.shape || 'cloud-scallop') === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    title={s.name}
                    onClick={() => updateCloudProps({ shape: s.id })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.icon}
                    <span className="text-[9.5px] mt-1 truncate w-full text-center">{s.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200/80 space-y-3">
              <SliderInput
                label="Margen Horizontal Extra"
                value={currentCloud.paddingX || 0}
                min={-50}
                max={200}
                step={5}
                unit="px"
                onChange={(px) => updateCloudProps({ paddingX: px })}
                onReset={() => updateCloudProps({ paddingX: undefined })}
              />

              <SliderInput
                label="Margen Vertical Extra"
                value={currentCloud.paddingY || 0}
                min={-50}
                max={200}
                step={5}
                unit="px"
                onChange={(py) => updateCloudProps({ paddingY: py })}
                onReset={() => updateCloudProps({ paddingY: undefined })}
              />
            </div>
          </CollapsibleSection>

          {/* 2. Relleno y Color */}
          <CollapsibleSection
            title="Relleno de la Nube"
            subtitle="Color y transparencia de fondo"
            isOpen={sectionsOpen.fill}
            onToggle={() => toggleSection('fill')}
            icon={<Paintbrush className="w-3.5 h-3.5" />}
          >
            <div className="space-y-3">
              <ColorPicker
                label="Color de Nube"
                value={currentCloud.color || '#3b82f6'}
                onChange={(color) => updateCloudProps({ color })}
              />

              <SliderInput
                label="Opacidad de Fondo"
                value={Math.round((currentCloud.opacity !== undefined ? currentCloud.opacity : 0.08) * 100)}
                min={0}
                max={100}
                unit="%"
                onChange={(op) => updateCloudProps({ opacity: op / 100 })}
              />
            </div>
          </CollapsibleSection>

          {/* 3. Borde y Sombra */}
          <CollapsibleSection
            title="Borde y Sombra"
            subtitle="Contorno de la agrupación"
            isOpen={sectionsOpen.border}
            onToggle={() => toggleSection('border')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            <div className="space-y-3">
              <ColorPicker
                label="Color de Borde"
                value={currentCloud.borderColor || '#3b82f6'}
                onChange={(bc) => updateCloudProps({ borderColor: bc })}
              />

              <SliderInput
                label="Grosor de Borde"
                value={currentCloud.borderWidth !== undefined ? currentCloud.borderWidth : 1.5}
                min={0}
                max={6}
                step={0.5}
                unit="px"
                onChange={(bw) => updateCloudProps({ borderWidth: bw })}
              />

              <span className="text-[11px] font-semibold text-slate-600 block">Estilo de Línea</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'solid' as const, label: 'Sólido', stroke: 'border-solid' },
                  { id: 'dashed' as const, label: 'Guiones', stroke: 'border-dashed' },
                  { id: 'dotted' as const, label: 'Puntos', stroke: 'border-dotted' },
                ].map((dash) => {
                  const isSelected = (currentCloud.borderDash || 'dashed') === dash.id;
                  return (
                    <button
                      key={dash.id}
                      type="button"
                      onClick={() => updateCloudProps({ borderDash: dash.id })}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 border-t-2 ${dash.stroke} border-current my-1`} />
                      <span className="text-[10px] text-center truncate w-full">{dash.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
};
