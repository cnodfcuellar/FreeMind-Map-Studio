import React from 'react';
import { MindNode, CloudShape, NodePatternStyle, NodeGradientDirection, NodeBgImageMode } from '../../../types/mindmap';
import { CollapsibleSection } from '../../atoms/CollapsibleSection';
import { ColorPicker } from '../../atoms/ColorPicker';
import { SliderInput } from '../../atoms/SliderInput';
import { ToggleButtonGroup } from '../../atoms/ToggleButtonGroup';
import { Switch } from '../../atoms/Switch';
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
    shadow: false,
  };

  const [sectionsOpen, setSectionsOpen] = React.useState<Record<string, boolean>>({
    shape: true,
    fill: false,
    border: false,
  });

  const toggleSection = (s: string) => {
    setSectionsOpen((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const handleExpandAll = (expand: boolean) => {
    setSectionsOpen({
      shape: expand,
      fill: expand,
      border: expand,
    });
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
          shadow: false,
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
        <Switch
          checked={isCloudEnabled}
          onChange={handleToggleCloud}
        />
      </div>

      {isCloudEnabled && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Barra superior de plegar / desplegar */}
          <div className="flex items-center justify-between pb-0.5">
            <span className="text-[10.5px] font-bold text-[var(--sp-muted)] uppercase tracking-wider">
              Formato de la Nube
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleExpandAll(true)}
                className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
              >
                Desplegar todo
              </button>
              <span className="text-slate-300 text-[10px]">|</span>
              <button
                type="button"
                onClick={() => handleExpandAll(false)}
                className="text-[10.5px] text-slate-500 hover:text-slate-700 font-medium hover:underline cursor-pointer"
              >
                Plegar todo
              </button>
            </div>
          </div>

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

              {/* Sombra Envolvente de Isla Conceptual */}
              <div className="pt-3 border-t border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 block">Sombra Envolvente</span>
                    <span className="text-[10px] text-slate-500 block">Efecto isla conceptual flotante</span>
                  </div>
                  <Switch
                    checked={Boolean(currentCloud.shadow)}
                    onChange={(val) => updateCloudProps({ shadow: val })}
                  />
                </div>

                {currentCloud.shadow && (
                  <div className="space-y-3 pt-1">
                    {/* 4 Presets Rápidos */}
                    <div>
                      <span className="text-[10px] font-medium text-slate-600 block mb-1.5">Presets Rápidos</span>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'soft' as const, label: 'Suave' },
                          { id: 'island' as const, label: 'Isla 3D' },
                          { id: 'deep' as const, label: 'Profunda' },
                          { id: 'glow' as const, label: 'Glow' },
                        ].map((preset) => {
                          const isCur = (currentCloud.shadowPreset || 'island') === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                let blur = 24;
                                let offsetY = 10;
                                let opacity = 0.40;
                                let color = '#0f172a';
                                if (preset.id === 'soft') {
                                  blur = 14;
                                  offsetY = 4;
                                  opacity = 0.22;
                                  color = '#0f172a';
                                } else if (preset.id === 'deep') {
                                  blur = 36;
                                  offsetY = 16;
                                  opacity = 0.60;
                                  color = '#0f172a';
                                } else if (preset.id === 'glow') {
                                  blur = 18;
                                  offsetY = 0;
                                  opacity = 0.70;
                                  color = currentCloud.borderColor || '#3b82f6';
                                }
                                updateCloudProps({
                                  shadowPreset: preset.id,
                                  shadowBlur: blur,
                                  shadowOffsetY: offsetY,
                                  shadowOpacity: opacity,
                                  shadowColor: color,
                                });
                              }}
                              className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                                isCur
                                  ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-2xs'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Slider de Intensidad / Opacidad */}
                    <SliderInput
                      label="Intensidad de Sombra"
                      value={Math.round(
                        (currentCloud.shadowOpacity ??
                          (currentCloud.shadowPreset === 'deep'
                            ? 0.60
                            : currentCloud.shadowPreset === 'soft'
                            ? 0.22
                            : currentCloud.shadowPreset === 'glow'
                            ? 0.70
                            : 0.40)) * 100
                      )}
                      min={10}
                      max={95}
                      unit="%"
                      onChange={(pct) => updateCloudProps({ shadowOpacity: pct / 100 })}
                    />

                    {/* Slider de Desenfoque */}
                    <SliderInput
                      label="Desenfoque (Blur)"
                      value={
                        currentCloud.shadowBlur ??
                        (currentCloud.shadowPreset === 'deep'
                          ? 36
                          : currentCloud.shadowPreset === 'soft'
                          ? 14
                          : currentCloud.shadowPreset === 'glow'
                          ? 18
                          : 24)
                      }
                      min={4}
                      max={48}
                      unit="px"
                      onChange={(blur) => updateCloudProps({ shadowBlur: blur })}
                    />

                    {/* Slider de Desplazamiento Y */}
                    <SliderInput
                      label="Desplazamiento Vertical (Y)"
                      value={
                        currentCloud.shadowOffsetY ??
                        (currentCloud.shadowPreset === 'deep'
                          ? 16
                          : currentCloud.shadowPreset === 'soft'
                          ? 4
                          : currentCloud.shadowPreset === 'glow'
                          ? 0
                          : 10)
                      }
                      min={0}
                      max={30}
                      unit="px"
                      onChange={(y) => updateCloudProps({ shadowOffsetY: y })}
                    />

                    {/* Selector de Color de Sombra */}
                    <ColorPicker
                      label="Color de Sombra"
                      value={currentCloud.shadowColor}
                      onChange={(color) => updateCloudProps({ shadowColor: color })}
                      onClear={() => updateCloudProps({ shadowColor: undefined })}
                    />
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
};
