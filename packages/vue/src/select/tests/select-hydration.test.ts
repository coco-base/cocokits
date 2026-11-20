// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { item, selectRoot, settle, stubOverlayBrowser } from './fixtures';

let mounted: App | undefined;
beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function makeApp(props: Record<string, unknown>): App {
  return createSSRApp({
    render: () => h('div', [selectRoot(props, { items: () => [item('Cake'), item('Burger')] })]),
  });
}

async function hydrate(props: Record<string, unknown>): Promise<{ container: HTMLElement; serverHtml: string }> {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = await renderToString(makeApp(props));
  const serverHtml = container.innerHTML;
  mounted = makeApp(props);
  mounted.mount(container);
  expect(container.innerHTML).toBe(serverHtml);
  expect(error).not.toHaveBeenCalled();
  expect(warn).not.toHaveBeenCalled();
  return { container, serverHtml };
}

describe('Select hydration', () => {
  it('hydrates a closed Select without a mismatch, and it opens afterwards', async () => {
    const { container } = await hydrate({ name: 'dish', modelValue: 'Burger' });
    await userEvent.click(must(container.querySelector('button')));
    await settle();
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    expect(container.querySelector('[role="listbox"]')).toBeNull();
  });

  it('hydrates the label of items without a mismatch', async () => {
    const { container } = await hydrate({ modelValue: 'burger', items: { burger: 'Burger' }, name: 'dish' });
    expect(container.querySelector('.cck-select__value')?.textContent).toBe('Burger');
  });

  it('hydrates an open Select without a mismatch and mounts its list after hydration', async () => {
    const { container } = await hydrate({ open: true });
    await settle();
    const list = document.querySelector('[role="listbox"]');
    expect(list).not.toBeNull();
    expect(container.contains(list)).toBe(false);
    expect(container.querySelector('button')?.getAttribute('aria-controls')).toBe(list?.id);
  });
});

function must<T>(value: T | null): T {
  if (value === null) throw new Error('Expected an element.');
  return value;
}
