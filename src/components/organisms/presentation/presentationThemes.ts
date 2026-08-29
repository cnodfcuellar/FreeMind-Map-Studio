export interface PresentationThemeConfig {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  accentClass: string;
  cardBgClass: string;
  cardBorderClass: string;
  previewColor: string;
  badgeBg: string;
}

export const PRESENTATION_THEMES: PresentationThemeConfig[] = [
  {
    id: 'dark-studio',
    name: 'Estudio Oscuro',
    bgClass: 'bg-slate-950',
    textClass: 'text-white',
    accentClass: 'text-blue-400',
    cardBgClass: 'bg-slate-900/95',
    cardBorderClass: 'border-slate-800',
    previewColor: '#0f172a',
    badgeBg: 'bg-blue-950/80 border-blue-800/60 text-blue-300',
  },
  {
    id: 'midnight-oled',
    name: 'Medianoche OLED',
    bgClass: 'bg-black',
    textClass: 'text-slate-100',
    accentClass: 'text-cyan-400',
    cardBgClass: 'bg-zinc-950',
    cardBorderClass: 'border-zinc-800',
    previewColor: '#000000',
    badgeBg: 'bg-cyan-950/80 border-cyan-800/60 text-cyan-300',
  },
  {
    id: 'cyberpunk-purple',
    name: 'Cyberpunk Neón',
    bgClass: 'bg-[#120726]',
    textClass: 'text-purple-100',
    accentClass: 'text-pink-400',
    cardBgClass: 'bg-[#1e0d3d]/95',
    cardBorderClass: 'border-purple-800/60',
    previewColor: '#1e0d3d',
    badgeBg: 'bg-purple-950/80 border-purple-800/60 text-purple-300',
  },
  {
    id: 'navy-executive',
    name: 'Azul Ejecutivo',
    bgClass: 'bg-[#09152b]',
    textClass: 'text-slate-100',
    accentClass: 'text-amber-400',
    cardBgClass: 'bg-[#102347]/95',
    cardBorderClass: 'border-blue-900/60',
    previewColor: '#0a192f',
    badgeBg: 'bg-amber-950/80 border-amber-800/60 text-amber-300',
  },
  {
    id: 'emerald-forest',
    name: 'Esmeralda Natural',
    bgClass: 'bg-[#051c14]',
    textClass: 'text-emerald-50',
    accentClass: 'text-emerald-400',
    cardBgClass: 'bg-[#0b2f22]/95',
    cardBorderClass: 'border-emerald-800/60',
    previewColor: '#064e3b',
    badgeBg: 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300',
  },
  {
    id: 'sunset-warm',
    name: 'Atardecer Cálido',
    bgClass: 'bg-[#210c14]',
    textClass: 'text-orange-50',
    accentClass: 'text-orange-400',
    cardBgClass: 'bg-[#3b1523]/95',
    cardBorderClass: 'border-rose-900/60',
    previewColor: '#881337',
    badgeBg: 'bg-orange-950/80 border-orange-800/60 text-orange-300',
  },
  {
    id: 'minimal-light',
    name: 'Luz Minimalista',
    bgClass: 'bg-slate-50',
    textClass: 'text-slate-900',
    accentClass: 'text-blue-600',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-slate-200',
    previewColor: '#ffffff',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
  },
];
