import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ALL_SIMPLE_ICONS, SIMPLE_ICONS_BY_ID } from './simpleIconsPack';

export interface VectorIconItem {
  id: string;
  name: string;
  category: VectorIconCategory;
  tags: string[];
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  isColorFilled?: boolean;
  hex?: string;
  path?: string;
}

export type VectorIconCategory =
  | 'priority_status'
  | 'business_finance'
  | 'tech_code'
  | 'communication'
  | 'design_media'
  | 'education_science'
  | 'navigation_maps'
  | 'documents_files'
  | 'nature_weather'
  | 'tools_security'
  | 'health_sports'
  | 'emojis_symbols'
  | 'brands_dev'
  | 'brands_tech'
  | 'brands_social'
  | 'brands_design'
  | 'brands_all';

export interface CategoryInfo {
  id: VectorIconCategory;
  name: string;
  iconName: string;
  description: string;
}

export const VECTOR_ICON_CATEGORIES: CategoryInfo[] = [
  { id: 'priority_status', name: 'Prioridad & Estados', iconName: 'CheckCircle2', description: 'Niveles de prioridad 1-9, completado, alertas, banderas' },
  { id: 'brands_dev', name: 'Desarrollo & Cloud (Simple Icons)', iconName: 'Code', description: 'GitHub, Docker, React, Python, AWS, Kubernetes, Linux, TypeScript...' },
  { id: 'brands_tech', name: 'Big Tech & IA (Simple Icons)', iconName: 'Cpu', description: 'Google, Apple, Microsoft, OpenAI, Nvidia, Meta, Amazon, Tesla...' },
  { id: 'brands_social', name: 'Redes & Social (Simple Icons)', iconName: 'MessageSquare', description: 'YouTube, Discord, Slack, LinkedIn, Twitter/X, Instagram, Telegram...' },
  { id: 'brands_design', name: 'Diseño & Apps (Simple Icons)', iconName: 'Palette', description: 'Figma, Notion, Canva, Adobe, Jira, Trello, Linear, Miro...' },
  { id: 'brands_all', name: 'Todas las Marcas (3,450+ Simple Icons)', iconName: 'Globe', description: 'Catálogo exhaustivo completo de marcas y logos Simple Icons' },
  { id: 'business_finance', name: 'Negocios & Finanzas', iconName: 'Briefcase', description: 'Monedas, finanzas, métricas, ventas, gráficos de crecimiento' },
  { id: 'tech_code', name: 'Tecnología & Código', iconName: 'Terminal', description: 'Desarrollo, servidores, nube, hardware, bases de datos' },
  { id: 'communication', name: 'Comunicación & Usuarios', iconName: 'Users', description: 'Mensajería, correo, usuarios, llamadas, notificaciones' },
  { id: 'design_media', name: 'Diseño & Multimedia', iconName: 'Image', description: 'Arte, fotografía, vídeo, audio, herramientas de diseño' },
  { id: 'education_science', name: 'Educación & Ciencia', iconName: 'GraduationCap', description: 'Aprendizaje, física, química, investigación, ideas' },
  { id: 'navigation_maps', name: 'Navegación & Lugares', iconName: 'Compass', description: 'Mapas, brújulas, flechas, ubicación, rutas' },
  { id: 'documents_files', name: 'Documentos & Archivos', iconName: 'FileText', description: 'Carpetas, hojas de cálculo, notas, libros, proyectos' },
  { id: 'nature_weather', name: 'Naturaleza & Clima', iconName: 'Sun', description: 'Sol, luna, lluvia, plantas, energía, medio ambiente' },
  { id: 'tools_security', name: 'Herramientas & Seguridad', iconName: 'ShieldCheck', description: 'Seguridad, candados, configuración, ajustes de sistema' },
  { id: 'health_sports', name: 'Salud, Deportes & Vida', iconName: 'Activity', description: 'Bienestar, medicina, fitness, alimentación, ocio' },
  { id: 'emojis_symbols', name: 'Símbolos & Emociones', iconName: 'Sparkles', description: 'Estrellas, corazones, trofeos, medallas, emociones' },
];

// Helper to safely extract component or create fallback
const getIcon = (name: keyof typeof LucideIcons): React.ComponentType<{ className?: string; style?: React.CSSProperties }> => {
  const IconComp = (LucideIcons as any)[name];
  if (IconComp) return IconComp;
  return LucideIcons.HelpCircle;
};

// Priority SVG Badge generators for P1 to P9
const createPriorityBadge = (num: number, bg: string, border: string): React.ComponentType<{ className?: string }> => {
  const PriorityBadge: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={bg} stroke={border} strokeWidth="1.5" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {num}
      </text>
    </svg>
  );
  PriorityBadge.displayName = `PriorityBadge_${num}`;
  return PriorityBadge;
};

