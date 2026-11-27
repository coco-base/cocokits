// @vitest-environment jsdom
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { AvatarGroup } from '../../avatar-group';
import { AvatarLabel } from '../../avatar-label';
import { AvatarFallback, AvatarImage, AvatarRoot } from '../index';
import { stubImage, view } from './fixtures';

const themeConfig = defineThemeConfig({
  name: 'test',
  components: { avatar: { size: { attrName: 'size', values: ['sm', 'md'], default: 'md' } } },
});

let app: App | undefined;

beforeEach(stubImage);
afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function makeApp(): App {
  return createSSRApp(
    view(() =>
      h(ThemeProvider, { themeConfig }, () => [
        h(AvatarRoot, null, () => [
          h(AvatarImage, { src: '/a.webp', alt: 'Ada' }),
          h(AvatarFallback, null, () => 'AL'),
        ]),
        h(AvatarRoot, null, () => h(AvatarFallback, { delayMs: 200 }, () => 'GH')),
        h(AvatarGroup, null, () => [h(AvatarRoot), h(AvatarRoot)]),
        h(AvatarLabel, { name: 'Ada', description: 'Maths' }, () => h(AvatarRoot, { 'aria-hidden': 'true' })),
      ]),
    ),
  );
}

describe('Avatar hydration', () => {
  it('hydrates the server markup without a mismatch or a warning', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const serverHtml = container.innerHTML;

    app = makeApp();
    app.mount(container);

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
  });
});
