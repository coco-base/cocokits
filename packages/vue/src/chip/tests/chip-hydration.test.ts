// @vitest-environment jsdom
import { createSSRApp, h, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { view } from '../../internal/tests/mount-helpers';
import { Chip } from '../index';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const makeApp = (): App =>
  createSSRApp(
    view(() => [
      h(Chip, { removable: true }, () => 'Pizza'),
      h(Chip, { removable: true, disabled: true, id: 'mine' }, () => 'Cake'),
      h(Chip, null, () => 'Plain'),
    ]),
  );

describe('Chip hydration', () => {
  it('hydrates the server markup without a mismatch, a warning or a change of the ids', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const before = container.innerHTML;

    app = makeApp();
    app.mount(container);
    await nextTick();

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(before);
  });
});
