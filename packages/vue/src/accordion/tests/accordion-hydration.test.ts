// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { createSSRApp, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accordionView, type AccordionViewOptions } from './fixtures';

let mounted: App | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const makeApp = (options: AccordionViewOptions): App => createSSRApp({ render: accordionView(options) });

async function hydrate(options: AccordionViewOptions): Promise<{ container: HTMLElement; serverHtml: string }> {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = await renderToString(makeApp(options));
  const serverHtml = container.innerHTML;
  mounted = makeApp(options);
  mounted.mount(container);
  expect(error).not.toHaveBeenCalled();
  expect(warn).not.toHaveBeenCalled();
  return { container, serverHtml };
}

describe('Accordion hydration', () => {
  it('hydrates the server markup without a mismatch and leaves it unchanged, then a click toggles', async () => {
    const { container, serverHtml } = await hydrate({ root: { defaultValue: 'shipping' } });
    expect(container.innerHTML).toBe(serverHtml);
    expect(container.innerHTML).not.toContain('--accordion-content');
    const returns = container.querySelector<HTMLElement>('.cck-accordion__item:nth-child(2) .cck-accordion__trigger');
    if (!returns) throw new Error('no trigger');
    await userEvent.click(returns);
    expect(returns.getAttribute('aria-expanded')).toBe('true');
    expect(returns.closest('.cck-accordion__item')?.getAttribute('data-state')).toBe('open');
  });

  it('hydrates a multiple accordion with a disabled item and kept-mounted content', async () => {
    const { container, serverHtml } = await hydrate({
      root: { defaultValue: ['shipping', 'returns'], unmountOnHide: false },
      returns: { disabled: true },
    });
    expect(container.innerHTML).toBe(serverHtml);
  });
});
