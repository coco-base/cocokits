import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { DialogClose, DialogContent, DialogRoot, DialogTitle, DialogTrigger } from '../index';

function app(open: boolean) {
  return createSSRApp({
    render: () =>
      h('div', [
        h(DialogRoot, { open }, () => [
          h(DialogTrigger, null, () => 'Delete'),
          h(DialogContent, null, () => [
            h(DialogTitle, null, () => 'Delete project'),
            h(DialogClose, null, () => 'Cancel'),
          ]),
        ]),
      ]),
  });
}

describe('Dialog server render', () => {
  it('renders the closed trigger and no content and no host', async () => {
    const html = await renderToString(app(false));
    expect(html).toContain('class="cck-dialog__trigger"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('<dialog');
    expect(html).not.toContain('popover=');
  });

  it('renders an open dialog as an expanded trigger with no content and no aria-controls', async () => {
    const html = await renderToString(app(true));
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('data-state="open"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('<dialog');
    expect(html).not.toContain('Delete project');
  });

  it('renders the root without an element of its own', async () => {
    const html = await renderToString(app(false));
    expect(html.replaceAll(/<!--.*?-->/g, '').startsWith('<div><button')).toBe(true);
  });
});
