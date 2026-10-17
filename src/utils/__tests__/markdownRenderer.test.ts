import { describe, it, expect } from 'vitest';
import { renderMarkdownToHTML } from '../markdownRenderer';

describe('markdownRenderer', () => {
  it('vacío devuelve vacío y escapa HTML', () => {
    expect(renderMarkdownToHTML('')).toBe('');
    expect(renderMarkdownToHTML('<script>')).toContain('&lt;script&gt;');
  });

  it('negrita, cursiva, código y links', () => {
    const html = renderMarkdownToHTML('**b** *i* `c` [t](https://x.com)');
    expect(html).toContain('<strong');
    expect(html).toContain('<em');
    expect(html).toContain('<code');
    expect(html).toContain('target="_blank"');
  });

  it('headings h1-h3 (quirk: > se escapa antes que blockquote)', () => {
    const html = renderMarkdownToHTML('# A\n## B\n### C\n> cita');
    expect(html).toContain('<h1');
    expect(html).toContain('<h2');
    expect(html).toContain('<h3');
    // El escape &gt; corre antes que la regex de citas: no hay <blockquote>
    expect(html).toContain('&gt; cita');
    expect(html).not.toContain('<blockquote');
  });

  it('listas, checklist y code fence', () => {
    const html = renderMarkdownToHTML('- a\n- [ ] todo\n- [x] done\n```js\ncode\n```');
    expect(html).toContain('<li');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('line-through');
    expect(html).toContain('<pre');
  });
});
