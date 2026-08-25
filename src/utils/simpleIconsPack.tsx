import React from 'react';
import * as SimpleIcons from 'simple-icons';

export interface SimpleIconItem {
  id: string;
  slug: string;
  name: string;
  hex: string;
  path: string;
  category: 'brands_tech' | 'brands_dev' | 'brands_social' | 'brands_design' | 'brands_all';
  tags: string[];
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

// Popular curated sets for sub-categories
const DEV_SLUGS = new Set([
  'github', 'gitlab', 'bitbucket', 'git', 'docker', 'kubernetes', 'linux', 'ubuntu',
  'debian', 'archlinux', 'redhat', 'gnubash', 'visualstudiocode', 'neovim', 'vim',
  'react', 'vuedotjs', 'angular', 'svelte', 'nextdotjs', 'nuxtdotjs', 'astro',
  'typescript', 'javascript', 'python', 'rust', 'go', 'cplusplus', 'csharp', 'java',
  'kotlin', 'swift', 'php', 'ruby', 'dart', 'flutter', 'nodedotjs', 'deno', 'bun',
  'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'supabase', 'firebase',
  'prisma', 'graphql', 'nginx', 'apache', 'cloudflare', 'vercel', 'netlify',
  'terraform', 'ansible', 'jenkins', 'githubactions', 'npm', 'pnpm', 'yarn', 'vite',
  'webpack', 'tailwindcss', 'bootstrap', 'sass', 'html5', 'css3', 'markdown'
]);

const TECH_BIG_SLUGS = new Set([
  'google', 'googlecloud', 'microsoft', 'microsoftazure', 'apple', 'amazon',
  'amazonaws', 'meta', 'openai', 'anthropic', 'nvidia', 'intel', 'amd', 'ibm',
  'oracle', 'cisco', 'samsung', 'sony', 'tesla', 'salesforce', 'sap', 'adobe',
  'spotify', 'netflix', 'uber', 'airbnb', 'stripe', 'paypal', 'shopify', 'zoom'
]);

const SOCIAL_SLUGS = new Set([
  'youtube', 'twitch', 'discord', 'slack', 'telegram', 'whatsapp', 'signal',
  'x', 'twitter', 'linkedin', 'instagram', 'facebook', 'tiktok', 'reddit',
  'mastodon', 'threads', 'pinterest', 'snapchat', 'medium', 'substack', 'patreon'
]);

const DESIGN_SLUGS = new Set([
  'figma', 'notion', 'canva', 'adobexd', 'adobephotoshop', 'adobeillustrator',
  'adobepremierepro', 'adobeaftereffects', 'blender', 'sketch', 'invision',
  'framer', 'miro', 'lucid', 'trello', 'jira', 'confluence', 'asana', 'linear',
  'clickup', 'mondaydotcom', 'obsidian', 'evernote', 'airtable', 'coda'
]);

// Component Factory for Simple Icons SVG
const createSimpleIconComponent = (path: string, hex: string): React.FC<{ className?: string; style?: React.CSSProperties }> => {
  const SimpleIconComp: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
    className = 'w-4 h-4',
    style,
  }) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      style={{
        fill: style?.color || (hex ? `#${hex}` : 'currentColor'),
        width: '1em',
        height: '1em',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    >
      <path d={path} />
    </svg>
  );
  SimpleIconComp.displayName = `SimpleIcon_${hex}`;
  return SimpleIconComp;
};

// Build all 3,450+ Simple Icons
export const ALL_SIMPLE_ICONS: SimpleIconItem[] = Object.keys(SimpleIcons)
  .filter((key) => key.startsWith('si') && typeof (SimpleIcons as any)[key] === 'object')
  .map((key) => {
    const raw = (SimpleIcons as any)[key];
    const slug: string = raw.slug || key.replace(/^si/, '').toLowerCase();
    const name: string = raw.title || slug;
    const hex: string = raw.hex || '3b82f6';
    const path: string = raw.path || '';

    let category: SimpleIconItem['category'] = 'brands_all';
    if (DEV_SLUGS.has(slug)) category = 'brands_dev';
    else if (TECH_BIG_SLUGS.has(slug)) category = 'brands_tech';
    else if (SOCIAL_SLUGS.has(slug)) category = 'brands_social';
    else if (DESIGN_SLUGS.has(slug)) category = 'brands_design';

    const tags: string[] = [
      slug,
      name.toLowerCase(),
      'simple-icons',
      'marca',
      'logo',
      'brand',
      'tech',
      ...(category === 'brands_dev' ? ['desarrollo', 'codigo', 'dev', 'lenguaje', 'cloud'] : []),
      ...(category === 'brands_tech' ? ['big tech', 'empresa', 'nube', 'ia', 'ai'] : []),
      ...(category === 'brands_social' ? ['redes', 'social', 'chat', 'comunicacion'] : []),
      ...(category === 'brands_design' ? ['diseno', 'productividad', 'software', 'herramienta'] : []),
    ];

    return {
      id: `si-${slug}`,
      slug,
      name,
      hex,
      path,
      category,
      tags,
      icon: createSimpleIconComponent(path, hex),
    };
  });

// Fast lookup map by ID and Slug
export const SIMPLE_ICONS_BY_ID = new Map<string, SimpleIconItem>();
ALL_SIMPLE_ICONS.forEach((item) => {
  SIMPLE_ICONS_BY_ID.set(item.id, item);
  SIMPLE_ICONS_BY_ID.set(item.slug, item);
  SIMPLE_ICONS_BY_ID.set(`si_${item.slug}`, item);
});

export const TOTAL_SIMPLE_ICONS_COUNT = ALL_SIMPLE_ICONS.length;
