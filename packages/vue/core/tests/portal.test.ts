// @vitest-environment jsdom
import { createApp, createSSRApp, defineComponent, h, inject, nextTick, provide, ref, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineThemeConfig } from '@cocokits/shared';
import { Portal, provideDirection, ThemeProvider } from '../src/index';

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {},
  modeCollections: [
    { name: 'Color', attrName: 'cck-color-mode', modes: [{ name: 'Dark', value: 'dark' }], defaultMode: 'Dark' },
    {
      name: 'Button',
      attrName: 'cck-button-mode',
      componentName: 'button',
      modes: [{ name: 'A', value: 'a' }],
      defaultMode: 'A',
    },
  ],
});

let apps: App[] = [];
beforeEach(() => {
  // jsdom has no top layer: stub `showPopover`.
  HTMLElement.prototype.showPopover = vi.fn();
});
afterEach(() => {
  vi.restoreAllMocks();
  for (const app of apps) app.unmount();
  apps = [];
  document.body.innerHTML = '';
});

const CTX = Symbol('ctx');

function setup(options: { open?: boolean; dir?: 'rtl'; ancestor?: HTMLElement } = {}) {
  const open = ref(options.open ?? true);
  const mount = document.createElement('div');
  const appRoot = document.createElement('div');
  const trigger = document.createElement('button');
  (options.ancestor ?? document.body).append(mount);
  mount.append(trigger, appRoot);
  const Content = defineComponent({
    setup() {
      const value = inject<string>(CTX, 'missing');
      return () => h('p', { id: 'content' }, value);
    },
  });
  const Root = defineComponent({
    setup() {
      provide(CTX, 'provided');
      if (options.dir) provideDirection(options.dir);
      return () =>
        h(ThemeProvider, { themeConfig }, () =>
          h(Portal, { open: open.value, getTrigger: () => trigger }, () => h(Content)),
        );
    },
  });
  const app = createApp(Root);
  apps.push(app);
  app.mount(appRoot);
  return { open, trigger, mount };
}

describe('Portal', () => {
  it('renders nothing in server output', async () => {
    const App = defineComponent({
      setup: () => () => h('div', [h(Portal, { open: true, getTrigger: () => null }, () => h('p', 'x'))]),
    });
    expect(await renderToString(createSSRApp(App))).not.toContain('<p>');
  });

  it('hydrates an open portal without a mismatch and shows the content afterwards', async () => {
    const App = defineComponent({
      setup: () => () => h('div', [h(Portal, { open: true, getTrigger: () => document.body }, () => h('p', 'x'))]),
    });
    const markup = await renderToString(createSSRApp(App));
    const root = document.createElement('div');
    root.innerHTML = markup;
    document.body.append(root);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const app = createSSRApp(App);
    apps.push(app);
    app.mount(root);
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
    expect(document.body.querySelector('[popover] p')?.textContent).toBe('x');
  });

  it('puts the content in the host, not in the trigger parent, and keeps context', async () => {
    const { mount } = setup();
    await nextTick();
    const content = document.getElementById('content');
    expect(content?.textContent).toBe('provided');
    expect(mount.contains(content)).toBe(false);
    expect(content?.parentElement?.getAttribute('popover')).toBe('manual');
    expect(content?.parentElement?.parentElement).toBe(document.body);
  });

  it('creates the host inside an open modal dialog that holds the trigger', async () => {
    const dialog = document.createElement('dialog');
    document.body.append(dialog);
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
      return selector === ':modal' && this === dialog;
    });
    setup({ ancestor: dialog });
    await nextTick();
    expect(dialog.contains(document.getElementById('content'))).toBe(true);
  });

  it('mirrors the page modes and the direction on the host', async () => {
    document.body.setAttribute('data-cck-color-mode', 'dark');
    document.body.setAttribute('data-cck-button-mode', 'a');
    document.body.setAttribute('dir', 'rtl');
    setup({ dir: 'rtl' });
    await nextTick();
    const host = document.getElementById('content')?.parentElement;
    expect(host?.getAttribute('data-cck-color-mode')).toBe('dark');
    expect(host?.hasAttribute('data-cck-button-mode')).toBe(false);
    expect(host?.getAttribute('dir')).toBe('rtl');
    document.body.removeAttribute('dir');
  });

  it('removes the host when it closes and recreates it when it opens', async () => {
    const { open } = setup();
    await nextTick();
    expect(document.getElementById('content')).not.toBeNull();
    open.value = false;
    await nextTick();
    expect(document.getElementById('content')).toBeNull();
    expect(document.querySelector('[popover]')).toBeNull();
    open.value = true;
    await nextTick();
    expect(document.getElementById('content')).not.toBeNull();
  });

  it('removes the host on unmount', async () => {
    setup();
    await nextTick();
    apps.pop()?.unmount();
    expect(document.querySelector('[popover]')).toBeNull();
  });

  it('moves the host when the trigger changes to an element in another container', async () => {
    const dialog = document.createElement('dialog');
    document.body.append(dialog);
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
      return selector === ':modal' && this === dialog;
    });
    const inside = document.createElement('button');
    dialog.append(inside);
    const outside = document.createElement('button');
    document.body.append(outside);
    const trigger = ref<HTMLElement>(outside);
    const app = createApp({
      render: () => h(Portal, { open: true, getTrigger: () => trigger.value }, () => h('p', { id: 'content' }, 'x')),
    });
    apps.push(app);
    app.mount(document.body.appendChild(document.createElement('div')));
    await nextTick();
    expect(document.getElementById('content')?.closest('[popover]')?.parentElement).toBe(document.body);
    trigger.value = inside;
    await nextTick();
    await nextTick();
    expect(document.getElementById('content')?.closest('[popover]')?.parentElement).toBe(dialog);
  });
});
