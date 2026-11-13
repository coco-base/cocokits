// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('SvgIcon on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the full icon in the markup: root attributes, viewBox and the paths', async () => {
    const html = await renderOnServer();

    const star = /<cck-svg-icon[^>]*data-icon-name="star"[^>]*>.*?<\/cck-svg-icon>/.exec(html)?.[0] ?? '';
    expect(star).toContain('class="cck-svg-icon"');
    expect(star).toContain('aria-hidden="true"');
    expect(star).toContain('viewBox="0 0 24 24"');
    expect(star).toContain('fill-rule="evenodd"');
    expect(star).toContain('clip-rule="evenodd"');
    expect(star).toContain('d="M12 2l3 7h7l-5 5 2 8-7-4-7 4 2-8-5-5h7z"');

    const pair = /<cck-svg-icon[^>]*data-icon-name="pair"[^>]*>.*?<\/cck-svg-icon>/.exec(html)?.[0] ?? '';
    expect(pair).toContain('role="img"');
    expect(pair).toContain('aria-label="Pair"');
    expect(pair).not.toContain('aria-hidden');
    expect(pair.match(/<path/g)).toHaveLength(2);
  });

  it('renders an unknown name as an empty svg with no viewBox and no path', async () => {
    const html = await renderOnServer();
    const missing = /<cck-svg-icon[^>]*data-icon-name="missing"[^>]*>.*?<\/cck-svg-icon>/.exec(html)?.[0] ?? '';
    expect(missing).toContain('<svg');
    expect(missing).not.toContain('viewBox');
    expect(missing).not.toContain('<path');
  });
});
