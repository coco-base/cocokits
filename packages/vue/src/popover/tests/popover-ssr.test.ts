import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import {
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from '../index';

function app(open: boolean) {
  return createSSRApp({
    render: () =>
      h('div', [
        h(PopoverRoot, { open }, () => [
          h(PopoverTrigger, null, () => 'Share'),
          h(PopoverContent, { 'aria-label': 'Share' }, () => ['Link copied', h(PopoverClose, null, () => 'Close')]),
        ]),
      ]),
  });
}

describe('Popover server render', () => {
  it('renders the closed trigger and no content, no host and no guards', async () => {
    const html = await renderToString(app(false));
    expect(html).toContain('class="cck-popover__trigger"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('popover=');
    expect(html).not.toContain('tabindex');
  });

  it('renders an open popover as an expanded trigger with no content and no aria-controls', async () => {
    const html = await renderToString(app(true));
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('data-state="open"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('Link copied');
  });

  it('renders the root without an element of its own', async () => {
    const html = await renderToString(app(false));
    expect(html.replaceAll(/<!--.*?-->/g, '').startsWith('<div><button')).toBe(true);
  });
});

describe('Popover server render with an anchor', () => {
  const withAnchor = (open: boolean) =>
    createSSRApp({
      render: () =>
        h(PopoverRoot, { open }, () => [
          h(PopoverAnchor, { id: 'row' }, () => 'row'),
          h(PopoverTrigger, null, () => 'Share'),
          h(PopoverContent, null, () => [
            h(PopoverTitle, null, () => 'Share'),
            h(PopoverDescription, null, () => 'text'),
          ]),
        ]),
    });

  it('renders the anchor element with its class, closed and open, and no title', async () => {
    const closed = await renderToString(withAnchor(false));
    const open = await renderToString(withAnchor(true));
    expect(closed).toContain('<div id="row" class="cck-popover__anchor">');
    expect(open).toContain('<div id="row" class="cck-popover__anchor">');
    expect(closed).not.toContain('cck-popover__title');
    expect(open).not.toContain('cck-popover__title');
  });
});
