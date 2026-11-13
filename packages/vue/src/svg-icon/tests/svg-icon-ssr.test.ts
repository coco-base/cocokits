// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { SvgIcon } from '../index';
import { iconsThemeConfig, view } from './fixtures';

/** The markup without the fragment anchors Vue writes around lists and slots. */
const unanchored = (html: string): string => html.replaceAll('<!--[-->', '').replaceAll('<!--]-->', '');

describe('SvgIcon on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('puts the full icon in the server HTML', async () => {
    const html = await renderToString(
      createSSRApp(
        view(() =>
          h(ThemeProvider, { themeConfig: iconsThemeConfig }, () => [
            h(SvgIcon, { iconName: 'heart' }),
            h(SvgIcon, { iconName: 'plus', label: 'Add' }),
          ]),
        ),
      ),
    );
    expect(unanchored(html)).toContain(
      '<span class="cck-svg-icon" data-icon-name="heart" aria-hidden="true"><svg class="cck-svg-icon__svg" viewBox="0 0 24 24"><path d="M1 1h2"></path><path d="M3 3h2" fill-rule="evenodd" clip-rule="nonzero"></path></svg></span>',
    );
    expect(html).toContain('role="img" aria-label="Add"');
  });

  it('renders an empty svg for an unknown name, without a throw or an error log', async () => {
    const html = await renderToString(createSSRApp(view(() => h(SvgIcon, { iconName: 'heart' }))));
    expect(unanchored(html)).toContain('<svg class="cck-svg-icon__svg"></svg>');
    expect(html).toContain('data-icon-name="heart"');
  });
});
