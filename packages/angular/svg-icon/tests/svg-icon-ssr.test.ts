// @vitest-environment node
import { heartIcon } from '@cocokits/icons';
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('SvgIcon on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the full icon in the markup: root attributes, the owned svg and its body', async () => {
    const html = await renderOnServer();

    const heart = /<cck-svg-icon[^>]*data-icon="heart"[^>]*>.*?<\/cck-svg-icon>/.exec(html)?.[0] ?? '';
    expect(heart).toContain('class="cck-svg-icon"');
    expect(heart).toContain('aria-hidden="true"');
    expect(heart).toContain('class="cck-svg-icon__svg"');
    expect(heart).toContain('focusable="false"');
    expect(heart).toContain(`viewBox="${heartIcon.viewBox}"`);
    expect(heart).toContain(heartIcon.body.slice(0, 40));
    expect(heart).toContain('<path');

    const pair = /<cck-svg-icon[^>]*data-icon="pair"[^>]*>.*?<\/cck-svg-icon>/.exec(html)?.[0] ?? '';
    expect(pair).toContain('role="img"');
    expect(pair).toContain('aria-label="Pair"');
    expect(pair.split('<svg')[0]).not.toContain('aria-hidden');
    expect(pair.match(/<path/g)).toHaveLength(2);
  });

  it('renders an unknown name as an empty svg with no viewBox and no path', async () => {
    const html = await renderOnServer();
    const missing = /<cck-svg-icon[^>]*data-icon="missing"[^>]*>.*?<\/cck-svg-icon>/.exec(html)?.[0] ?? '';
    expect(missing).toContain('<svg');
    expect(missing).not.toContain('viewBox');
    expect(missing).not.toContain('<path');
  });
});
