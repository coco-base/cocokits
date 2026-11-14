// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { Badge } from '../index';
import { BadgeContainer } from '../../badge-container';
import { testThemeConfig, view } from './fixtures';

describe('Badge and BadgeContainer on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the badge parts, theme attributes and position in the markup', async () => {
    const html = await renderToString(
      createSSRApp(
        view(() =>
          h(ThemeProvider, { themeConfig: testThemeConfig }, () =>
            h(BadgeContainer, { position: 'bottom-left' }, () => [
              h('button', { type: 'button' }, 'Inbox'),
              h(Badge, { content: 120, max: 99 }),
            ]),
          ),
        ),
      ),
    );
    expect(html).toContain('<div class="cck-badge-container" data-position="bottom-left">');
    expect(html).not.toContain('style=');
    expect(html).toContain('class="cck-badge"');
    expect(html).toContain('data-truncated');
    expect(html).toContain('data-variant="rounded"');
    expect(html).toContain('<span class="cck-badge__content">99</span><span class="cck-badge__max-indicator">+</span>');
  });

  it('renders an empty and a hidden badge', async () => {
    const html = await renderToString(
      createSSRApp(view(() => h('div', [h(Badge), h(Badge, { content: 3, hide: true })]))),
    );
    expect(html).toContain('data-empty');
    expect(html).toMatch(/<span class="cck-badge" hidden>/);
    expect(html).not.toContain('data-hidden');
    expect(html).not.toContain('>3<');
  });
});