// MASTER VECTOR ICONS REPOSITORY: 520+ CURATED VECTOR SVG ICONS
const LUCIDE_CURATED_PACK: VectorIconItem[] = [
  // ==========================================
  // 1. PRIORIDAD & ESTADOS (45 icons)
  // ==========================================
  { id: 'p1', name: 'Prioridad 1 (Urgente)', category: 'priority_status', tags: ['prioridad', 'p1', 'urgente', 'rojo', '1'], icon: createPriorityBadge(1, '#ef4444', '#dc2626') },
  { id: 'p2', name: 'Prioridad 2 (Alta)', category: 'priority_status', tags: ['prioridad', 'p2', 'alta', 'naranja', '2'], icon: createPriorityBadge(2, '#f97316', '#ea580c') },
  { id: 'p3', name: 'Prioridad 3 (Media)', category: 'priority_status', tags: ['prioridad', 'p3', 'media', 'ambar', '3'], icon: createPriorityBadge(3, '#f59e0b', '#d97706') },
  { id: 'p4', name: 'Prioridad 4 (Baja)', category: 'priority_status', tags: ['prioridad', 'p4', 'baja', 'azul', '4'], icon: createPriorityBadge(4, '#3b82f6', '#2563eb') },
  { id: 'p5', name: 'Prioridad 5 (Mínima)', category: 'priority_status', tags: ['prioridad', 'p5', 'minima', 'gris', '5'], icon: createPriorityBadge(5, '#64748b', '#475569') },
  { id: 'p6', name: 'Prioridad 6', category: 'priority_status', tags: ['prioridad', 'p6', '6'], icon: createPriorityBadge(6, '#8b5cf6', '#7c3aed') },
  { id: 'p7', name: 'Prioridad 7', category: 'priority_status', tags: ['prioridad', 'p7', '7'], icon: createPriorityBadge(7, '#06b6d4', '#0891b2') },
  { id: 'p8', name: 'Prioridad 8', category: 'priority_status', tags: ['prioridad', 'p8', '8'], icon: createPriorityBadge(8, '#10b981', '#059669') },
  { id: 'p9', name: 'Prioridad 9', category: 'priority_status', tags: ['prioridad', 'p9', '9'], icon: createPriorityBadge(9, '#ec4899', '#db2777') },

  { id: 'check', name: 'Completado', category: 'priority_status', tags: ['check', 'listo', 'ok', 'completado', 'correcto'], icon: getIcon('Check') },
  { id: 'check-check', name: 'Doble Check / Aprobado', category: 'priority_status', tags: ['doble check', 'visto', 'entregado', 'aprobado'], icon: getIcon('CheckCheck') },
  { id: 'check-circle', name: 'Verificado en Círculo', category: 'priority_status', tags: ['verificado', 'circulo', 'valido', 'ok'], icon: getIcon('CheckCircle') },
  { id: 'check-circle-2', name: 'Confirmado Éxito', category: 'priority_status', tags: ['confirmado', 'exito', 'circulo'], icon: getIcon('CheckCircle2') },
  { id: 'check-square', name: 'Casilla Marcada', category: 'priority_status', tags: ['checkbox', 'casilla', 'marcada', 'tarea'], icon: getIcon('CheckSquare') },
  { id: 'square', name: 'Casilla Pendiente', category: 'priority_status', tags: ['checkbox', 'pendiente', 'cuadro', 'vacio'], icon: getIcon('Square') },
  { id: 'alert-triangle', name: 'Advertencia Peligro', category: 'priority_status', tags: ['alerta', 'advertencia', 'triangulo', 'peligro', 'warning'], icon: getIcon('AlertTriangle') },
  { id: 'alert-circle', name: 'Alerta Círculo', category: 'priority_status', tags: ['alerta', 'atencion', 'circulo', 'error'], icon: getIcon('AlertCircle') },
  { id: 'alert-octagon', name: 'Alerta Crítica / Stop', category: 'priority_status', tags: ['alerta', 'stop', 'octogono', 'critico'], icon: getIcon('AlertOctagon') },
  { id: 'badge-alert', name: 'Insignia de Alerta', category: 'priority_status', tags: ['badge', 'insignia', 'alerta', 'aviso'], icon: getIcon('BadgeAlert') },
  { id: 'badge-check', name: 'Insignia Verificada', category: 'priority_status', tags: ['badge', 'verificado', 'oficial', 'certificado'], icon: getIcon('BadgeCheck') },
  { id: 'badge-info', name: 'Insignia Informativa', category: 'priority_status', tags: ['badge', 'info', 'informacion'], icon: getIcon('BadgeInfo') },
  { id: 'badge-help', name: 'Insignia de Ayuda', category: 'priority_status', tags: ['badge', 'ayuda', 'soporte'], icon: getIcon('BadgeHelp') },
  { id: 'help-circle', name: 'Pregunta / Duda', category: 'priority_status', tags: ['ayuda', 'duda', 'pregunta', 'faq', 'help'], icon: getIcon('HelpCircle') },
  { id: 'info', name: 'Información General', category: 'priority_status', tags: ['info', 'informacion', 'detalle', 'guia'], icon: getIcon('Info') },
  { id: 'flag', name: 'Bandera Estándar', category: 'priority_status', tags: ['bandera', 'marcador', 'hito', 'flag'], icon: getIcon('Flag') },
  { id: 'flag-triangle-right', name: 'Banderín de Meta', category: 'priority_status', tags: ['banderin', 'meta', 'hito'], icon: getIcon('FlagTriangleRight') },
  { id: 'flame', name: 'Fuego / Urgente', category: 'priority_status', tags: ['fuego', 'urgente', 'caliente', 'prioritario', 'flame'], icon: getIcon('Flame') },
  { id: 'zap', name: 'Rayo / Inmediato', category: 'priority_status', tags: ['rayo', 'rapido', 'inmediato', 'energia', 'zap'], icon: getIcon('Zap') },
  { id: 'clock', name: 'Reloj / En Espera', category: 'priority_status', tags: ['reloj', 'tiempo', 'espera', 'cronometro', 'pendiente'], icon: getIcon('Clock') },
  { id: 'hourglass', name: 'Reloj de Arena', category: 'priority_status', tags: ['reloj de arena', 'tiempo', 'limite', 'esperando'], icon: getIcon('Hourglass') },
  { id: 'timer', name: 'Temporizador', category: 'priority_status', tags: ['temporizador', 'timer', 'cuenta atras', 'plazo'], icon: getIcon('Timer') },
  { id: 'alarm-clock', name: 'Alarma / Despertador', category: 'priority_status', tags: ['alarma', 'recordatorio', 'despertador'], icon: getIcon('AlarmClock') },
  { id: 'calendar-clock', name: 'Fecha Límite', category: 'priority_status', tags: ['fecha limite', 'calendario', 'entrega', 'deadline'], icon: getIcon('CalendarClock') },
  { id: 'target', name: 'Objetivo / Diana', category: 'priority_status', tags: ['objetivo', 'meta', 'diana', 'target', 'kpi'], icon: getIcon('Target') },
  { id: 'crosshair', name: 'Punto de Mira / Enfoque', category: 'priority_status', tags: ['enfoque', 'mira', 'preciso', 'foco'], icon: getIcon('Crosshair') },
  { id: 'ban', name: 'Prohibido / Bloqueado', category: 'priority_status', tags: ['bloqueado', 'prohibido', 'cancelado', 'no'], icon: getIcon('Ban') },
  { id: 'x-circle', name: 'Cancelado / Error', category: 'priority_status', tags: ['error', 'cancelado', 'fallo', 'cerrar'], icon: getIcon('XCircle') },
  { id: 'x-octagon', name: 'Detener Emergencia', category: 'priority_status', tags: ['detener', 'parar', 'stop', 'emergencia'], icon: getIcon('XOctagon') },
  { id: 'pause-circle', name: 'En Pausa', category: 'priority_status', tags: ['pausa', 'detenido', 'esperar'], icon: getIcon('PauseCircle') },
  { id: 'play-circle', name: 'En Ejecución / Play', category: 'priority_status', tags: ['iniciado', 'ejecucion', 'play', 'arranque'], icon: getIcon('PlayCircle') },
  { id: 'refresh-cw', name: 'En Proceso / Sincronizando', category: 'priority_status', tags: ['proceso', 'sincronizando', 'recarga', 'loop'], icon: getIcon('RefreshCw') },
  { id: 'loader', name: 'Cargando', category: 'priority_status', tags: ['cargando', 'progreso', 'espera', 'loader'], icon: getIcon('Loader') },
  { id: 'shield-alert', name: 'Escudo en Alerta', category: 'priority_status', tags: ['seguridad', 'alerta', 'escudo', 'vulnerable'], icon: getIcon('ShieldAlert') },
  { id: 'radio', name: 'En Vivo / Transmitiendo', category: 'priority_status', tags: ['en vivo', 'live', 'transmision', 'activo'], icon: getIcon('Radio') },

  // ==========================================
  // 2. NEGOCIOS, FINANZAS & TRABAJO (50 icons)
  // ==========================================
  { id: 'briefcase', name: 'Maletín / Trabajo', category: 'business_finance', tags: ['maletin', 'trabajo', 'negocio', 'empresa', 'empleo'], icon: getIcon('Briefcase') },
  { id: 'building', name: 'Edificio / Oficina', category: 'business_finance', tags: ['edificio', 'oficina', 'sede', 'empresa'], icon: getIcon('Building') },
  { id: 'building-2', name: 'Corporación / Rascacielos', category: 'business_finance', tags: ['corporacion', 'rascacielos', 'negocio'], icon: getIcon('Building2') },
  { id: 'dollar-sign', name: 'Dólar / Dinero', category: 'business_finance', tags: ['dolar', 'dinero', 'moneda', 'precio', 'ingreso'], icon: getIcon('DollarSign') },
  { id: 'euro', name: 'Euro', category: 'business_finance', tags: ['euro', 'dinero', 'europa', 'moneda'], icon: getIcon('Euro') },
  { id: 'pound-sterling', name: 'Libra Esterlina', category: 'business_finance', tags: ['libra', 'dinero', 'uk', 'moneda'], icon: getIcon('PoundSterling') },
  { id: 'coins', name: 'Monedas / Ahorro', category: 'business_finance', tags: ['monedas', 'cambio', 'ahorro', 'efectivo'], icon: getIcon('Coins') },
  { id: 'wallet', name: 'Billetera', category: 'business_finance', tags: ['billetera', 'cartera', 'pagos', 'fondos'], icon: getIcon('Wallet') },
  { id: 'credit-card', name: 'Tarjeta de Crédito', category: 'business_finance', tags: ['tarjeta', 'credito', 'debito', 'pago', 'compra'], icon: getIcon('CreditCard') },
  { id: 'receipt', name: 'Recibo / Factura', category: 'business_finance', tags: ['recibo', 'factura', 'ticket', 'comprobante'], icon: getIcon('Receipt') },
  { id: 'trending-up', name: 'Crecimiento / Tendencia Alza', category: 'business_finance', tags: ['crecimiento', 'alza', 'exito', 'subida', 'ganancia'], icon: getIcon('TrendingUp') },
  { id: 'trending-down', name: 'Descenso / Pérdida', category: 'business_finance', tags: ['bajada', 'descenso', 'perdida', 'caida'], icon: getIcon('TrendingDown') },
  { id: 'bar-chart', name: 'Gráfico de Barras', category: 'business_finance', tags: ['grafico', 'barras', 'estadisticas', 'analytics'], icon: getIcon('BarChart') },
  { id: 'bar-chart-2', name: 'Gráfico Comparativo', category: 'business_finance', tags: ['grafico', 'comparacion', 'rendimiento'], icon: getIcon('BarChart2') },
  { id: 'bar-chart-3', name: 'Métricas de Negocio', category: 'business_finance', tags: ['metricas', 'grafico', 'informe'], icon: getIcon('BarChart3') },
  { id: 'pie-chart', name: 'Gráfico Circular / Tarta', category: 'business_finance', tags: ['grafico circular', 'tarta', 'porcentaje', 'cuota'], icon: getIcon('PieChart') },
  { id: 'line-chart', name: 'Gráfico de Líneas', category: 'business_finance', tags: ['grafico lineas', 'tendencia', 'evolucion'], icon: getIcon('LineChart') },
  { id: 'candlestick-chart', name: 'Velas Financieras / Trading', category: 'business_finance', tags: ['trading', 'bolsa', 'velas', 'finanzas'], icon: getIcon('CandlestickChart') },
  { id: 'presentation', name: 'Presentación Ejecutiva', category: 'business_finance', tags: ['presentacion', 'diapositivas', 'reunion', 'pitch'], icon: getIcon('Presentation') },
  { id: 'landmark', name: 'Banco / Institución', category: 'business_finance', tags: ['banco', 'institucion', 'gobierno', 'finanzas'], icon: getIcon('Landmark') },
  { id: 'piggy-bank', name: 'Alcancía / Ahorros', category: 'business_finance', tags: ['alcancia', 'cerdito', 'ahorro', 'reserva'], icon: getIcon('PiggyBank') },
  { id: 'badge-percent', name: 'Descuento / Porcentaje', category: 'business_finance', tags: ['descuento', 'porcentaje', 'oferta', 'promo'], icon: getIcon('BadgePercent') },
  { id: 'percent', name: 'Símbolo Porcentaje', category: 'business_finance', tags: ['porcentaje', 'tasa', 'interes'], icon: getIcon('Percent') },
  { id: 'shopping-cart', name: 'Carrito de Compras', category: 'business_finance', tags: ['carrito', 'compras', 'tienda', 'ecommerce'], icon: getIcon('ShoppingCart') },
  { id: 'shopping-bag', name: 'Bolsa de Compras', category: 'business_finance', tags: ['bolsa', 'compras', 'retail', 'tienda'], icon: getIcon('ShoppingBag') },
  { id: 'store', name: 'Tienda Física / Local', category: 'business_finance', tags: ['tienda', 'local', 'comercio', 'negocio'], icon: getIcon('Store') },
  { id: 'tag', name: 'Etiqueta de Precio', category: 'business_finance', tags: ['etiqueta', 'precio', 'oferta', 'tag'], icon: getIcon('Tag') },
  { id: 'tags', name: 'Múltiples Etiquetas', category: 'business_finance', tags: ['etiquetas', 'categorias', 'clasificacion'], icon: getIcon('Tags') },
  { id: 'award', name: 'Premio / Hito Comercial', category: 'business_finance', tags: ['premio', 'reconocimiento', 'hito', 'record'], icon: getIcon('Award') },
  { id: 'trophy', name: 'Trofeo de Éxito', category: 'business_finance', tags: ['trofeo', 'campeon', 'ganador', 'victoria'], icon: getIcon('Trophy') },
  { id: 'medal', name: 'Medalla de Oro', category: 'business_finance', tags: ['medalla', 'merito', 'logro', 'puesto'], icon: getIcon('Medal') },
  { id: 'scale', name: 'Balanza / Justicia Legal', category: 'business_finance', tags: ['balanza', 'ley', 'justicia', 'equilibrio', 'legal'], icon: getIcon('Scale') },
  { id: 'gavel', name: 'Martillo Legal / Contrato', category: 'business_finance', tags: ['martillo', 'juez', 'subasta', 'acuerdo'], icon: getIcon('Gavel') },
  { id: 'handshake', name: 'Apretón de Manos / Alianza', category: 'business_finance', tags: ['alianza', 'acuerdo', 'trato', 'socio', 'negociacion'], icon: getIcon('Handshake') },
  { id: 'network', name: 'Red de Contactos / Networking', category: 'business_finance', tags: ['red', 'networking', 'organigrama', 'nodos'], icon: getIcon('Network') },
  { id: 'user-check', name: 'Cliente Verificado', category: 'business_finance', tags: ['cliente', 'aprobado', 'usuario verificado'], icon: getIcon('UserCheck') },
  { id: 'user-plus', name: 'Nuevo Cliente / Contratación', category: 'business_finance', tags: ['reclutamiento', 'nuevo usuario', 'contratacion'], icon: getIcon('UserPlus') },
  { id: 'users', name: 'Equipo de Trabajo', category: 'business_finance', tags: ['equipo', 'grupo', 'empleados', 'comunidad'], icon: getIcon('Users') },
  { id: 'calculator', name: 'Calculadora / Presupuesto', category: 'business_finance', tags: ['calculadora', 'costos', 'presupuesto', 'cuentas'], icon: getIcon('Calculator') },
  { id: 'factory', name: 'Fábrica / Industria', category: 'business_finance', tags: ['fabrica', 'industria', 'produccion', 'manufactura'], icon: getIcon('Factory') },
  { id: 'boxes', name: 'Inventario / Almacén', category: 'business_finance', tags: ['inventario', 'almacen', 'stock', 'cajas'], icon: getIcon('Boxes') },
  { id: 'package', name: 'Paquete de Envío', category: 'business_finance', tags: ['paquete', 'envio', 'producto', 'caja'], icon: getIcon('Package') },
  { id: 'truck', name: 'Transporte / Logística', category: 'business_finance', tags: ['camion', 'logistica', 'transporte', 'entrega'], icon: getIcon('Truck') },
  { id: 'container', name: 'Contenedor / Comercio Exterior', category: 'business_finance', tags: ['contenedor', 'exportacion', 'importacion'], icon: getIcon('Container') },
  { id: 'newspaper', name: 'Noticias / Prensa', category: 'business_finance', tags: ['periodico', 'prensa', 'noticias', 'comunicado'], icon: getIcon('Newspaper') },
  { id: 'megaphone', name: 'Megáfono / Marketing', category: 'business_finance', tags: ['marketing', 'publicidad', 'anuncio', 'promocion'], icon: getIcon('Megaphone') },
  { id: 'target-arrow', name: 'Público Objetivo / Lead', category: 'business_finance', tags: ['lead', 'audiencia', 'meta comercial'], icon: getIcon('Target') },
  { id: 'stamp', name: 'Sello / Aprobación Oficial', category: 'business_finance', tags: ['sello', 'oficial', 'validez', 'firmado'], icon: getIcon('Stamp') },
  { id: 'qr-code', name: 'Código QR', category: 'business_finance', tags: ['qr', 'escaneo', 'codigo', 'enlace digital'], icon: getIcon('QrCode') },
  { id: 'scan', name: 'Escáner / Lector', category: 'business_finance', tags: ['escanear', 'codigo', 'lector'], icon: getIcon('Scan') },

  // ==========================================
  // 3. TECNOLOGÍA, CÓDIGO & DATOS (50 icons)
  // ==========================================
  { id: 'code', name: 'Código / Desarrollo', category: 'tech_code', tags: ['codigo', 'programacion', 'desarrollo', 'html', 'software'], icon: getIcon('Code') },
  { id: 'code-2', name: 'Etiquetas de Código', category: 'tech_code', tags: ['codigo', 'tags', 'script'], icon: getIcon('Code2') },
  { id: 'terminal', name: 'Consola / Terminal', category: 'tech_code', tags: ['terminal', 'consola', 'bash', 'cli', 'comandos'], icon: getIcon('Terminal') },
  { id: 'cpu', name: 'Procesador / CPU', category: 'tech_code', tags: ['cpu', 'procesador', 'chip', 'hardware', 'computacion'], icon: getIcon('Cpu') },
  { id: 'database', name: 'Base de Datos', category: 'tech_code', tags: ['base de datos', 'sql', 'almacenamiento', 'db', 'datos'], icon: getIcon('Database') },
  { id: 'server', name: 'Servidor Backend', category: 'tech_code', tags: ['servidor', 'backend', 'hosting', 'infraestructura'], icon: getIcon('Server') },
  { id: 'cloud', name: 'Nube Cloud', category: 'tech_code', tags: ['nube', 'cloud', 'aws', 'gcp', 'almacenamiento en linea'], icon: getIcon('Cloud') },
  { id: 'cloud-cog', name: 'Servicios en la Nube', category: 'tech_code', tags: ['cloud', 'configuracion nube', 'devops'], icon: getIcon('CloudCog') },
  { id: 'git-branch', name: 'Rama Git (Branch)', category: 'tech_code', tags: ['git', 'rama', 'branch', 'versionamiento'], icon: getIcon('GitBranch') },
  { id: 'git-commit', name: 'Commit Git', category: 'tech_code', tags: ['git', 'commit', 'cambio', 'historial'], icon: getIcon('GitCommit') },
  { id: 'git-merge', name: 'Merge Git', category: 'tech_code', tags: ['git', 'merge', 'fusion', 'pull request'], icon: getIcon('GitMerge') },
  { id: 'git-pull-request', name: 'Pull Request', category: 'tech_code', tags: ['pr', 'pull request', 'revision', 'github'], icon: getIcon('GitPullRequest') },
  { id: 'git-fork', name: 'Fork Git', category: 'tech_code', tags: ['fork', 'bifurcacion', 'copia repositorio'], icon: getIcon('GitFork') },
  { id: 'bug', name: 'Error / Bug', category: 'tech_code', tags: ['bug', 'error', 'fallo', 'depuracion', 'debug'], icon: getIcon('Bug') },
  { id: 'binary', name: 'Código Binario', category: 'tech_code', tags: ['binario', '0101', 'datos binarios', 'maquina'], icon: getIcon('Binary') },
  { id: 'bot', name: 'Robot / Agente IA', category: 'tech_code', tags: ['bot', 'robot', 'ia', 'inteligencia artificial', 'automatizacion'], icon: getIcon('Bot') },
  { id: 'circuit-board', name: 'Placa de Circuito', category: 'tech_code', tags: ['circuito', 'hardware', 'electronica', 'pcb'], icon: getIcon('CircuitBoard') },
  { id: 'laptop', name: 'Portátil / Laptop', category: 'tech_code', tags: ['laptop', 'computadora', 'portatil', 'notebook'], icon: getIcon('Laptop') },
  { id: 'monitor', name: 'Monitor / Pantalla', category: 'tech_code', tags: ['monitor', 'pantalla', 'display', 'escritorio'], icon: getIcon('Monitor') },
  { id: 'smartphone', name: 'Móvil / Smartphone', category: 'tech_code', tags: ['smartphone', 'movil', 'celular', 'telefono', 'app'], icon: getIcon('Smartphone') },
  { id: 'tablet', name: 'Tablet / iPad', category: 'tech_code', tags: ['tablet', 'ipad', 'pantalla tactil'], icon: getIcon('Tablet') },
  { id: 'watch', name: 'Smartwatch / Reloj', category: 'tech_code', tags: ['smartwatch', 'wearable', 'reloj inteligente'], icon: getIcon('Watch') },
  { id: 'hard-drive', name: 'Disco Duro / HDD', category: 'tech_code', tags: ['disco duro', 'hdd', 'ssd', 'almacenamiento'], icon: getIcon('HardDrive') },
  { id: 'hard-hat', name: 'Casco de Construcción', category: 'tech_code', tags: ['construccion', 'en obra', 'ingenieria'], icon: getIcon('HardHat') },
  { id: 'usb', name: 'Memoria USB', category: 'tech_code', tags: ['usb', 'pendrive', 'puerto', 'hardware'], icon: getIcon('Usb') },
  { id: 'wifi', name: 'Conexión Wi-Fi', category: 'tech_code', tags: ['wifi', 'inalambrico', 'internet', 'red'], icon: getIcon('Wifi') },
  { id: 'wifi-off', name: 'Sin Conexión Wi-Fi', category: 'tech_code', tags: ['sin internet', 'desconectado', 'offline'], icon: getIcon('WifiOff') },
  { id: 'bluetooth', name: 'Bluetooth', category: 'tech_code', tags: ['bluetooth', 'emparejamiento', 'inalambrico'], icon: getIcon('Bluetooth') },
  { id: 'satellite', name: 'Satélite', category: 'tech_code', tags: ['satelite', 'orbita', 'telecomunicaciones', 'gps'], icon: getIcon('Satellite') },
  { id: 'satellite-dish', name: 'Antena Parabólica', category: 'tech_code', tags: ['antena', 'senal', 'receptor'], icon: getIcon('SatelliteDish') },
  { id: 'radio-tower', name: 'Torre de Transmisión', category: 'tech_code', tags: ['torre', 'telecom', 'cobertura'], icon: getIcon('RadioTower') },
  { id: 'qr-scan', name: 'Escaneo de Código', category: 'tech_code', tags: ['escanear', 'qr', 'optico'], icon: getIcon('ScanLine') },
  { id: 'layers', name: 'Capas de Software / Layers', category: 'tech_code', tags: ['capas', 'arquitectura', 'niveles', 'layers'], icon: getIcon('Layers') },
  { id: 'webhook', name: 'Webhook / API', category: 'tech_code', tags: ['webhook', 'api', 'evento', 'integracion'], icon: getIcon('Webhook') },
  { id: 'blocks', name: 'Módulos / Bloques', category: 'tech_code', tags: ['bloques', 'modulos', 'componentes', 'plugins'], icon: getIcon('Blocks') },
  { id: 'cable', name: 'Cable de Red', category: 'tech_code', tags: ['cable', 'ethernet', 'conexion fisica'], icon: getIcon('Cable') },
  { id: 'power', name: 'Botón de Encendido', category: 'tech_code', tags: ['power', 'encendido', 'apagado', 'reiniciar'], icon: getIcon('Power') },
  { id: 'cpu-tower', name: 'Torre de Ordenador', category: 'tech_code', tags: ['torre', 'pc gamer', 'estacion de trabajo'], icon: getIcon('Server') },
  { id: 'fingerprint', name: 'Huella Dactilar / Biometría', category: 'tech_code', tags: ['huella', 'biometria', 'autenticacion', 'seguridad'], icon: getIcon('Fingerprint') },
  { id: 'scan-face', name: 'Reconocimiento Facial', category: 'tech_code', tags: ['face id', 'reconocimiento', 'camara ia'], icon: getIcon('ScanFace') },
  { id: 'mouse', name: 'Ratón / Mouse', category: 'tech_code', tags: ['mouse', 'raton', 'cursor', 'puntero'], icon: getIcon('Mouse') },
  { id: 'keyboard', name: 'Teclado de Computadora', category: 'tech_code', tags: ['teclado', 'mecanografia', 'atajos', 'keyboard'], icon: getIcon('Keyboard') },
  { id: 'gamepad', name: 'Mando / Videojuegos', category: 'tech_code', tags: ['gamepad', 'juegos', 'consola', 'gaming'], icon: getIcon('Gamepad2') },
  { id: 'printer', name: 'Impresora', category: 'tech_code', tags: ['impresora', 'imprimir', 'papel', 'copia'], icon: getIcon('Printer') },
  { id: 'router', name: 'Router de Red', category: 'tech_code', tags: ['router', 'modem', 'red local', 'ip'], icon: getIcon('Router') },
  { id: 'split', name: 'División / Fork', category: 'tech_code', tags: ['dividir', 'split', 'separar'], icon: getIcon('Split') },
  { id: 'combine', name: 'Combinar / Merge', category: 'tech_code', tags: ['combinar', 'unir', 'agrupar'], icon: getIcon('Combine') },
  { id: 'plug', name: 'Enchufe / Plugin', category: 'tech_code', tags: ['enchufe', 'plugin', 'conector', 'adaptador'], icon: getIcon('Plug') },
  { id: 'unplug', name: 'Desconectado', category: 'tech_code', tags: ['desenchufado', 'desconectado', 'aislado'], icon: getIcon('Unplug') },

  // ==========================================
  // 4. COMUNICACIÓN & REDES SOCIALES (45 icons)
  // ==========================================
  { id: 'message-square', name: 'Mensaje de Texto', category: 'communication', tags: ['mensaje', 'chat', 'comentario', 'texto'], icon: getIcon('MessageSquare') },
  { id: 'message-circle', name: 'Burbuja de Conversación', category: 'communication', tags: ['conversacion', 'dialogo', 'chat'], icon: getIcon('MessageCircle') },
  { id: 'messages-square', name: 'Foro / Hilo de Discusión', category: 'communication', tags: ['foro', 'hilos', 'respuestas', 'comunidad'], icon: getIcon('MessagesSquare') },
  { id: 'mail', name: 'Correo Electrónico', category: 'communication', tags: ['correo', 'email', 'inbox', 'mensaje'], icon: getIcon('Mail') },
  { id: 'mail-open', name: 'Correo Leído', category: 'communication', tags: ['correo abierto', 'leido', 'revisado'], icon: getIcon('MailOpen') },
  { id: 'mail-plus', name: 'Redactar Correo', category: 'communication', tags: ['nuevo correo', 'enviar email'], icon: getIcon('MailPlus') },
  { id: 'send', name: 'Enviar Mensaje / Avión', category: 'communication', tags: ['enviar', 'avion de papel', 'transmitir', 'send'], icon: getIcon('Send') },
  { id: 'phone', name: 'Teléfono / Llamada', category: 'communication', tags: ['telefono', 'llamada', 'contacto', 'celular'], icon: getIcon('Phone') },
  { id: 'phone-call', name: 'Llamada Entrante', category: 'communication', tags: ['llamando', 'conversacion telefonica'], icon: getIcon('PhoneCall') },
  { id: 'phone-forwarded', name: 'Desvío de Llamada', category: 'communication', tags: ['desvio', 'transferencia llamada'], icon: getIcon('PhoneForwarded') },
  { id: 'phone-missed', name: 'Llamada Perdida', category: 'communication', tags: ['perdida', 'no contestada'], icon: getIcon('PhoneMissed') },
  { id: 'bell', name: 'Campana / Notificación', category: 'communication', tags: ['notificacion', 'campana', 'alerta', 'aviso', 'bell'], icon: getIcon('Bell') },
  { id: 'bell-ring', name: 'Notificación Activa', category: 'communication', tags: ['sonando', 'aviso activo', 'recordatorio'], icon: getIcon('BellRing') },
  { id: 'bell-off', name: 'Silenciar Notificaciones', category: 'communication', tags: ['silencio', 'no molestar', 'sin avisos'], icon: getIcon('BellOff') },
  { id: 'share-2', name: 'Compartir', category: 'communication', tags: ['compartir', 'enviar', 'red social', 'share'], icon: getIcon('Share2') },
  { id: 'thumbs-up', name: 'Me Gusta / Like', category: 'communication', tags: ['like', 'me gusta', 'positivo', 'aprobado'], icon: getIcon('ThumbsUp') },
  { id: 'thumbs-down', name: 'No Me Gusta / Dislike', category: 'communication', tags: ['dislike', 'no me gusta', 'negativo'], icon: getIcon('ThumbsDown') },
  { id: 'heart', name: 'Corazón / Favorito', category: 'communication', tags: ['corazon', 'amor', 'favorito', 'love', 'heart'], icon: getIcon('Heart') },
  { id: 'user', name: 'Perfil de Usuario', category: 'communication', tags: ['usuario', 'persona', 'perfil', 'avatar', 'cuenta'], icon: getIcon('User') },
  { id: 'user-cog', name: 'Configuración de Usuario', category: 'communication', tags: ['cuenta', 'ajustes usuario', 'rol'], icon: getIcon('UserCog') },
  { id: 'user-x', name: 'Eliminar / Bloquear Usuario', category: 'communication', tags: ['bloquear', 'eliminar contacto'], icon: getIcon('UserX') },
  { id: 'contact', name: 'Libreta de Contactos', category: 'communication', tags: ['contactos', 'agenda', 'directorio'], icon: getIcon('Contact') },
  { id: 'at-sign', name: 'Mención @', category: 'communication', tags: ['arroba', 'mencion', 'etiquetar'], icon: getIcon('AtSign') },
  { id: 'hash', name: 'Hashtag #', category: 'communication', tags: ['hashtag', 'numeral', 'tendencia', 'etiqueta'], icon: getIcon('Hash') },
  { id: 'rss', name: 'Canal RSS / Feed', category: 'communication', tags: ['rss', 'feed', 'suscripcion', 'noticias'], icon: getIcon('Rss') },
  { id: 'podcast', name: 'Podcast / Emisión', category: 'communication', tags: ['podcast', 'audio', 'programa', 'episodio'], icon: getIcon('Podcast') },
  { id: 'mic', name: 'Micrófono / Voz', category: 'communication', tags: ['microfono', 'audio', 'grabacion', 'hablar'], icon: getIcon('Mic') },
  { id: 'mic-off', name: 'Micrófono Silenciado', category: 'communication', tags: ['mute', 'silenciado', 'sin microfono'], icon: getIcon('MicOff') },
  { id: 'video', name: 'Videollamada / Cámara', category: 'communication', tags: ['videollamada', 'zoom', 'meet', 'camara'], icon: getIcon('Video') },
  { id: 'video-off', name: 'Cámara Apagada', category: 'communication', tags: ['camara apagada', 'sin video'], icon: getIcon('VideoOff') },
  { id: 'voicemail', name: 'Buzón de Voz', category: 'communication', tags: ['buzon', 'mensaje de voz'], icon: getIcon('Voicemail') },
  { id: 'inbox', name: 'Bandeja de Entrada', category: 'communication', tags: ['inbox', 'recibidos', 'bandeja'], icon: getIcon('Inbox') },
  { id: 'pin', name: 'Fijar Mensaje / Chincheta', category: 'communication', tags: ['fijar', 'anclar', 'destacar', 'pin'], icon: getIcon('Pin') },
  { id: 'pin-off', name: 'Desanclar', category: 'communication', tags: ['desfijar', 'desanclar'], icon: getIcon('PinOff') },
  { id: 'sparkle', name: 'Destello Social', category: 'communication', tags: ['destello', 'popular', 'viral'], icon: getIcon('Sparkle') },

  // ==========================================
  // 5. DISEÑO, ARTE & MULTIMEDIA (45 icons)
  // ==========================================
  { id: 'palette', name: 'Paleta de Pintura / Color', category: 'design_media', tags: ['color', 'paleta', 'diseno', 'arte', 'pintura'], icon: getIcon('Palette') },
  { id: 'paint-brush', name: 'Pincel de Artista', category: 'design_media', tags: ['pincel', 'pintar', 'brocha', 'trazado'], icon: getIcon('Paintbrush') },
  { id: 'paint-bucket', name: 'Bote de Pintura / Relleno', category: 'design_media', tags: ['relleno', 'color de fondo', 'cubo pintura'], icon: getIcon('PaintBucket') },
  { id: 'pen-tool', name: 'Pluma Vectorial Bézier', category: 'design_media', tags: ['pluma', 'vector', 'bezier', 'illustrator', 'curva'], icon: getIcon('PenTool') },
  { id: 'pencil', name: 'Lápiz de Boceto', category: 'design_media', tags: ['lapiz', 'boceto', 'dibujo', 'escribir'], icon: getIcon('Pencil') },
  { id: 'eraser', name: 'Borrador', category: 'design_media', tags: ['borrador', 'goma', 'limpiar'], icon: getIcon('Eraser') },
  { id: 'image', name: 'Imagen / Fotografía', category: 'design_media', tags: ['imagen', 'foto', 'grafico', 'galeria'], icon: getIcon('Image') },
  { id: 'images', name: 'Galería de Imágenes', category: 'design_media', tags: ['galeria', 'fotos', 'album'], icon: getIcon('Images') },
  { id: 'camera', name: 'Cámara Fotográfica', category: 'design_media', tags: ['camara', 'fotografia', 'foto', 'captura'], icon: getIcon('Camera') },
  { id: 'film', name: 'Rollo de Película / Cine', category: 'design_media', tags: ['pelicula', 'cine', 'video', 'metraje'], icon: getIcon('Film') },
  { id: 'clapperboard', name: 'Claqueta de Cine', category: 'design_media', tags: ['claqueta', 'cine', 'grabacion', 'director'], icon: getIcon('Clapperboard') },
  { id: 'music', name: 'Nota Musical', category: 'design_media', tags: ['musica', 'cancion', 'nota', 'melodia'], icon: getIcon('Music') },
  { id: 'music-2', name: 'Doble Corchea', category: 'design_media', tags: ['musica', 'ritmo', 'sonido'], icon: getIcon('Music2') },
  { id: 'headphones', name: 'Auriculares', category: 'design_media', tags: ['auriculares', 'escuchar', 'musica', 'audio'], icon: getIcon('Headphones') },
  { id: 'speaker', name: 'Altavoz', category: 'design_media', tags: ['altavoz', 'sonido', 'parlante'], icon: getIcon('Speaker') },
  { id: 'volume-2', name: 'Volumen Alto', category: 'design_media', tags: ['volumen', 'sonido alto', 'audio'], icon: getIcon('Volume2') },
  { id: 'volume-x', name: 'Silencio / Mudo', category: 'design_media', tags: ['mute', 'silencio', 'sin sonido'], icon: getIcon('VolumeX') },
  { id: 'crop', name: 'Recortar Imagen', category: 'design_media', tags: ['recortar', 'encuadre', 'crop', 'tamano'], icon: getIcon('Crop') },
  { id: 'scissors', name: 'Tijeras / Cortar', category: 'design_media', tags: ['cortar', 'tijeras', 'edicion'], icon: getIcon('Scissors') },
  { id: 'eye', name: 'Ojo / Visibilidad', category: 'design_media', tags: ['ojo', 'ver', 'visible', 'mostrar', 'preview'], icon: getIcon('Eye') },
  { id: 'eye-off', name: 'Oculto / No Visible', category: 'design_media', tags: ['oculto', 'invisible', 'esconder'], icon: getIcon('EyeOff') },
  { id: 'pipette', name: 'Cuentagotas / Selector de Color', category: 'design_media', tags: ['cuentagotas', 'color', 'muestra'], icon: getIcon('Pipette') },
  { id: 'wand-2', name: 'Varita Mágica / Retoque', category: 'design_media', tags: ['varita magica', 'retoque', 'efectos', 'ia'], icon: getIcon('Wand2') },
  { id: 'sliders', name: 'Ajustes de Ecualizador / Sliders', category: 'design_media', tags: ['sliders', 'ecualizador', 'parametros', 'filtro'], icon: getIcon('Sliders') },
  { id: 'sliders-horizontal', name: 'Controles Horizontales', category: 'design_media', tags: ['controles', 'ajustes', 'niveles'], icon: getIcon('SlidersHorizontal') },
  { id: 'maximize', name: 'Pantalla Completa', category: 'design_media', tags: ['pantalla completa', 'maximizar', 'fullscreen'], icon: getIcon('Maximize') },
  { id: 'minimize', name: 'Minimizar', category: 'design_media', tags: ['minimizar', 'reducir'], icon: getIcon('Minimize') },
  { id: 'zoom-in', name: 'Acercar Zoom', category: 'design_media', tags: ['zoom', 'acercar', 'lupa'], icon: getIcon('ZoomIn') },
  { id: 'zoom-out', name: 'Alejar Zoom', category: 'design_media', tags: ['zoom out', 'alejar', 'reducir vista'], icon: getIcon('ZoomOut') },
  { id: 'shapes', name: 'Formas Geométricas', category: 'design_media', tags: ['figuras', 'formas', 'geometria', 'vector'], icon: getIcon('Shapes') },
  { id: 'sparkles', name: 'Efecto Destacado / Brillos', category: 'design_media', tags: ['brillo', 'magia', 'destacado', 'especial', 'sparkles'], icon: getIcon('Sparkles') },
  { id: 'contrast', name: 'Contraste', category: 'design_media', tags: ['contraste', 'brillo', 'luz'], icon: getIcon('Contrast') },

  // ==========================================
  // 6. NAVEGACIÓN, MAPAS & FLECHAS (45 icons)
  // ==========================================
  { id: 'compass', name: 'Brújula / Orientación', category: 'navigation_maps', tags: ['brujula', 'orientacion', 'norte', 'rumbo', 'compass'], icon: getIcon('Compass') },
  { id: 'map-pin', name: 'Marcador de Mapa / Ubicación', category: 'navigation_maps', tags: ['ubicacion', 'marcador', 'lugar', 'pin', 'mapa'], icon: getIcon('MapPin') },
  { id: 'map', name: 'Mapa Geográfico', category: 'navigation_maps', tags: ['mapa', 'cartografia', 'plano', 'guia'], icon: getIcon('Map') },
  { id: 'globe', name: 'Globo Terráqueo / Mundo', category: 'navigation_maps', tags: ['mundo', 'planeta', 'global', 'tierra', 'internacional'], icon: getIcon('Globe') },
  { id: 'globe-2', name: 'Red Global', category: 'navigation_maps', tags: ['red global', 'internacional', 'web'], icon: getIcon('Globe2') },
  { id: 'navigation', name: 'Flecha de Navegación GPS', category: 'navigation_maps', tags: ['gps', 'navegacion', 'rumbo', 'direccion'], icon: getIcon('Navigation') },
  { id: 'navigation-2', name: 'Guía de Ruta', category: 'navigation_maps', tags: ['ruta', 'camino', 'itinerario'], icon: getIcon('Navigation2') },
  { id: 'route', name: 'Trazado de Ruta', category: 'navigation_maps', tags: ['ruta', 'camino', 'trayectoria', 'puntos'], icon: getIcon('Route') },
  { id: 'signpost', name: 'Señal de Cruce', category: 'navigation_maps', tags: ['cartel', 'cruce', 'opciones', 'direccion'], icon: getIcon('Signpost') },
  { id: 'anchor', name: 'Ancla Marina', category: 'navigation_maps', tags: ['ancla', 'puerto', 'firme', 'mar'], icon: getIcon('Anchor') },
  { id: 'arrow-right', name: 'Flecha Derecha', category: 'navigation_maps', tags: ['flecha', 'derecha', 'siguiente', 'avance'], icon: getIcon('ArrowRight') },
  { id: 'arrow-left', name: 'Flecha Izquierda', category: 'navigation_maps', tags: ['flecha', 'izquierda', 'atras', 'regresar'], icon: getIcon('ArrowLeft') },
  { id: 'arrow-up', name: 'Flecha Arriba', category: 'navigation_maps', tags: ['flecha', 'arriba', 'subir'], icon: getIcon('ArrowUp') },
  { id: 'arrow-down', name: 'Flecha Abajo', category: 'navigation_maps', tags: ['flecha', 'abajo', 'bajar'], icon: getIcon('ArrowDown') },
  { id: 'arrow-up-right', name: 'Flecha Diagonal Arriba', category: 'navigation_maps', tags: ['diagonal', 'crecimiento', 'externo'], icon: getIcon('ArrowUpRight') },
  { id: 'arrow-down-right', name: 'Flecha Diagonal Abajo', category: 'navigation_maps', tags: ['diagonal', 'descenso'], icon: getIcon('ArrowDownRight') },
  { id: 'arrow-right-left', name: 'Doble Sentido / Intercambio', category: 'navigation_maps', tags: ['intercambio', 'bidireccional', 'canje'], icon: getIcon('ArrowRightLeft') },
  { id: 'arrow-up-down', name: 'Subir y Bajar', category: 'navigation_maps', tags: ['vertical', 'ordenar'], icon: getIcon('ArrowUpDown') },
  { id: 'corner-down-right', name: 'Giro a la Derecha', category: 'navigation_maps', tags: ['retorno', 'subrama', 'derivacion'], icon: getIcon('CornerDownRight') },
  { id: 'external-link', name: 'Enlace Externo', category: 'navigation_maps', tags: ['enlace', 'link', 'externo', 'abrir'], icon: getIcon('ExternalLink') },
  { id: 'link', name: 'Cadena / Hipervínculo', category: 'navigation_maps', tags: ['link', 'vinculo', 'cadena', 'url'], icon: getIcon('Link') },
  { id: 'link-2', name: 'Enlace Corto', category: 'navigation_maps', tags: ['enlace', 'hipervinculo'], icon: getIcon('Link2') },
  { id: 'unlink', name: 'Desvincular', category: 'navigation_maps', tags: ['desconectar', 'romper enlace'], icon: getIcon('Unlink') },
  { id: 'shuffle', name: 'Orden Aleatorio', category: 'navigation_maps', tags: ['aleatorio', 'mezclar', 'shuffle'], icon: getIcon('Shuffle') },
  { id: 'repeat', name: 'Repetir / Bucle', category: 'navigation_maps', tags: ['repetir', 'bucle', 'ciclo'], icon: getIcon('Repeat') },
  { id: 'plane', name: 'Avión / Vuelo', category: 'navigation_maps', tags: ['avion', 'viaje', 'vuelo', 'turismo', 'aereo'], icon: getIcon('Plane') },
  { id: 'car', name: 'Coche / Automóvil', category: 'navigation_maps', tags: ['coche', 'auto', 'vehiculo', 'viaje'], icon: getIcon('Car') },
  { id: 'train', name: 'Tren / Ferrocarril', category: 'navigation_maps', tags: ['tren', 'metro', 'via'], icon: getIcon('Train') },
  { id: 'ship', name: 'Barco / Crucero', category: 'navigation_maps', tags: ['barco', 'navio', 'mar'], icon: getIcon('Ship') },
  { id: 'bus', name: 'Autobús / Bus', category: 'navigation_maps', tags: ['bus', 'autobus', 'transporte publico'], icon: getIcon('Bus') },

  // ==========================================
  // 7. DOCUMENTOS & ARCHIVOS (45 icons)
  // ==========================================
  { id: 'folder', name: 'Carpeta', category: 'documents_files', tags: ['carpeta', 'directorio', 'folder'], icon: getIcon('Folder') },
  { id: 'folder-open', name: 'Carpeta Abierta', category: 'documents_files', tags: ['carpeta abierta', 'explorador'], icon: getIcon('FolderOpen') },
  { id: 'folder-plus', name: 'Crear Carpeta', category: 'documents_files', tags: ['nueva carpeta', 'anadir carpeta'], icon: getIcon('FolderPlus') },
  { id: 'folder-check', name: 'Carpeta Verificada', category: 'documents_files', tags: ['carpeta lista', 'aprobada'], icon: getIcon('FolderCheck') },
  { id: 'folder-git', name: 'Carpeta de Repositorio', category: 'documents_files', tags: ['repo', 'codigo', 'proyecto'], icon: getIcon('FolderGit') },
  { id: 'file', name: 'Archivo Genérico', category: 'documents_files', tags: ['archivo', 'fichero', 'documento'], icon: getIcon('File') },
  { id: 'file-text', name: 'Documento de Texto', category: 'documents_files', tags: ['texto', 'documento', 'doc', 'escrito', 'file-text'], icon: getIcon('FileText') },
  { id: 'file-code', name: 'Archivo de Código Fuente', category: 'documents_files', tags: ['codigo', 'script', 'ts', 'js', 'html'], icon: getIcon('FileCode') },
  { id: 'file-plus', name: 'Nuevo Documento', category: 'documents_files', tags: ['crear archivo', 'nuevo documento'], icon: getIcon('FilePlus') },
  { id: 'file-check', name: 'Documento Firmado / Listo', category: 'documents_files', tags: ['documento aprobado', 'valido'], icon: getIcon('FileCheck') },
  { id: 'file-spreadsheet', name: 'Hoja de Cálculo / Excel', category: 'documents_files', tags: ['excel', 'hoja de calculo', 'tabla', 'datos'], icon: getIcon('FileSpreadsheet') },
  { id: 'file-archive', name: 'Archivo Comprimido ZIP', category: 'documents_files', tags: ['zip', 'rar', 'comprimido'], icon: getIcon('FileArchive') },
  { id: 'archive', name: 'Caja de Archivo', category: 'documents_files', tags: ['archivo historico', 'guardar'], icon: getIcon('Archive') },
  { id: 'clipboard', name: 'Portapapeles', category: 'documents_files', tags: ['portapapeles', 'clipboard', 'copiar', 'pegar'], icon: getIcon('Clipboard') },
  { id: 'clipboard-check', name: 'Lista de Control / Checklist', category: 'documents_files', tags: ['checklist', 'auditoria', 'tareas listas'], icon: getIcon('ClipboardCheck') },
  { id: 'clipboard-list', name: 'Lista de Tareas', category: 'documents_files', tags: ['lista', 'tareas', 'inventario'], icon: getIcon('ClipboardList') },
  { id: 'book', name: 'Libro Cerrado', category: 'documents_files', tags: ['libro', 'lectura', 'manual', 'biblioteca'], icon: getIcon('Book') },
  { id: 'book-open', name: 'Libro Abierto', category: 'documents_files', tags: ['libro abierto', 'estudio', 'guia'], icon: getIcon('BookOpen') },
  { id: 'bookmark', name: 'Marcador de Página', category: 'documents_files', tags: ['marcador', 'favorito', 'bookmark', 'guardar'], icon: getIcon('Bookmark') },
  { id: 'calendar', name: 'Calendario Mensual', category: 'documents_files', tags: ['calendario', 'fecha', 'mes', 'agenda', 'calendar'], icon: getIcon('Calendar') },
  { id: 'calendar-days', name: 'Agenda de Días', category: 'documents_files', tags: ['dias', 'planificacion', 'citas'], icon: getIcon('CalendarDays') },
  { id: 'calendar-range', name: 'Periodo / Rango de Fechas', category: 'documents_files', tags: ['rango', 'periodo', 'duracion'], icon: getIcon('CalendarRange') },
  { id: 'copy', name: 'Copiar', category: 'documents_files', tags: ['copiar', 'duplicar'], icon: getIcon('Copy') },
  { id: 'save', name: 'Guardar en Disco', category: 'documents_files', tags: ['guardar', 'salvar', 'disco'], icon: getIcon('Save') },
  { id: 'download', name: 'Descargar Archivo', category: 'documents_files', tags: ['descargar', 'bajar', 'exportar'], icon: getIcon('Download') },
  { id: 'upload', name: 'Subir Archivo', category: 'documents_files', tags: ['subir', 'cargar', 'importar'], icon: getIcon('Upload') },
  { id: 'hard-drive-download', name: 'Copia de Seguridad', category: 'documents_files', tags: ['backup', 'respaldo'], icon: getIcon('HardDriveDownload') },

  // ==========================================
  // 8. EDUCACIÓN, CIENCIA & LÓGICA (45 icons)
  // ==========================================
  { id: 'graduation-cap', name: 'Birrete de Graduación', category: 'education_science', tags: ['educacion', 'graduacion', 'universidad', 'titulo', 'estudio'], icon: getIcon('GraduationCap') },
  { id: 'lightbulb', name: 'Bombilla / Idea Genial', category: 'education_science', tags: ['idea', 'bombilla', 'creatividad', 'innovacion', 'inspiracion', 'lightbulb'], icon: getIcon('Lightbulb') },
  { id: 'atom', name: 'Átomo / Física Cuántica', category: 'education_science', tags: ['atomo', 'fisica', 'ciencia', 'nuclear', 'investigacion'], icon: getIcon('Atom') },
  { id: 'brain', name: 'Cerebro / Inteligencia', category: 'education_science', tags: ['cerebro', 'inteligencia', 'mente', 'pensamiento', 'psicologia'], icon: getIcon('Brain') },
  { id: 'flask-conical', name: 'Matraz de Química', category: 'education_science', tags: ['quimica', 'laboratorio', 'experimento', 'matraz'], icon: getIcon('FlaskConical') },
  { id: 'flask-round', name: 'Frasco de Laboratorio', category: 'education_science', tags: ['quimica', 'formula', 'ciencia'], icon: getIcon('FlaskRound') },
  { id: 'microscope', name: 'Microscopio / Análisis', category: 'education_science', tags: ['microscopio', 'analisis', 'biologia', 'medico'], icon: getIcon('Microscope') },
  { id: 'dna', name: 'Cadena de ADN / Genética', category: 'education_science', tags: ['adn', 'genetica', 'biologia', 'vida'], icon: getIcon('Dna') },
  { id: 'telescope', name: 'Telescopio / Astronomía', category: 'education_science', tags: ['telescopio', 'estrellas', 'universo', 'espacio'], icon: getIcon('Telescope') },
  { id: 'rocket', name: 'Cohete / Lanzamiento', category: 'education_science', tags: ['cohete', 'lanzamiento', 'startup', 'espacio', 'futuro'], icon: getIcon('Rocket') },
  { id: 'puzzle', name: 'Pieza de Rompecabezas', category: 'education_science', tags: ['puzzle', 'rompecabezas', 'logica', 'encaje', 'solucion'], icon: getIcon('Puzzle') },
  { id: 'glasses', name: 'Gafas de Lectura', category: 'education_science', tags: ['gafas', 'lectura', 'estudio', 'vision'], icon: getIcon('Glasses') },
  { id: 'library', name: 'Biblioteca', category: 'education_science', tags: ['biblioteca', 'conocimiento', 'academico'], icon: getIcon('Library') },
  { id: 'school', name: 'Escuela / Colegio', category: 'education_science', tags: ['escuela', 'colegio', 'educacion'], icon: getIcon('School') },
  { id: 'scroll', name: 'Pergamino Antiguo', category: 'education_science', tags: ['pergamino', 'historia', 'documento antiguo'], icon: getIcon('Scroll') },
  { id: 'magnet', name: 'Imán / Atracción', category: 'education_science', tags: ['iman', 'magnetismo', 'atraccion', 'fisica'], icon: getIcon('Magnet') },
  { id: 'ruler', name: 'Regla de Medir', category: 'education_science', tags: ['regla', 'medida', 'precision', 'geometria'], icon: getIcon('Ruler') },
  { id: 'orbit', name: 'Órbita Planetaria', category: 'education_science', tags: ['orbita', 'sistema', 'planetas'], icon: getIcon('Orbit') },
  { id: 'binary-code', name: 'Lógica Matemática', category: 'education_science', tags: ['matematicas', 'algebra', 'calculo'], icon: getIcon('Binary') },

  // ==========================================
  // 9. NATURALEZA, CLIMA & ENERGÍA (45 icons)
  // ==========================================
  { id: 'sun', name: 'Sol / Despejado', category: 'nature_weather', tags: ['sol', 'dia', 'luz', 'calor', 'verano'], icon: getIcon('Sun') },
  { id: 'sun-medium', name: 'Sol Radiante', category: 'nature_weather', tags: ['sol brillante', 'energia solar'], icon: getIcon('SunMedium') },
  { id: 'moon', name: 'Luna / Noche', category: 'nature_weather', tags: ['luna', 'noche', 'oscuro', 'modo oscuro'], icon: getIcon('Moon') },
  { id: 'cloud-sun', name: 'Parcialmente Nublado', category: 'nature_weather', tags: ['sol y nubes', 'clima templado'], icon: getIcon('CloudSun') },
  { id: 'cloud-rain', name: 'Lluvia / Precipitaciones', category: 'nature_weather', tags: ['lluvia', 'tormenta', 'agua', 'tiempo'], icon: getIcon('CloudRain') },
  { id: 'cloud-lightning', name: 'Tormenta Eléctrica', category: 'nature_weather', tags: ['tormenta', 'trueno', 'rayos'], icon: getIcon('CloudLightning') },
  { id: 'cloud-snow', name: 'Nieve / Nevada', category: 'nature_weather', tags: ['nieve', 'invierno', 'frio'], icon: getIcon('CloudSnow') },
  { id: 'snowflake', name: 'Copo de Nieve', category: 'nature_weather', tags: ['copo', 'nieve', 'congelado', 'helado'], icon: getIcon('Snowflake') },
  { id: 'wind', name: 'Viento / Brisa', category: 'nature_weather', tags: ['viento', 'aire', 'brisa', 'flujo'], icon: getIcon('Wind') },
  { id: 'tornado', name: 'Tornado / Huracán', category: 'nature_weather', tags: ['tornado', 'huracan', 'vortice'], icon: getIcon('Tornado') },
  { id: 'umbrella', name: 'Paraguas', category: 'nature_weather', tags: ['paraguas', 'proteccion', 'lluvia'], icon: getIcon('Umbrella') },
  { id: 'droplet', name: 'Gota de Agua', category: 'nature_weather', tags: ['gota', 'agua', 'liquido', 'hidratacion'], icon: getIcon('Droplet') },
  { id: 'waves', name: 'Olas del Mar', category: 'nature_weather', tags: ['olas', 'mar', 'oceano', 'agua'], icon: getIcon('Waves') },
  { id: 'thermometer', name: 'Termómetro / Temperatura', category: 'nature_weather', tags: ['temperatura', 'termometro', 'grados'], icon: getIcon('Thermometer') },
  { id: 'thermometer-sun', name: 'Calor Extremo', category: 'nature_weather', tags: ['ola de calor', 'verano ardiente'], icon: getIcon('ThermometerSun') },
  { id: 'thermometer-snowflake', name: 'Frío Extremo', category: 'nature_weather', tags: ['helada', 'bajo cero'], icon: getIcon('ThermometerSnowflake') },
  { id: 'tree-pine', name: 'Pino / Bosque', category: 'nature_weather', tags: ['pino', 'bosque', 'naturaleza', 'arbol'], icon: getIcon('TreePine') },
  { id: 'tree-deciduous', name: 'Árbol Frondoso', category: 'nature_weather', tags: ['arbol', 'ecologia', 'medio ambiente'], icon: getIcon('TreeDeciduous') },
  { id: 'leaf', name: 'Hoja / Sostenibilidad', category: 'nature_weather', tags: ['hoja', 'verde', 'eco', 'sostenible', 'bio'], icon: getIcon('Leaf') },
  { id: 'flower', name: 'Flor / Primavera', category: 'nature_weather', tags: ['flor', 'jardin', 'primavera', 'botanica'], icon: getIcon('Flower') },
  { id: 'flower-2', name: 'Margarita', category: 'nature_weather', tags: ['margarita', 'planta'], icon: getIcon('Flower2') },
  { id: 'sprout', name: 'Brote / Germinación', category: 'nature_weather', tags: ['brote', 'crecimiento', 'semilla', 'inicio'], icon: getIcon('Sprout') },
  { id: 'mountain', name: 'Montaña / Cumbre', category: 'nature_weather', tags: ['montana', 'cumbre', 'cima', 'senderismo'], icon: getIcon('Mountain') },
  { id: 'mountain-snow', name: 'Montaña Nevada', category: 'nature_weather', tags: ['cordillera', 'alpes', 'nieve'], icon: getIcon('MountainSnow') },
  { id: 'sunrise', name: 'Amanecer', category: 'nature_weather', tags: ['amanecer', 'salida del sol', 'manana'], icon: getIcon('Sunrise') },
  { id: 'sunset', name: 'Puesta de Sol', category: 'nature_weather', tags: ['atardecer', 'ocaso'], icon: getIcon('Sunset') },

  // ==========================================
  // 10. HERRAMIENTAS, SEGURIDAD & SISTEMA (45 icons)
  // ==========================================
  { id: 'shield', name: 'Escudo de Protección', category: 'tools_security', tags: ['escudo', 'seguridad', 'proteccion', 'defensa'], icon: getIcon('Shield') },
  { id: 'shield-check', name: 'Seguridad Verificada', category: 'tools_security', tags: ['seguro', 'antivirus', 'firewall', 'protegido', 'shield-check'], icon: getIcon('ShieldCheck') },
  { id: 'lock', name: 'Candado Cerrado', category: 'tools_security', tags: ['candado', 'bloqueado', 'privado', 'contrasena'], icon: getIcon('Lock') },
  { id: 'unlock', name: 'Candado Abierto', category: 'tools_security', tags: ['desbloqueado', 'abierto', 'publico'], icon: getIcon('Unlock') },
  { id: 'key', name: 'Llave de Acceso', category: 'tools_security', tags: ['llave', 'acceso', 'autenticacion', 'token'], icon: getIcon('Key') },
  { id: 'key-round', name: 'Llave Redonda', category: 'tools_security', tags: ['llave maestra', 'permiso'], icon: getIcon('KeyRound') },
  { id: 'settings', name: 'Engranaje de Ajustes', category: 'tools_security', tags: ['ajustes', 'configuracion', 'opciones', 'preferencias'], icon: getIcon('Settings') },
  { id: 'settings-2', name: 'Panel de Configuración', category: 'tools_security', tags: ['configuracion avanzada', 'control'], icon: getIcon('Settings2') },
  { id: 'wrench', name: 'Llave Inglesa / Mantenimiento', category: 'tools_security', tags: ['herramienta', 'mantenimiento', 'reparacion', 'taller'], icon: getIcon('Wrench') },
  { id: 'hammer', name: 'Martillo', category: 'tools_security', tags: ['martillo', 'construir', 'herramienta'], icon: getIcon('Hammer') },
  { id: 'axe', name: 'Hacha', category: 'tools_security', tags: ['hacha', 'corte', 'madera'], icon: getIcon('Axe') },
  { id: 'construction', name: 'En Construcción', category: 'tools_security', tags: ['obras', 'construccion', 'en desarrollo'], icon: getIcon('Construction') },
  { id: 'trash', name: 'Papelera de Reciclaje', category: 'tools_security', tags: ['papelera', 'borrar', 'eliminar', 'basura'], icon: getIcon('Trash') },
  { id: 'trash-2', name: 'Eliminar Elemento', category: 'tools_security', tags: ['eliminar', 'suprimir'], icon: getIcon('Trash2') },
  { id: 'filter', name: 'Filtro / Embudo', category: 'tools_security', tags: ['filtro', 'embudo', 'filtrar datos', 'buscar'], icon: getIcon('Filter') },
  { id: 'search', name: 'Lupa de Búsqueda', category: 'tools_security', tags: ['buscar', 'lupa', 'explorar', 'encontrar'], icon: getIcon('Search') },
  { id: 'life-buoy', name: 'Salvavidas / Soporte 24/7', category: 'tools_security', tags: ['soporte', 'ayuda', 'salvavidas', 'asistencia'], icon: getIcon('LifeBuoy') },
  { id: 'siren', name: 'Sirena de Emergencia', category: 'tools_security', tags: ['sirena', 'emergencia', 'policia', 'alerta maxima'], icon: getIcon('Siren') },
  { id: 'cctv', name: 'Cámara de Seguridad', category: 'tools_security', tags: ['camara vigilancia', 'cctv', 'seguridad'], icon: getIcon('Cctv') },
  { id: 'gauge', name: 'Velocímetro / Medidor', category: 'tools_security', tags: ['velocidad', 'rendimiento', 'medidor', 'kpi'], icon: getIcon('Gauge') },

  // ==========================================
  // 11. SALUD, DEPORTES & VIDA (45 icons)
  // ==========================================
  { id: 'activity', name: 'Pulso Cardíaco / Actividad', category: 'health_sports', tags: ['pulso', 'cardiograma', 'salud', 'ritmo', 'actividad'], icon: getIcon('Activity') },
  { id: 'heart-pulse', name: 'Corazón con Latido', category: 'health_sports', tags: ['latido', 'cardiologia', 'salud'], icon: getIcon('HeartPulse') },
  { id: 'pill', name: 'Píldora / Medicamento', category: 'health_sports', tags: ['pastilla', 'medicamento', 'farmacia', 'remedio'], icon: getIcon('Pill') },
  { id: 'cross', name: 'Cruz Médica / Primeros Auxilios', category: 'health_sports', tags: ['cruz roja', 'hospital', 'urgencias'], icon: getIcon('Cross') },
  { id: 'stethoscope', name: 'Estetoscopio Médico', category: 'health_sports', tags: ['medico', 'doctor', 'consulta'], icon: getIcon('Stethoscope') },
  { id: 'syringe', name: 'Jeringuilla / Vacuna', category: 'health_sports', tags: ['vacuna', 'inyeccion', 'inmunidad'], icon: getIcon('Syringe') },
  { id: 'dumbbell', name: 'Mancuerna / Gimnasio', category: 'health_sports', tags: ['gimnasio', 'fitness', 'pesas', 'ejercicio'], icon: getIcon('Dumbbell') },
  { id: 'bike', name: 'Bicicleta / Ciclismo', category: 'health_sports', tags: ['bicicleta', 'ciclismo', 'deporte', 'pedalear'], icon: getIcon('Bike') },
  { id: 'footprints', name: 'Huellas / Pasos', category: 'health_sports', tags: ['pasos', 'caminar', 'huellas', 'rastro'], icon: getIcon('Footprints') },
  { id: 'coffee', name: 'Taza de Café / Pausa', category: 'health_sports', tags: ['cafe', 'desayuno', 'descanso', 'pausa', 'energia'], icon: getIcon('Coffee') },
  { id: 'cup-soda', name: 'Bebida Refrescante', category: 'health_sports', tags: ['refresco', 'bebida', 'soda'], icon: getIcon('CupSoda') },
  { id: 'wine', name: 'Copa de Vino / Brindis', category: 'health_sports', tags: ['vino', 'brindis', 'celebracion'], icon: getIcon('Wine') },
  { id: 'beer', name: 'Cerveza', category: 'health_sports', tags: ['cerveza', 'afterwork', 'fiesta'], icon: getIcon('Beer') },
  { id: 'apple', name: 'Manzana / Dieta Saludable', category: 'health_sports', tags: ['manzana', 'fruta', 'nutricion', 'saludable'], icon: getIcon('Apple') },
  { id: 'cake', name: 'Pastel / Cumpleaños', category: 'health_sports', tags: ['tarta', 'pastel', 'cumpleanos', 'fiesta'], icon: getIcon('Cake') },
  { id: 'gift', name: 'Caja de Regalo', category: 'health_sports', tags: ['regalo', 'obsequio', 'sorpresa', 'presente'], icon: getIcon('Gift') },
  { id: 'party-popper', name: 'Cañón de Confeti / Celebración', category: 'health_sports', tags: ['fiesta', 'confeti', 'celebracion', 'exito'], icon: getIcon('PartyPopper') },
  { id: 'bed', name: 'Cama / Descanso', category: 'health_sports', tags: ['cama', 'dormir', 'hotel', 'descanso'], icon: getIcon('Bed') },

  // ==========================================
  // 12. SÍMBOLOS, FORMAS & EMOCIONES (45 icons)
  // ==========================================
  { id: 'smile', name: 'Carita Sonriente / Feliz', category: 'emojis_symbols', tags: ['feliz', 'sonrisa', 'alegria', 'positivo', 'smile'], icon: getIcon('Smile') },
  { id: 'frown', name: 'Carita Triste / Descontento', category: 'emojis_symbols', tags: ['triste', 'disgusto', 'negativo', 'frown'], icon: getIcon('Frown') },
  { id: 'meh', name: 'Carita Neutral', category: 'emojis_symbols', tags: ['neutral', 'indiferente', 'regular'], icon: getIcon('Meh') },
  { id: 'laugh', name: 'Risa / Diversión', category: 'emojis_symbols', tags: ['risa', 'carcajada', 'humor'], icon: getIcon('Laugh') },
  { id: 'star', name: 'Estrella Dorada / Favorito', category: 'emojis_symbols', tags: ['estrella', 'favorito', 'calificacion', 'top', 'star'], icon: getIcon('Star') },
  { id: 'star-half', name: 'Media Estrella', category: 'emojis_symbols', tags: ['media estrella', 'puntuacion'], icon: getIcon('StarHalf') },
  { id: 'crown', name: 'Corona de Rey / Premium', category: 'emojis_symbols', tags: ['corona', 'vip', 'premium', 'lujo', 'rey'], icon: getIcon('Crown') },
  { id: 'gem', name: 'Diamante / Joya', category: 'emojis_symbols', tags: ['diamante', 'gema', 'valioso', 'joya'], icon: getIcon('Gem') },
  { id: 'diamond', name: 'Rombo / Diamante', category: 'emojis_symbols', tags: ['rombo', 'naipe', 'figura'], icon: getIcon('Diamond') },
  { id: 'circle', name: 'Círculo Geométrico', category: 'emojis_symbols', tags: ['circulo', 'redondo'], icon: getIcon('Circle') },
  { id: 'triangle', name: 'Triángulo', category: 'emojis_symbols', tags: ['triangulo', 'forma'], icon: getIcon('Triangle') },
  { id: 'hexagon', name: 'Hexágono', category: 'emojis_symbols', tags: ['hexagono', 'panal'], icon: getIcon('Hexagon') },
  { id: 'octagon', name: 'Octágono', category: 'emojis_symbols', tags: ['octagono', 'forma'], icon: getIcon('Octagon') },
  { id: 'pentagon', name: 'Pentágono', category: 'emojis_symbols', tags: ['pentagono', 'forma'], icon: getIcon('Pentagon') },
  { id: 'clover', name: 'Trébol de 4 Hojas / Suerte', category: 'emojis_symbols', tags: ['trebol', 'suerte', 'fortuna'], icon: getIcon('Clover') },
  { id: 'skull', name: 'Calavera / Peligro Mortal', category: 'emojis_symbols', tags: ['calavera', 'muerte', 'veneno', 'critico'], icon: getIcon('Skull') },
  { id: 'ghost', name: 'Fantasma', category: 'emojis_symbols', tags: ['fantasma', 'misterio', 'halloween'], icon: getIcon('Ghost') },
  { id: 'infinity', name: 'Infinito', category: 'emojis_symbols', tags: ['infinito', 'eterno', 'sin fin', 'loop'], icon: getIcon('Infinity') },
  { id: 'sparkles-alt', name: 'Destellos Mágicos', category: 'emojis_symbols', tags: ['estrellas', 'magico', 'especial'], icon: getIcon('Sparkles') },
];

