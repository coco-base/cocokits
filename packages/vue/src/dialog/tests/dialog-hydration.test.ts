// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogClose, DialogContent, DialogRoot, DialogTitle, DialogTrigger } from '../index';
import { settle, stubOverlayBrowser } from './fixtures';

let mounted: App | undefined;
beforeEach(stubOverlayBrowser);
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

function makeApp(open: boolean): App {
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

describe('Dialog hydration', () => {
  it('hydrates a closed dialog without a mismatch, and it opens afterwards', async () => {
    const { container } = await hydrate(false);
    await userEvent.click(container.querySelector('button') as HTMLElement);
    await settle();
    expect(document.querySelector('dialog')).not.toBeNull();
    expect(container.querySelector('dialog')).toBeNull();
  });

  it('hydrates an open dialog without a mismatch and mounts its modal content after hydration', async () => {
    const { container } = await hydrate(true);
    await settle();
    const dialog = document.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(dialog?.open).toBe(true);
    expect(container.contains(dialog)).toBe(false);
    expect(container.querySelector('button')?.getAttribute('aria-controls')).toBe(dialog?.id);
  });
});
