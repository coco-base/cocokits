// @vitest-environment jsdom
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../index';
import { settle, stubOverlayBrowser } from './fixtures';

let mounted: App | undefined;
beforeEach(stubOverlayBrowser);
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function makeApp(open: boolean): App {
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

async function hydrate(open: boolean): Promise<{ container: HTMLElement; serverHtml: string }> {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = await renderToString(makeApp(open));
  const serverHtml = container.innerHTML;
  mounted = makeApp(open);
  mounted.mount(container);
  expect(container.innerHTML).toBe(serverHtml);
  expect(error).not.toHaveBeenCalled();
  expect(warn).not.toHaveBeenCalled();
  return { container, serverHtml };
}

describe('Tooltip hydration', () => {
  it('hydrates a closed tooltip without a mismatch', async () => {
    const { container } = await hydrate(false);
    await settle();
    expect(document.querySelector('.cck-tooltip__content')).toBeNull();
    // The description is made after mount, never in the markup of the server.
    expect(document.querySelector('[role="tooltip"][hidden]')?.id).toBe(
      container.querySelector('button')?.getAttribute('aria-describedby'),
    );
  });

  it('hydrates an open tooltip without a mismatch and mounts its content after hydration', async () => {
    const { container } = await hydrate(true);
    await settle();
    const content = document.querySelector('.cck-tooltip__content');
    expect(content).not.toBeNull();
    expect(container.contains(content)).toBe(false);
    expect(container.querySelector('button')?.getAttribute('aria-describedby')).toBe(
      document.querySelector('[role="tooltip"][hidden]')?.id,
    );
  });
});
