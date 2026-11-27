// @vitest-environment jsdom
import { createSSRApp, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { view } from '../../internal/tests/mount-helpers';
import { field, list } from './fixtures';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

/** The ids and their references, which hydration must keep. */
const idRefs = (container: Element): string[] =>
  [...container.querySelectorAll('[id], [for], [aria-labelledby], [aria-describedby]')].map((el) =>
    ['id', 'for', 'aria-labelledby', 'aria-describedby'].map((name) => el.getAttribute(name)).join('|'),
  );

const makeApp = (): App =>
  createSSRApp(
    view(() => [
      field({ id: 'one', required: true }, { defaultValue: ['Pizza', 'Cake'], name: 'a' }),
      list({ defaultValue: ['Salad'], placeholder: 'Add', name: 'b', required: true }),
      list({ 'aria-label': 'Empty' }),
    ]),
  );

describe('ChipList hydration', () => {
  it('hydrates the server markup without a mismatch or a warning, keeping the ids', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const ids = idRefs(container);
    const chips = container.querySelectorAll('.cck-chip').length;

    app = makeApp();
    app.mount(container);
    await nextTick();

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(idRefs(container)).toEqual(ids);
    expect(container.querySelectorAll('.cck-chip')).toHaveLength(chips);
    // The field learns the control's facts after hydration, as the Input does.
    expect(container.querySelector('.cck-form-field')?.hasAttribute('data-filled')).toBe(true);
  });
});
