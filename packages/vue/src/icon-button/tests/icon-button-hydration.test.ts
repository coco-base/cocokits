// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { inTheme, view } from './fixtures';
import { SvgIcon } from '../../svg-icon';
import { IconButton } from '../index';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const makeApp = (onClick: () => void): App =>
  createSSRApp(
    view(() =>
      inTheme(() => [
        h(IconButton, { 'aria-label': 'Add', onClick }, () => h(SvgIcon, { iconName: 'plus' })),
        h(IconButton, { asChild: true, disabled: true, onClick }, () => h('a', { href: '#go', 'aria-label': 'Go' })),
      ]),
    ),
  );

describe('IconButton hydration', () => {
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
  });
});
