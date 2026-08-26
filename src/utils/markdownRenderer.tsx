import React from 'react';

/**
 * Lightweight, zero-dependency, safe Markdown parser & renderer
 * Transforms standard Markdown syntax into styled React JSX elements or clean HTML strings.
 */

// Helper to render inline markdown (bold, italic, code, links, strikethrough)
export function renderInlineMarkdown(text: string, isDark = false): React.ReactNode[] {
  if (!text) return [];

  // Split tokens by markdown markers
  // Regex to match inline links [text](url), bold **text**, italic *text*, code `text`, strikethrough ~~text~~
  const tokenRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|~~([^~]+)~~)/g;
  
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      nodes.push(text.substring(lastIndex, matchIndex));
    }

    const fullMatch = match[0];
    if (match[2] && match[3]) {
      // Link [text](url)
      const label = match[2];
      const url = match[3];
      nodes.push(
        <a
          key={`link-${matchIndex}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-400 dark:text-sky-400 hover:underline font-semibold inline-flex items-center gap-0.5"
        >
          {label}
          <svg className="w-2.5 h-2.5 inline-block opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      );
    } else if (match[4]) {
      // Bold **text**
      nodes.push(
        <strong key={`bold-${matchIndex}`} className="font-bold text-white dark:text-slate-100">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      // Italic *text*
      nodes.push(
        <em key={`italic-${matchIndex}`} className="italic opacity-90">
          {match[5]}
        </em>
      );
    } else if (match[6]) {
      // Inline Code `text`
      nodes.push(
        <code
          key={`code-${matchIndex}`}
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${
            isDark ? 'bg-slate-800 text-amber-300 border border-slate-700' : 'bg-slate-100 text-purple-700 border border-slate-200'
          }`}
        >
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      // Strikethrough ~~text~~
      nodes.push(
        <span key={`strike-${matchIndex}`} className="line-through opacity-60">
          {match[7]}
        </span>
      );
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes;
}

/**
 * Full Markdown Document Renderer to React JSX
 */
export const MarkdownView: React.FC<{
  content: string;
  isDark?: boolean;
  className?: string;
}> = ({ content, isDark = false, className = '' }) => {
  if (!content || content.trim().length === 0) {
    return <div className="text-xs italic text-slate-400">Sin contenido en la nota.</div>;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-1.5 pl-4 space-y-1 list-disc text-xs">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Block Fence (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <pre
            key={`codeblock-${elements.length}`}
            className={`my-2 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto ${
              isDark ? 'bg-slate-950 text-emerald-300 border border-slate-800' : 'bg-slate-900 text-slate-100'
            }`}
          >
            <code>{codeBlockBuffer.join('\n')}</code>
          </pre>
        );
        codeBlockBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    // 2. Horizontal Rule (--- or ***)
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(
        <hr key={`hr-${elements.length}`} className={`my-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
      );
      continue;
    }

    // 3. Headings (# H1, ## H2, ### H3, #### H4)
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${elements.length}`} className="text-sm font-bold text-blue-400 mt-2 mb-1 border-b border-blue-500/30 pb-0.5">
          {renderInlineMarkdown(trimmed.substring(2), isDark)}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-xs font-bold text-amber-300 mt-2 mb-1">
          {renderInlineMarkdown(trimmed.substring(3), isDark)}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-xs font-semibold text-emerald-400 mt-1.5 mb-0.5">
          {renderInlineMarkdown(trimmed.substring(4), isDark)}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${elements.length}`} className="text-[11.5px] font-semibold text-purple-300 mt-1 mb-0.5">
          {renderInlineMarkdown(trimmed.substring(5), isDark)}
        </h4>
      );
      continue;
    }

    // 4. Blockquotes (> quote)
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          className={`my-1.5 pl-2.5 py-0.5 border-l-2 text-xs italic ${
            isDark ? 'border-amber-400 text-slate-300 bg-amber-500/5' : 'border-blue-500 text-slate-600 bg-blue-50/50'
          }`}
        >
          {renderInlineMarkdown(trimmed.substring(2), isDark)}
        </blockquote>
      );
      continue;
    }

    // 5. Checklist / Tasks (- [ ] or - [x])
    if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
      flushList();
      const isChecked = trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ');
      const taskText = trimmed.substring(6);
      elements.push(
        <div key={`task-${elements.length}`} className="flex items-center gap-2 my-1 text-xs">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="w-3.5 h-3.5 rounded accent-blue-600 cursor-default"
          />
          <span className={isChecked ? 'line-through opacity-60' : ''}>
            {renderInlineMarkdown(taskText, isDark)}
          </span>
        </div>
      );
      continue;
    }

    // 6. Unordered Lists (- item or * item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(
        <li key={`li-${listItems.length}`} className="leading-snug">
          {renderInlineMarkdown(trimmed.substring(2), isDark)}
        </li>
      );
      continue;
    }

    // 7. Ordered Lists (1. item, 2. item)
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      flushList();
      elements.push(
        <div key={`ordered-${elements.length}`} className="flex items-start gap-1.5 my-0.5 text-xs leading-snug">
          <span className="font-mono font-bold text-amber-400 shrink-0 text-[11px]">{orderedMatch[1]}.</span>
          <div className="flex-1">{renderInlineMarkdown(orderedMatch[2], isDark)}</div>
        </div>
      );
      continue;
    }

    // 8. Empty lines
    if (trimmed === '') {
      flushList();
      elements.push(<div key={`space-${elements.length}`} className="h-1" />);
      continue;
    }

    // 9. Standard Paragraph
    flushList();
    elements.push(
      <p key={`p-${elements.length}`} className="my-0.5 text-xs leading-relaxed break-words">
        {renderInlineMarkdown(line, isDark)}
      </p>
    );
  }

  flushList();

  return <div className={`markdown-view space-y-0.5 ${className}`}>{elements}</div>;
};

/**
 * Converts Markdown text directly into safe HTML markup for standalone export
 */
export function renderMarkdownToHTML(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (```lang ... ```)
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre style="background:#0f172a; color:#38bdf8; padding:8px 10px; border-radius:8px; font-family:monospace; font-size:11px; overflow-x:auto; margin:6px 0;"><code>${code.trim()}</code></pre>`;
  });

  // Headings
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:14px; font-weight:bold; color:#60a5fa; margin:6px 0 3px; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:2px;">$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:13px; font-weight:bold; color:#fcd34d; margin:5px 0 2px;">$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:12px; font-weight:bold; color:#34d399; margin:4px 0 2px;">$1</h3>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #f59e0b; padding-left:8px; margin:4px 0; color:#cbd5e1; font-style:italic;">$1</blockquote>');

  // Checkboxes
  html = html.replace(/^- \[x\] (.+)$/gim, '<div style="display:flex; align-items:center; gap:6px; margin:2px 0;"><input type="checkbox" checked disabled><span style="text-decoration:line-through; opacity:0.6;">$1</span></div>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<div style="display:flex; align-items:center; gap:6px; margin:2px 0;"><input type="checkbox" disabled><span>$1</span></div>');

  // Unordered list items
  html = html.replace(/^[\*\-] (.+)$/gm, '<li style="margin-left:14px; list-style-type:disc;">$1</li>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#ffffff; font-weight:bold;">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em style="font-style:italic;">$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.12); color:#fef08a; padding:1px 4px; border-radius:4px; font-family:monospace; font-size:10.5px;">$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; text-decoration:underline; font-weight:600;" onclick="event.stopPropagation()">$1 ↗</a>');

  // Line breaks
  html = html.replace(/\n/g, '<br/>');

  return html;
}
