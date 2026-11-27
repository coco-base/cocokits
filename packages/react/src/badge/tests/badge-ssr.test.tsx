// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { BadgeContainer } from '../../badge-container';
import { Badge } from '../index';
import { testThemeConfig } from './fixtures';

describe('Badge and BadgeContainer on the server', () => {
  it('import in plain Node without window or document', () => {
    // The static imports above ran in this Node environment: they would have thrown on `window`.
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(typeof Badge).toBe('function');
    expect(typeof BadgeContainer).toBe('function');
  });

  it('render the classes, data-* and parts into the markup', () => {
    const html = renderToString(
      <ThemeProvider themeConfig={testThemeConfig}>
        <BadgeContainer position="bottom-left">
          <Badge content={120} max={99} />
        </BadgeContainer>
      </ThemeProvider>,
    );
    expect(html).toContain('class="cck-badge-container"');
    expect(html).not.toContain('style=');
    expect(html).toContain('data-position="bottom-left"');
    expect(html).toContain('data-truncated=""');
    expect(html).toContain('data-variant="rounded"');
    expect(html).toContain('<span class="cck-badge__content">99</span><span class="cck-badge__max-indicator">+</span>');
  });

  it('renders an empty badge with an empty content part', () => {
    const html = renderToString(<Badge />);
    expect(html).toContain('data-empty=""');
    expect(html).toContain('<span class="cck-badge__content"></span>');
  });

  it('renders a hidden badge with the native attribute and no children', () => {
    const html = renderToString(<Badge content={5} hide />);
    expect(html).toContain('hidden=""');
    expect(html).not.toContain('data-hidden');
    expect(html).not.toContain('cck-badge__content');
  });
});
