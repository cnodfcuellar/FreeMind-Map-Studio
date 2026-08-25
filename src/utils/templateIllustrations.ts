// ============================================================================
// LIBRERÍA DE ILUSTRACIONES SVG PARA MAPAS Y PLANTILLAS (32 Vectores Temáticos)
// Formateados como Data URIs SVG universales para usar en node.image, node.imageShape, etc.
// ============================================================================

const toSvgDataUri = (svgString: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim().replace(/\s+/g, ' '))}`;
};

export const TEMPLATE_SVGS = {
  // 1. Inteligencia Artificial & Redes Neuronales
  brainAi: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="g-ai" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#8b5cf6"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="#eff6ff"/>
      <circle cx="60" cy="60" r="38" fill="url(#g-ai)" opacity="0.15"/>
      <path d="M42 42 C34 48 34 62 42 70 C42 78 52 84 60 84 C68 84 78 78 78 70 C86 62 86 48 78 42 C76 34 66 32 60 32 C54 32 44 34 42 42 Z" fill="url(#g-ai)"/>
      <circle cx="50" cy="50" r="3.5" fill="#ffffff"/>
      <circle cx="70" cy="50" r="3.5" fill="#ffffff"/>
      <circle cx="60" cy="64" r="4" fill="#ffffff"/>
      <line x1="50" y1="50" x2="60" y2="64" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <line x1="70" y1="50" x2="60" y2="64" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <line x1="50" y1="50" x2="70" y2="50" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2 2"/>
      <circle cx="34" cy="56" r="3" fill="#3b82f6"/>
      <circle cx="86" cy="56" r="3" fill="#8b5cf6"/>
      <line x1="34" y1="56" x2="44" y2="56" stroke="#3b82f6" stroke-width="1.5"/>
      <line x1="86" y1="56" x2="76" y2="56" stroke="#8b5cf6" stroke-width="1.5"/>
    </svg>
  `),

  // 2. Estrategia & Ajedrez
  strategyChess: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="g-chess" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="#fffbeb"/>
      <path d="M56 26 L64 26 L64 34 L72 34 L72 42 L64 42 L64 50 L56 50 L56 42 L48 42 L48 34 L56 34 Z" fill="url(#g-chess)"/>
      <path d="M48 54 C48 54 44 70 42 86 L78 86 C76 70 72 54 72 54 Z" fill="url(#g-chess)"/>
      <rect x="36" y="86" width="48" height="8" rx="3" fill="#b45309"/>
      <circle cx="60" cy="66" r="4" fill="#ffffff" opacity="0.8"/>
    </svg>
  `),

  // 3. Infraestructura Cloud & Servidores
  cloudInfra: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="g-cloud" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="#f0f9ff"/>
      <path d="M42 62 C34 62 28 68 28 76 C28 84 34 90 42 90 L80 90 C88 90 94 84 94 76 C94 69 89 63 82 62 C81 50 71 42 60 42 C51 42 43 48 42 62 Z" fill="url(#g-cloud)"/>
      <rect x="44" y="60" width="32" height="6" rx="2" fill="#ffffff" opacity="0.9"/>
      <rect x="44" y="70" width="32" height="6" rx="2" fill="#ffffff" opacity="0.9"/>
      <circle cx="48" cy="63" r="1.5" fill="#0284c7"/>
      <circle cx="48" cy="73" r="1.5" fill="#0284c7"/>
    </svg>
  `),

  // 4. Despegue Cohete / Startup Launch
  rocketLaunch: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="g-rkt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ec4899"/>
          <stop offset="100%" stop-color="#f43f5e"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="#fff1f2"/>
      <path d="M60 22 C60 22 78 36 78 64 L42 64 C42 36 60 22 60 22 Z" fill="url(#g-rkt)"/>
      <circle cx="60" cy="46" r="6" fill="#ffffff"/>
      <circle cx="60" cy="46" r="3" fill="#f43f5e"/>
      <path d="M42 60 L32 72 L44 70 Z" fill="#e11d48"/>
      <path d="M78 60 L88 72 L76 70 Z" fill="#e11d48"/>
      <path d="M52 64 L60 84 L68 64 Z" fill="#fbbf24"/>
      <path d="M56 64 L60 76 L64 64 Z" fill="#fef08a"/>
    </svg>
  `),

  // 5. Código / Desarrollo de Software
  codeDev: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#0f172a"/>
      <rect x="24" y="28" width="72" height="64" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <circle cx="34" cy="38" r="2.5" fill="#ef4444"/>
      <circle cx="42" cy="38" r="2.5" fill="#f59e0b"/>
      <circle cx="50" cy="38" r="2.5" fill="#10b981"/>
      <path d="M44 56 L36 64 L44 72" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M76 56 L84 64 L76 72" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="64" y1="52" x2="56" y2="76" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `),

  // 6. Diana de Marketing & Conversión
  marketingTarget: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#fff7ed"/>
      <circle cx="60" cy="60" r="38" fill="#f97316"/>
      <circle cx="60" cy="60" r="28" fill="#ffffff"/>
      <circle cx="60" cy="60" r="18" fill="#ea580c"/>
      <circle cx="60" cy="60" r="8" fill="#ffffff"/>
      <circle cx="60" cy="60" r="4" fill="#c2410c"/>
      <path d="M60 22 L60 30 M60 90 L60 98 M22 60 L30 60 M90 60 L98 60" stroke="#f97316" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),

  // 7. Crecimiento Financiero & Métricas
  financeGrowth: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="g-fin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="#ecfdf5"/>
      <rect x="30" y="68" width="12" height="24" rx="3" fill="#a7f3d0"/>
      <rect x="48" y="54" width="12" height="38" rx="3" fill="#6ee7b7"/>
      <rect x="66" y="42" width="12" height="50" rx="3" fill="#34d399"/>
      <rect x="84" y="30" width="12" height="62" rx="3" fill="url(#g-fin)"/>
      <path d="M32 60 L50 44 L68 34 L88 20" fill="none" stroke="#047857" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="94,20 84,20 90,26" fill="#047857"/>
    </svg>
  `),

  // 8. Diseño UI/UX & Paleta
  designPalette: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#fdf4ff"/>
      <path d="M60 26 C40 26 26 40 26 60 C26 78 40 92 56 92 C62 92 66 88 66 82 C66 79 64 77 64 74 C64 70 68 66 72 66 L78 66 C88 66 96 58 96 48 C96 36 80 26 60 26 Z" fill="#d946ef"/>
      <circle cx="44" cy="46" r="4.5" fill="#facc15"/>
      <circle cx="62" cy="40" r="4.5" fill="#38bdf8"/>
      <circle cx="78" cy="48" r="4.5" fill="#4ade80"/>
      <circle cx="46" cy="66" r="4.5" fill="#f43f5e"/>
    </svg>
  `),

  // 9. Ciberseguridad & Escudo
  securityShield: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="g-sec" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="100%" stop-color="#4338ca"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="#eef2ff"/>
      <path d="M60 24 L86 36 C86 64 74 84 60 94 C46 84 34 64 34 36 Z" fill="url(#g-sec)"/>
      <rect x="50" y="54" width="20" height="18" rx="4" fill="#ffffff"/>
      <path d="M54 54 L54 48 C54 44.7 56.7 42 60 42 C63.3 42 66 44.7 66 48 L66 54" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="60" cy="62" r="2.5" fill="#4338ca"/>
    </svg>
  `),

  // 10. Salud & Bienestar
  healthHeart: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#fff1f2"/>
      <path d="M60 88 C60 88 28 66 28 46 C28 34 38 26 50 26 C56 26 60 30 60 30 C60 30 64 26 70 26 C82 26 92 34 92 46 C92 66 60 88 60 88 Z" fill="#f43f5e"/>
      <path d="M34 52 L48 52 L54 40 L62 66 L68 48 L74 54 L86 54" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `),

  // 11. Educación & Graduación
  educationCap: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#eff6ff"/>
      <polygon points="60,30 96,46 60,62 24,46" fill="#2563eb"/>
      <path d="M38 53 L38 72 C38 80 50 86 60 86 C70 86 82 80 82 72 L82 53" fill="none" stroke="#1d4ed8" stroke-width="4" stroke-linecap="round"/>
      <line x1="88" y1="49" x2="88" y2="76" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="88" cy="78" r="3" fill="#f59e0b"/>
    </svg>
  `),

  // 12. Tablero Ágil Kanban
  agileKanban: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#f0fdf4"/>
      <rect x="24" y="28" width="20" height="64" rx="4" fill="#bbf7d0"/>
      <rect x="50" y="28" width="20" height="64" rx="4" fill="#86efac"/>
      <rect x="76" y="28" width="20" height="64" rx="4" fill="#4ade80"/>
      <rect x="28" y="34" width="12" height="16" rx="2" fill="#ffffff"/>
      <rect x="28" y="54" width="12" height="12" rx="2" fill="#ffffff"/>
      <rect x="54" y="34" width="12" height="24" rx="2" fill="#ffffff"/>
      <rect x="80" y="34" width="12" height="18" rx="2" fill="#ffffff"/>
      <rect x="80" y="56" width="12" height="14" rx="2" fill="#ffffff"/>
    </svg>
  `),

  // 13. Mobile App & Smartphone
  mobileApp: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#f5f3ff"/>
      <rect x="38" y="22" width="44" height="76" rx="10" fill="#7c3aed" stroke="#6d28d9" stroke-width="2"/>
      <rect x="42" y="30" width="36" height="56" rx="4" fill="#ffffff"/>
      <circle cx="60" cy="26" r="1.5" fill="#ddd6fe"/>
      <rect x="46" y="36" width="28" height="12" rx="3" fill="#a78bfa"/>
      <rect x="46" y="52" width="12" height="12" rx="3" fill="#c4b5fd"/>
      <rect x="62" y="52" width="12" height="12" rx="3" fill="#c4b5fd"/>
      <rect x="46" y="68" width="28" height="10" rx="3" fill="#ede9fe"/>
    </svg>
  `),

  // 14. Red Global / Conexiones
  globalNetwork: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#ecfeff"/>
      <circle cx="60" cy="60" r="36" fill="#0891b2"/>
      <ellipse cx="60" cy="60" rx="18" ry="36" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="3 3"/>
      <line x1="24" y1="60" x2="96" y2="60" stroke="#ffffff" stroke-width="2"/>
      <line x1="30" y1="44" x2="90" y2="44" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
      <line x1="30" y1="76" x2="90" y2="76" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
      <circle cx="60" cy="44" r="3" fill="#facc15"/>
      <circle cx="42" cy="60" r="3" fill="#facc15"/>
      <circle cx="78" cy="76" r="3" fill="#facc15"/>
    </svg>
  `),

  // 15. Bombilla de Ideas & Innovación
  ideaBulb: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#fefce8"/>
      <path d="M60 26 C46 26 36 37 36 51 C36 60 42 67 46 72 L46 80 L74 80 L74 72 C78 67 84 60 84 51 C84 37 74 26 60 26 Z" fill="#eab308"/>
      <rect x="48" y="82" width="24" height="4" rx="2" fill="#ca8a04"/>
      <rect x="52" y="88" width="16" height="4" rx="2" fill="#a16207"/>
      <path d="M54 50 L60 42 L66 50" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="60" cy="56" r="3" fill="#ffffff"/>
    </svg>
  `),

  // 16. Matriz DAFO / SWOT
  swotMatrix: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#f8fafc"/>
      <rect x="24" y="24" width="34" height="34" rx="8" fill="#3b82f6"/>
      <text x="41" y="46" font-family="sans-serif" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">F</text>
      <rect x="62" y="24" width="34" height="34" rx="8" fill="#10b981"/>
      <text x="79" y="46" font-family="sans-serif" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">O</text>
      <rect x="24" y="62" width="34" height="34" rx="8" fill="#f59e0b"/>
      <text x="41" y="84" font-family="sans-serif" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">D</text>
      <rect x="62" y="62" width="34" height="34" rx="8" fill="#ef4444"/>
      <text x="79" y="84" font-family="sans-serif" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">A</text>
    </svg>
  `),

  // 17. Base de Datos / Big Data
  databaseCluster: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#f1f5f9"/>
      <ellipse cx="60" cy="36" rx="28" ry="10" fill="#64748b"/>
      <path d="M32 36 L32 54 C32 60 44 64 60 64 C76 64 88 60 88 54 L88 36" fill="#475569"/>
      <ellipse cx="60" cy="54" rx="28" ry="8" fill="#64748b" opacity="0.6"/>
      <path d="M32 54 L32 72 C32 78 44 82 60 82 C76 82 88 78 88 72 L88 54" fill="#334155"/>
      <ellipse cx="60" cy="72" rx="28" ry="8" fill="#64748b" opacity="0.6"/>
      <path d="M32 72 L32 90 C32 96 44 100 60 100 C76 100 88 96 88 90 L88 72" fill="#1e293b"/>
      <circle cx="44" cy="46" r="2" fill="#38bdf8"/>
      <circle cx="44" cy="64" r="2" fill="#38bdf8"/>
      <circle cx="44" cy="82" r="2" fill="#38bdf8"/>
    </svg>
  `),

  // 18. Colaboración en Equipo / Team
  teamCollab: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#fdf2f8"/>
      <circle cx="60" cy="42" r="12" fill="#ec4899"/>
      <path d="M42 78 C42 66 50 62 60 62 C70 62 78 66 78 78 Z" fill="#db2777"/>
      <circle cx="36" cy="48" r="9" fill="#f472b6"/>
      <path d="M22 80 C22 70 28 66 36 66 C40 66 44 68 46 72 C42 75 40 80 40 86 L22 86 Z" fill="#e11d48"/>
      <circle cx="84" cy="48" r="9" fill="#f472b6"/>
      <path d="M98 80 C98 70 92 66 84 66 C80 66 76 68 74 72 C78 75 80 80 80 86 L98 86 Z" fill="#e11d48"/>
    </svg>
  `),

  // 19. Automatización de Flujos / Workflow
  workflowGear: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#f0fdfa"/>
      <circle cx="48" cy="50" r="18" fill="#0d9488"/>
      <circle cx="48" cy="50" r="8" fill="#f0fdfa"/>
      <circle cx="76" cy="72" r="14" fill="#14b8a6"/>
      <circle cx="76" cy="72" r="6" fill="#f0fdfa"/>
      <path d="M48 24 L56 34 M22 50 L32 50 M48 76 L40 66" stroke="#0d9488" stroke-width="3" stroke-linecap="round"/>
      <path d="M76 52 L82 60 M96 72 L86 72" stroke="#14b8a6" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),

  // 20. Customer Journey & Estrellas
  customerJourney: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#fef3c7"/>
      <path d="M28 76 Q 44 36 60 60 T 92 44" fill="none" stroke="#d97706" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="28" cy="76" r="6" fill="#f59e0b"/>
      <circle cx="60" cy="60" r="6" fill="#f59e0b"/>
      <circle cx="92" cy="44" r="8" fill="#b45309"/>
      <polygon points="92,38 94,42 98,43 95,46 96,50 92,48 88,50 89,46 86,43 90,42" fill="#fef08a"/>
    </svg>
  `),

  // 21. E-Commerce / Tienda Online
  ecommerceCart: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#ecfeff"/>
      <path d="M26 34 L36 34 L48 70 L82 70 L92 44 L40 44" fill="none" stroke="#0891b2" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="84" r="6" fill="#0e7490"/>
      <circle cx="80" cy="84" r="6" fill="#0e7490"/>
      <rect x="52" y="24" width="22" height="14" rx="3" fill="#06b6d4"/>
      <text x="63" y="34" font-family="sans-serif" font-weight="bold" font-size="9" fill="#ffffff" text-anchor="middle">$</text>
    </svg>
  `),

  // 22. Trofeo / Gamificación
  gamificationTrophy: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#fef9c3"/>
      <path d="M38 32 L82 32 L74 62 C74 72 64 78 60 78 C56 78 46 72 46 62 Z" fill="#eab308"/>
      <path d="M38 38 L26 42 C26 54 36 58 44 58" fill="none" stroke="#ca8a04" stroke-width="3" stroke-linecap="round"/>
      <path d="M82 38 L94 42 C94 54 84 58 76 58" fill="none" stroke="#ca8a04" stroke-width="3" stroke-linecap="round"/>
      <rect x="54" y="78" width="12" height="12" fill="#ca8a04"/>
      <rect x="42" y="90" width="36" height="8" rx="2" fill="#a16207"/>
      <circle cx="60" cy="48" r="5" fill="#fef08a"/>
    </svg>
  `),

  // 23. Podcast / Micrófono
  podcastMic: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#f5f3ff"/>
      <rect x="48" y="24" width="24" height="42" rx="12" fill="#8b5cf6"/>
      <path d="M36 48 C36 64 46 74 60 74 C74 74 84 64 84 48" fill="none" stroke="#7c3aed" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="60" y1="74" x2="60" y2="92" stroke="#6d28d9" stroke-width="4" stroke-linecap="round"/>
      <line x1="44" y1="92" x2="76" y2="92" stroke="#6d28d9" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `),

  // 24. Gráfico Circular / Analytics
  analyticsPie: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#eff6ff"/>
      <circle cx="60" cy="60" r="36" fill="#3b82f6"/>
      <path d="M60 60 L60 24 A 36 36 0 0 1 96 60 Z" fill="#60a5fa"/>
      <path d="M60 60 L96 60 A 36 36 0 0 1 78 92 Z" fill="#93c5fd"/>
      <circle cx="60" cy="60" r="16" fill="#eff6ff"/>
    </svg>
  `),

  // 25. Robot Inteligente / AI Assistant
  aiRobot: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#e0f2fe"/>
      <rect x="36" y="38" width="48" height="44" rx="12" fill="#0284c7"/>
      <line x1="60" y1="38" x2="60" y2="24" stroke="#0284c7" stroke-width="3"/>
      <circle cx="60" cy="22" r="4" fill="#38bdf8"/>
      <circle cx="48" cy="56" r="4" fill="#38bdf8"/>
      <circle cx="72" cy="56" r="4" fill="#38bdf8"/>
      <rect x="48" y="68" width="24" height="4" rx="2" fill="#ffffff"/>
      <rect x="28" y="52" width="6" height="16" rx="3" fill="#0369a1"/>
      <rect x="86" y="52" width="6" height="16" rx="3" fill="#0369a1"/>
    </svg>
  `),

  // 26. Calendario & Planificación Temporal
  calendarSchedule: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#eef2ff"/>
      <rect x="28" y="28" width="64" height="64" rx="10" fill="#ffffff" stroke="#6366f1" stroke-width="3"/>
      <rect x="28" y="28" width="64" height="18" rx="10" fill="#6366f1"/>
      <line x1="42" y1="22" x2="42" y2="30" stroke="#4f46e5" stroke-width="3" stroke-linecap="round"/>
      <line x1="78" y1="22" x2="78" y2="30" stroke="#4f46e5" stroke-width="3" stroke-linecap="round"/>
      <circle cx="44" cy="60" r="3" fill="#818cf8"/>
      <circle cx="60" cy="60" r="3" fill="#818cf8"/>
      <circle cx="76" cy="60" r="3" fill="#818cf8"/>
      <circle cx="44" cy="74" r="3" fill="#818cf8"/>
      <circle cx="60" cy="74" r="3" fill="#4f46e5"/>
    </svg>
  `),

  // 27. Producto & Paquete 3D
  productBox: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#faf5ff"/>
      <polygon points="60,26 92,42 60,58 28,42" fill="#c084fc"/>
      <polygon points="28,42 60,58 60,94 28,78" fill="#a855f7"/>
      <polygon points="92,42 60,58 60,94 92,78" fill="#9333ea"/>
      <line x1="60" y1="58" x2="60" y2="94" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
    </svg>
  `),

  // 28. Diapositivas & Pitch Deck
  pitchDeck: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#fff7ed"/>
      <rect x="24" y="28" width="72" height="50" rx="6" fill="#ea580c"/>
      <rect x="30" y="34" width="60" height="38" rx="4" fill="#ffffff"/>
      <path d="M38 58 L48 46 L58 52 L72 38" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="60,78 48,96 72,96" fill="#c2410c"/>
    </svg>
  `),

  // 29. Blockchain & Cripto
  blockchainCrypto: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#f8fafc"/>
      <rect x="26" y="48" width="22" height="22" rx="4" fill="#0f172a"/>
      <rect x="72" y="48" width="22" height="22" rx="4" fill="#0f172a"/>
      <rect x="49" y="24" width="22" height="22" rx="4" fill="#3b82f6"/>
      <line x1="48" y1="59" x2="72" y2="59" stroke="#64748b" stroke-width="3" stroke-dasharray="2 2"/>
      <line x1="37" y1="48" x2="49" y2="35" stroke="#3b82f6" stroke-width="2.5"/>
      <line x1="83" y1="48" x2="71" y2="35" stroke="#3b82f6" stroke-width="2.5"/>
    </svg>
  `),

  // 30. Sostenibilidad & Ecología
  sustainabilityLeaf: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#f0fdf4"/>
      <path d="M34 86 C34 86 36 44 76 34 C76 34 88 66 52 86 Z" fill="#16a34a"/>
      <path d="M34 86 C48 74 62 58 76 34" fill="none" stroke="#86efac" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="44" cy="46" r="3" fill="#22c55e"/>
    </svg>
  `),

  // 31. Depuración & Corrección de Bugs
  bugFix: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#fef2f2"/>
      <ellipse cx="60" cy="64" rx="18" ry="22" fill="#ef4444"/>
      <circle cx="60" cy="38" r="10" fill="#dc2626"/>
      <line x1="54" y1="32" x2="46" y2="24" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="66" y1="32" x2="74" y2="24" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="42" y1="56" x2="26" y2="52" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
      <line x1="78" y1="56" x2="94" y2="52" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
      <line x1="42" y1="72" x2="26" y2="78" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
      <line x1="78" y1="72" x2="94" y2="78" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),

  // 32. Mapa Mental & Nodos Conectados
  mindMapHub: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#f8fafc"/>
      <circle cx="60" cy="60" r="16" fill="#3b82f6"/>
      <circle cx="28" cy="36" r="10" fill="#10b981"/>
      <circle cx="92" cy="36" r="10" fill="#f59e0b"/>
      <circle cx="28" cy="84" r="10" fill="#ec4899"/>
      <circle cx="92" cy="84" r="10" fill="#8b5cf6"/>
      <path d="M48 50 Q 38 42 36 38" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
      <path d="M72 50 Q 82 42 84 38" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
      <path d="M48 70 Q 38 78 36 82" fill="none" stroke="#ec4899" stroke-width="3" stroke-linecap="round"/>
      <path d="M72 70 Q 82 78 84 82" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),
};
