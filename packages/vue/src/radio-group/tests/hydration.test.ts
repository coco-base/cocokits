// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { createSSRApp, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { groupView, type GroupViewOptions } from './fixtures';

let mounted: App | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const makeApp = (options: GroupViewOptions): App => createSSRApp({ render: groupView(options) });

async function hydrate(options: GroupViewOptions): Promise<{ container: HTMLElement; serverHtml: string }> {
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

describe('RadioGroup hydration', () => {
  it('hydrates the server markup without a mismatch, then sets the tab stop after mount', async () => {
    const { container, serverHtml } = await hydrate({ group: { defaultValue: 'pro' } });
    const inputs = [...container.querySelectorAll<HTMLInputElement>('input')];
    expect(inputs.every((input) => input.type === 'radio')).toBe(true);
    // Hydration itself changes nothing; the roving tabindex arrives after mount.
    expect(serverHtml).not.toContain('tabindex');
    await nextTick();
    expect(inputs.map((input) => input.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    expect(new Set(inputs.map((input) => input.name)).size).toBe(1);
    expect(inputs.map((input) => input.checked)).toEqual([false, true, false]);
  });

  it('works after hydration: an arrow moves the check', async () => {
    const { container } = await hydrate({ group: { defaultValue: 'free' } });
    await nextTick();
    const inputs = [...container.querySelectorAll<HTMLInputElement>('input')];
    inputs[0]?.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(inputs.map((input) => input.checked)).toEqual([false, true, false]);
  });
});
