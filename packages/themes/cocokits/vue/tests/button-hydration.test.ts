// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { createSSRApp, defineComponent, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Button } from '../src/index';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  window.location.hash = '';
  document.body.innerHTML = '';
});

function makeApp(onClick: () => void): App {
  return createSSRApp(
    defineComponent({
      setup: () => () =>
        h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () => [
          h(Button, { variant: 'outline', color: 'danger', size: 'lg', onClick }, () => 'Save'),
          h(Button, { as: 'a', href: '#go', disabled: true, onClick }, () => 'Go'),
        ]),
    }),
  );
}

describe('theme Button hydration', () => {
  it('hydrates the server markup unchanged and without warnings; the click and the link guard work', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onClick = vi.fn();
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp(onClick));
    const serverHtml = container.innerHTML;
    expect(container.querySelector('button')?.getAttribute('data-variant')).toBe('outline');

    app = makeApp(onClick);
    app.mount(container);

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);

    await userEvent.click(container.querySelector('button') as HTMLElement);
    expect(onClick).toHaveBeenCalledOnce();
    await userEvent.click(container.querySelector('a') as HTMLElement);
    expect(onClick).toHaveBeenCalledOnce();
    expect(window.location.hash).toBe('');
  });
});
