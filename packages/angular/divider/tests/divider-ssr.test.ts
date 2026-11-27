// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('Divider on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the four hr elements with their attributes and no style', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const lines = html.match(/<hr[^>]*>/g) ?? [];
    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain('class="cck-divider"');
    expect(lines[0]).toContain('data-orientation="horizontal"');
    expect(lines[0]).not.toContain('role=');
    expect(lines[0]).not.toContain('aria-orientation');
    expect(lines[1]).toContain('data-orientation="vertical"');
    expect(lines[1]).toContain('aria-orientation="vertical"');
    expect(lines[2]).toContain('role="none"');
    expect(lines[3]).toContain('role="none"');
    expect(lines[3]).not.toContain('aria-orientation');
    for (const line of lines) expect(line).not.toContain('style=');
  });
});
