// @vitest-environment node
import { createSSRApp, defineComponent, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from '../src/index';

const render = async (): Promise<string> =>
  renderToString(
    createSSRApp(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () =>
            h(
              AccordionRoot as Component,
              {
                type: 'single',
                defaultValue: 'shipping',
                variant: 'group',
                size: 'sm',
                togglePosition: 'before',
                hideToggle: true,
              },
              () =>
                h(AccordionItem, { value: 'shipping' }, () => [
                  h(AccordionHeader, null, () => h(AccordionTrigger, null, () => 'Shipping')),
                  h(AccordionContent, null, () => 'Orders leave in two days.'),
                ]),
            ),
          ),
      }),
    ),
  );

describe('theme accordion on the server', () => {
  it('has no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the options on the root and the open item open, with no size variable', async () => {
    const markup = await render();
    const root = /<div[^>]*cck-accordion"[^>]*>/.exec(markup)?.[0] ?? '';
    for (const part of ['data-variant="group"', 'data-size="sm"', 'data-toggle-position="before"']) {
      expect(root).toContain(part);
    }
    expect(root).toMatch(/data-hide-toggle(="")?[ >]/);
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).not.toContain('--accordion-content');
    expect(markup).not.toMatch(/cck-accordion__item"[^>]*data-variant/);
  });
});