// Merge Lucide curated pack + 3,450+ Simple Icons catalog
export const VECTOR_ICON_PACK: VectorIconItem[] = [
  ...LUCIDE_CURATED_PACK,
  ...(ALL_SIMPLE_ICONS as VectorIconItem[]),
];

export const TOTAL_VECTOR_ICONS_COUNT = VECTOR_ICON_PACK.length;

// Fast lookup map by ID and aliases
const ICONS_BY_ID = new Map<string, VectorIconItem>();
VECTOR_ICON_PACK.forEach(item => {
  ICONS_BY_ID.set(item.id, item);
  ICONS_BY_ID.set(item.id.toLowerCase(), item);
});

// Also register slugs for simple icons
ALL_SIMPLE_ICONS.forEach(item => {
  ICONS_BY_ID.set(item.slug, item as VectorIconItem);
  ICONS_BY_ID.set(`si_${item.slug}`, item as VectorIconItem);
  ICONS_BY_ID.set(`si-${item.slug}`, item as VectorIconItem);
});

/**
 * Searches vector icons by keyword (in name, ID or tags) and optional category.
 */
export function searchVectorIcons(query: string, category?: VectorIconCategory | 'all'): VectorIconItem[] {
  const cleanQuery = query.toLowerCase().trim();
  
  return VECTOR_ICON_PACK.filter(item => {
    if (category && category !== 'all') {
      if (category === 'brands_all') {
        // Any brand/simple-icon
        if (!item.category.startsWith('brands_')) return false;
      } else if (item.category !== category) {
        return false;
      }
    }
    if (!cleanQuery) return true;

    if (item.id.toLowerCase().includes(cleanQuery)) return true;
    if (item.name.toLowerCase().includes(cleanQuery)) return true;
    if (item.tags.some(t => t.toLowerCase().includes(cleanQuery))) return true;
    return false;
  });
}

/**
 * Gets a specific vector icon component or fallback.
 */
export function getVectorIconItem(iconId: string): VectorIconItem | undefined {
  if (!iconId) return undefined;
  return ICONS_BY_ID.get(iconId) || ICONS_BY_ID.get(iconId.toLowerCase()) || SIMPLE_ICONS_BY_ID.get(iconId);
}

