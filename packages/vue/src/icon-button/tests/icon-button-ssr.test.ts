// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { inTheme, view } from './fixtures';
import { plusIcon } from '@cocokits/icons';
import { SvgIcon } from '../../svg-icon';
import { IconButton } from '../index';

describe('IconButton on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the class, type, theme data-* and the icon in the markup', async () => {
    const html = await renderToString(
      createSSRApp(
        view(() =>
          inTheme(() => [
            h(IconButton, { 'aria-label': 'Add' }, () => h(SvgIcon, { iconName: 'plus' })),
            h(IconButton, { 'aria-label': 'Off', disabled: true }),
            h(IconButton, { as: 'a', href: '#go', disabled: true, 'aria-label': 'Go' }),
          ]),
        ),
      ),
    );
    expect(html).toMatch(/<button[^>]*class="cck-icon-button"[^>]*type="button"/);
    expect(html).toContain('data-variant="primary"');
    expect(html).toContain(plusIcon.body);
    expect(html).toMatch(/<button[^>]* disabled[ >][^>]*>/);
    expect(html).toMatch(/<a[^>]*aria-disabled="true"[^>]*tabindex="-1"/);
    expect(html).not.toMatch(/<a[^>]*type=/);
  });
});
