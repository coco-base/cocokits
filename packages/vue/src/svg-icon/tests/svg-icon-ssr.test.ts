// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { IconProvider } from '@cocokits/vue-core';
import { SvgIcon } from '../index';
import { heartIcon, plusIcon, svgOf, view, withIcons } from './fixtures';

/** The markup without the fragment anchors Vue writes around lists and slots. */
const unanchored = (html: string): string => html.replaceAll('<!--[-->', '').replaceAll('<!--]-->', '');

describe('SvgIcon on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('puts a registered icon in the server HTML, as the markup contract says', async () => {
    const html = await renderToString(
      createSSRApp(
        view(() =>
          h(withIcons(() => [h(SvgIcon, { iconName: 'heart' }), h(SvgIcon, { iconName: 'plus', label: 'Add' })])),
        ),
      ),
    );
    expect(unanchored(html)).toContain(
      `<span class="cck-svg-icon" data-icon="heart" aria-hidden="true"><svg class="cck-svg-icon__svg" viewBox="${heartIcon.viewBox}" aria-hidden="true" focusable="false">${heartIcon.body}</svg></span>`,
    );
    expect(html).toContain('role="img" aria-label="Add"');
    expect(html).toContain(plusIcon.body);
  });

  it('renders an empty svg for a name that is not registered, without a throw or an error log', async () => {
    const html = await renderToString(createSSRApp(view(() => h(SvgIcon, { iconName: 'heart' }))));
    expect(unanchored(html)).toContain('<svg class="cck-svg-icon__svg" aria-hidden="true" focusable="false"></svg>');
    expect(html).toContain('data-icon="heart"');
  });

  it('leaves a lazy icon and an svg string empty on the server', async () => {
    const html = await renderToString(
      createSSRApp(
        view(() =>
          h(IconProvider, { lazyIcons: { plus: () => Promise.resolve(plusIcon) } }, () => [
            h(SvgIcon, { iconName: 'plus' }),
            h(SvgIcon, { svg: svgOf(heartIcon) }),
          ]),
        ),
      ),
    );
    expect(html).not.toContain('<path');
    expect(html).not.toContain('viewBox');
    expect(html).not.toContain('data-icon="heart"');
  });
});
