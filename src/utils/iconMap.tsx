import React from 'react';
import { getVectorIconItem, VECTOR_ICON_PACK } from './vectorIconPack';
import {
  Check,
  Star,
  Flag,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  Heart,
  Calendar,
  Clock,
  Flame,
  Bookmark,
  Sparkles,
  Smile,
  Frown,
  ThumbsUp,
  Tag,
  FileText,
  Link,
  Keyboard,
  Layout,
  Presentation,
  FileCode,
  Globe,
  Image,
  Database,
  ShieldCheck,
  CheckCircle,
  Activity,
  Zap,
  Target,
  Award,
} from 'lucide-react';

export interface IconDefinition {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  color?: string;
}

// Available curated starter icons for quick access
export const AVAILABLE_ICONS: IconDefinition[] = [
  // Priorities
  { id: 'p1', name: 'Prioridad 1', category: 'priority', icon: <span className="font-bold text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">1</span> },
  { id: 'p2', name: 'Prioridad 2', category: 'priority', icon: <span className="font-bold text-xs bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center">2</span> },
  { id: 'p3', name: 'Prioridad 3', category: 'priority', icon: <span className="font-bold text-xs bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center">3</span> },
  { id: 'p4', name: 'Prioridad 4', category: 'priority', icon: <span className="font-bold text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">4</span> },
  { id: 'p5', name: 'Prioridad 5', category: 'priority', icon: <span className="font-bold text-xs bg-slate-500 text-white rounded-full w-4 h-4 flex items-center justify-center">5</span> },
  
  // Status
  { id: 'check', name: 'Completado', category: 'status', icon: <Check className="w-3.5 h-3.5 text-emerald-600" /> },
  { id: 'check-circle', name: 'Verificado', category: 'status', icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> },
  { id: 'activity', name: 'En curso', category: 'status', icon: <Activity className="w-3.5 h-3.5 text-blue-600" /> },
  { id: 'alert-triangle', name: 'Atención', category: 'status', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> },
  { id: 'help-circle', name: 'Duda', category: 'status', icon: <HelpCircle className="w-3.5 h-3.5 text-purple-600" /> },
  { id: 'clock', name: 'Pendiente', category: 'status', icon: <Clock className="w-3.5 h-3.5 text-indigo-600" /> },

  // Markers & Highlights
  { id: 'star', name: 'Estrella / Favorito', category: 'markers', icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> },
  { id: 'flag', name: 'Bandera', category: 'markers', icon: <Flag className="w-3.5 h-3.5 text-red-500 fill-red-500" /> },
  { id: 'lightbulb', name: 'Idea', category: 'markers', icon: <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'flame', name: 'Urgente / Fuego', category: 'markers', icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
  { id: 'zap', name: 'Rápido', category: 'markers', icon: <Zap className="w-3.5 h-3.5 text-yellow-500" /> },
  { id: 'target', name: 'Objetivo', category: 'markers', icon: <Target className="w-3.5 h-3.5 text-rose-500" /> },
  { id: 'award', name: 'Premio / Hito', category: 'markers', icon: <Award className="w-3.5 h-3.5 text-purple-500" /> },
  
  // General
  { id: 'heart', name: 'Me gusta', category: 'general', icon: <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" /> },
  { id: 'sparkles', name: 'Destacado', category: 'general', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> },
  { id: 'thumbs-up', name: 'Aprobado', category: 'general', icon: <ThumbsUp className="w-3.5 h-3.5 text-blue-600" /> },
  { id: 'calendar', name: 'Fecha', category: 'general', icon: <Calendar className="w-3.5 h-3.5 text-slate-600" /> },
  { id: 'tag', name: 'Etiqueta', category: 'general', icon: <Tag className="w-3.5 h-3.5 text-slate-600" /> },
  { id: 'file-text', name: 'Documento', category: 'general', icon: <FileText className="w-3.5 h-3.5 text-slate-600" /> },
  { id: 'link', name: 'Conexión', category: 'general', icon: <Link className="w-3.5 h-3.5 text-blue-500" /> },
  { id: 'keyboard', name: 'Teclado', category: 'general', icon: <Keyboard className="w-3.5 h-3.5 text-slate-600" /> },
  { id: 'globe', name: 'Web', category: 'general', icon: <Globe className="w-3.5 h-3.5 text-emerald-600" /> },
  { id: 'database', name: 'Base de datos', category: 'general', icon: <Database className="w-3.5 h-3.5 text-indigo-600" /> },
  { id: 'shield-check', name: 'Seguridad', category: 'general', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> },
];

/**
 * Universal vector icon renderer supporting all 500+ vector SVG icons with optional custom color and size
 */
export function renderNodeIcon(iconId: string, className: string | number = 'w-3.5 h-3.5', customColor?: string, customSize?: number): React.ReactNode {
  const safeClassName = typeof className === 'string' ? className : 'w-3.5 h-3.5';
  const finalSize = typeof className === 'number' ? className : customSize;
  const finalColor = typeof className === 'number' && typeof customColor === 'string' ? customColor : customColor;

  const style: React.CSSProperties = {
    ...(finalColor ? { color: finalColor } : {}),
    ...(finalSize ? { width: `${finalSize}px`, height: `${finalSize}px` } : {}),
  };

  // 1. Check in 500+ vector icon repository
  const vectorItem = getVectorIconItem(iconId);
  if (vectorItem) {
    const IconComponent = vectorItem.icon;
    return <IconComponent className={safeClassName} style={style} />;
  }

  // 2. Fallback check in available icons list
  const found = AVAILABLE_ICONS.find(i => i.id === iconId);
  if (found) {
    if (customColor || customSize) {
      return <span style={style} className="inline-flex items-center justify-center">{found.icon}</span>;
    }
    return found.icon;
  }
  
  // 3. Fallback for common aliases and legacy names
  switch (iconId) {
    case 'idea':
    case 'lightbulb': return <Lightbulb className={`${className} ${customColor ? '' : 'text-amber-500'}`} style={style} />;
    case 'check': return <Check className={`${className} ${customColor ? '' : 'text-emerald-600'}`} style={style} />;
    case 'star': return <Star className={`${className} ${customColor ? '' : 'text-amber-500 fill-amber-400'}`} style={style} />;
    case 'flag-red': return <Flag className={`${className} ${customColor ? '' : 'text-red-500 fill-red-500'}`} style={style} />;
    case 'flag-yellow': return <Flag className={`${className} ${customColor ? '' : 'text-yellow-500 fill-yellow-400'}`} style={style} />;
    case 'flag-blue': return <Flag className={`${className} ${customColor ? '' : 'text-blue-500 fill-blue-400'}`} style={style} />;
    case 'keyboard': return <Keyboard className={`${className} ${customColor ? '' : 'text-slate-600'}`} style={style} />;
    case 'sparkles': return <Sparkles className={`${className} ${customColor ? '' : 'text-indigo-500'}`} style={style} />;
    case 'activity': return <Activity className={`${className} ${customColor ? '' : 'text-blue-600'}`} style={style} />;
    case 'file-text': return <FileText className={`${className} ${customColor ? '' : 'text-slate-600'}`} style={style} />;
    case 'link': return <Link className={`${className} ${customColor ? '' : 'text-blue-500'}`} style={style} />;
    case 'layout': return <Layout className={`${className} ${customColor ? '' : 'text-slate-600'}`} style={style} />;
    case 'presentation': return <Presentation className={`${className} ${customColor ? '' : 'text-purple-600'}`} style={style} />;
    case 'file-code': return <FileCode className={`${className} ${customColor ? '' : 'text-orange-600'}`} style={style} />;
    case 'globe': return <Globe className={`${className} ${customColor ? '' : 'text-emerald-600'}`} style={style} />;
    case 'image': return <Image className={`${className} ${customColor ? '' : 'text-blue-500'}`} style={style} />;
    case 'database': return <Database className={`${className} ${customColor ? '' : 'text-indigo-600'}`} style={style} />;
    case 'shield-check': return <ShieldCheck className={`${className} ${customColor ? '' : 'text-emerald-600'}`} style={style} />;
    case 'check-circle': return <CheckCircle className={`${className} ${customColor ? '' : 'text-emerald-600'}`} style={style} />;
    default:
      return <span className="text-xs" style={style}>{iconId}</span>;
  }
}

