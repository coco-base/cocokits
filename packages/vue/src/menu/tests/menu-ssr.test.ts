import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../index';

function app(open: boolean) {
  return createSSRApp({
    render: () =>
      h('div', [
        h(MenuRoot, { open }, () => [
          h(MenuTrigger, null, () => 'Actions'),
          h(MenuContent, null, () => [h(MenuItem, null, () => 'Edit'), h(MenuItem, { disabled: true }, () => 'Move')]),
        ]),
      ]),
  });
}

describe('Menu server render', () => {
  it('renders the closed trigger and no content, no guards and no items', async () => {
    const html = await renderToString(app(false));
    expect(html).toContain('class="cck-menu__trigger"');
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-state="closed"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="menu"');
    expect(html).not.toContain('menuitem');
    expect(html).not.toContain('tabindex');
  });

  it('renders an open menu as an expanded trigger with no content and no aria-controls', async () => {
    const html = await renderToString(app(true));
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('data-state="open"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('Edit');
  });

  it('renders the root without an element of its own', async () => {
    const html = await renderToString(app(false));
    expect(html.replaceAll(/<!--.*?-->/g, '').startsWith('<div><button')).toBe(true);
  });

  it('gives the trigger an id from the SSR-stable source, the same on two renders', async () => {
    const first = await renderToString(app(false));
    const second = await renderToString(app(false));
    expect(first).toMatch(/id="[^"]+-trigger"/);
    expect(first).toBe(second);
  });
});
