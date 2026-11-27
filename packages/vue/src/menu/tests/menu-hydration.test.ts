// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../index';
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
        h(MenuRoot, { open }, () => [
          h(MenuTrigger, null, () => 'Actions'),
          h(MenuContent, null, () => [h(MenuItem, null, () => 'Edit'), h(MenuItem, { disabled: true }, () => 'Move')]),
        ]),
      ]),
  });
}

async function hydrate(open: boolean): Promise<HTMLElement> {
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
  return container;
}

describe('Menu hydration', () => {
  it('hydrates a closed menu without a mismatch, and it opens afterwards', async () => {
    const container = await hydrate(false);
    await userEvent.click(container.querySelector('button') as HTMLElement);
    await settle();
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it('hydrates an open menu without a mismatch and mounts its content after hydration', async () => {
    const container = await hydrate(true);
    await settle();
    const content = document.querySelector('[role="menu"]');
    expect(content).not.toBeNull();
    expect(container.contains(content)).toBe(false);
    expect(container.querySelector('button')?.getAttribute('aria-controls')).toBe(content?.id);
    expect(document.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
  });
});
