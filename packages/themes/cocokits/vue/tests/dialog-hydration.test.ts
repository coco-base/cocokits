// @vitest-environment jsdom
import { createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { DialogContent, DialogRoot, DialogTitle, DialogTrigger } from '../src/index';

/** jsdom has no top layer and no modal dialog: the stubs show a popover and mark a modal dialog as open. */
beforeEach(() => {
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
  };
});

let app: App | undefined;
afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

const size = ref<'lg' | 'sm'>('lg');
const makeApp = (): App =>
  createSSRApp(
    defineComponent({
      setup: () => () =>
        h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () =>
          h(DialogRoot, { defaultOpen: true, size: size.value }, () => [
            h(DialogTrigger, null, () => 'Open'),
            h(DialogContent, { 'aria-label': 'Panel' }, () => h(DialogTitle, null, () => 'Delete project')),
          ]),
        ),
    }),
  );

const dialog = (): HTMLElement | null => document.querySelector('dialog');

describe('theme dialog hydration', () => {
  it('shows the root size on the open content right after hydration, and a later change shows the new size', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    expect(container.querySelector('dialog')).toBeNull();

    app = makeApp();
    app.mount(container);
    await vi.waitFor(() => {
      expect(dialog()?.getAttribute('data-size')).toBe('lg');
    });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();

    size.value = 'sm';
    await nextTick();
    expect(dialog()?.getAttribute('data-size')).toBe('sm');
  });
});
