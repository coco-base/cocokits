import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from '../index';

function app(open: boolean) {
  return createSSRApp({
    render: () =>
      h('div', [
        h(TooltipRoot, { open }, () => [
          h(TooltipTrigger, { 'aria-label': 'Copy link' }, () => 'Copy'),
          h(TooltipContent, null, () => 'Copy the link'),
        ]),
      ]),
  });
}

describe('Tooltip server render', () => {
  it('renders the closed trigger and no content and no description', async () => {
    const html = await renderToString(app(false));
    expect(html).toContain('class="cck-tooltip__trigger"');
    expect(html).toContain('data-state="closed"');
    expect(html).not.toContain('aria-describedby');
    expect(html).not.toContain('role="tooltip"');
    expect(html).not.toContain('popover=');
  });

  it('renders an open tooltip as an open trigger with no content and no aria-describedby', async () => {
    const html = await renderToString(app(true));
    expect(html).toContain('data-state="open"');
    expect(html).not.toContain('aria-describedby');
    expect(html).not.toContain('role="tooltip"');
    expect(html).not.toContain('Copy the link');
  });

  it('renders the root without an element of its own', async () => {
    const html = await renderToString(app(false));
    expect(html.replaceAll(/<!--.*?-->/g, '').startsWith('<div><button')).toBe(true);
  });
});

describe('Tooltip server render with a provider and a description', () => {
  it('renders the provider without an element and no description element', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(TooltipProvider, { delayDuration: 100 }, () =>
            h(TooltipRoot, null, () => [
              h(TooltipTrigger, { 'aria-label': 'Copy link' }, () => 'Copy'),
              h(TooltipContent, { ariaLabel: 'Copies the link' }, () => 'Copy the link'),
            ]),
          ),
      }),
    );
    expect(html.replaceAll(/<!--.*?-->/g, '').startsWith('<button')).toBe(true);
    expect(html).not.toContain('aria-describedby');
    expect(html).not.toContain('Copies the link');
    expect(html).not.toContain('role="tooltip"');
  });
});
