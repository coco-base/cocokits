// @vitest-environment jsdom
import { createSSRApp, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { view } from '../../internal/tests/mount-helpers';
import { choiceControls } from './ssr-fixtures';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const idRefs = (container: Element): string[] =>
  [...container.querySelectorAll('[id], [for]')].map((el) => `${el.id}|${String(el.getAttribute('for'))}`);

describe('Checkbox, Switch and Radio hydration', () => {
  it('hydrates the server markup without a mismatch, a warning or a change of the ids', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(createSSRApp(view(choiceControls)));
    const ids = idRefs(container);

    app = createSSRApp(view(choiceControls));
    app.mount(container);
    await nextTick();

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(idRefs(container)).toEqual(ids);
  });

  it('keeps the checked state, sets the mixed property and shows the field fact after hydration', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(createSSRApp(view(choiceControls)));
    expect(container.querySelector<HTMLInputElement>('#mixed')?.indeterminate).toBe(false);

    app = createSSRApp(view(choiceControls));
    app.mount(container);
    await nextTick();

    expect(container.querySelector<HTMLInputElement>('#mixed')?.indeterminate).toBe(true);
    expect(container.querySelector<HTMLInputElement>('input[value=yes]')?.checked).toBe(true);
    expect(container.querySelector<HTMLInputElement>('input[value=free]')?.checked).toBe(true);
    expect(container.querySelector('#news-control')).not.toBeNull();
  });
});
