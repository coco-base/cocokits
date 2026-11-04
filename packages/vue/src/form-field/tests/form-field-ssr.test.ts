// @vitest-environment node
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { FormField } from '../index';
import { view } from '../../internal/tests/mount-helpers';

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    'form-field': { tone: { attrName: 'tone', values: ['plain'], default: 'plain', partNames: ['root'] } },
  },
});

/** The server markup without the comments that mark slot fragments. */
async function markup(app: App): Promise<string> {
  return (await renderToString(app)).replace(/<!--[\s\S]*?-->/g, '');
}

describe('FormField, Label and Hint on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the zones in order, with the theme attribute and the author ids', async () => {
    const html = await markup(
      createSSRApp(
        view(() =>
          h(ThemeProvider, { themeConfig }, () =>
            h(FormField, null, {
              hint: () => h(Hint, { id: 'h' }, () => 'Help'),
              default: () => h('input', { id: 'i', 'aria-describedby': 'h' }),
              label: () => h(Label, { for: 'i' }, () => 'Name'),
            }),
          ),
        ),
      ),
    );
    expect(html).toContain('<div data-tone="plain" class="cck-form-field">');
    expect(html).not.toContain('style=');
    const order = ['cck-label', 'cck-form-field__wrapper', 'cck-form-field__input-wrapper', '<input', 'cck-hint'];
    const positions = order.map((part) => html.indexOf(part));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(html).toMatch(/<label class="cck-label" for="i" id="[^"]+-label">Name<\/label>/);
    expect(html).toContain('<div class="cck-hint" id="h">Help</div>');
  });

  it('renders Label and Hint on their own', async () => {
    const html = await markup(
      createSSRApp(view(() => h('div', [h(Label, null, () => 'Name'), h(Hint, null, () => 'Help')]))),
    );
    expect(html).toBe('<div><label class="cck-label">Name</label><div class="cck-hint">Help</div></div>');
  });
});
