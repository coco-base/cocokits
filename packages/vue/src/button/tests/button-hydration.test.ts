// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { Button } from '../index';
import { testThemeConfig, view } from './fixtures';

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
    view(() =>
      h(ThemeProvider, { themeConfig: testThemeConfig }, () => [
        h(Button, { onClick }, () => 'Save'),
        h(Button, { asChild: true, disabled: true, onClick }, () => h('a', { href: '#go' }, 'Go')),
      ]),
    ),
  );
}

describe('Button hydration', () => {
  it('hydrates the server markup without a mismatch, and the click and the guard work afterwards', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onClick = vi.fn();
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp(onClick));
    const serverHtml = container.innerHTML;

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
