// @vitest-environment jsdom
import { createSSRApp, h, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconProvider } from '@cocokits/vue-core';
import { SvgIcon } from '../index';
import { heartIcon, plusIcon, svgOf, view, withIcons } from './fixtures';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const makeApp = (): App =>
  createSSRApp(
    view(() =>
      h(
        withIcons(() => [
          h(SvgIcon, { iconName: 'heart' }),
          h(SvgIcon, { iconName: 'plus', label: 'Add' }),
          h(SvgIcon, { svg: svgOf(heartIcon) }),
        ]),
      ),
    ),
  );

describe('SvgIcon hydration', () => {
  it('hydrates the server markup without a mismatch, and draws the svg string after mount', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const serverHtml = container.innerHTML;
    expect(container.querySelectorAll('path')).toHaveLength(2);
    app = makeApp();
    app.mount(container);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
    await nextTick();
    expect(container.querySelectorAll('path')).toHaveLength(3);
  });

  it('hydrates a lazy icon as empty and draws it after the load', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const make = (): App =>
      createSSRApp(
        view(() =>
          h(IconProvider, { lazyIcons: { plus: () => Promise.resolve(plusIcon) } }, () =>
            h(SvgIcon, { iconName: 'plus' }),
          ),
        ),
      );
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(make());
    expect(container.querySelector('path')).toBeNull();
    const serverHtml = container.innerHTML;
    app = make();
    app.mount(container);
    expect(container.innerHTML).toBe(serverHtml);
    await vi.waitFor(() => {
      expect(container.querySelector('path')).not.toBeNull();
    });
    expect(error).not.toHaveBeenCalled();
  });
});
