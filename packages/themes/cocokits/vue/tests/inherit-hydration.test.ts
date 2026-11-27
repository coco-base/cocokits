// @vitest-environment jsdom
import { createSSRApp, defineComponent, h, type App, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { attrIn, dataAttrsIn, inheritCases } from './inherit-cases';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const makeApp = (ui: () => VNode): App =>
  createSSRApp(defineComponent({ setup: () => () => h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, ui) }));

describe.each(inheritCases)('group inheritance hydration: $name', (c) => {
  it.each([
    { label: 'the parent value', parent: c.parent, own: undefined, expected: c.parent },
    { label: 'an own value over the parent', parent: c.parent, own: c.own, expected: c.own },
    { label: 'an own null', parent: c.parent, own: null, expected: null },
    { label: 'a null parent', parent: null, own: undefined, expected: null },
  ])('keeps $label unchanged after hydration', async ({ parent, own, expected }) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    const ui = (): VNode => c.ui(parent, own);
    container.innerHTML = await renderToString(makeApp(ui));
    const serverHtml = container.innerHTML;
    expect(attrIn(serverHtml, c.root, c.attr)).toBe(expected);

    app = makeApp(ui);
    app.mount(container);

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(dataAttrsIn(container.innerHTML)).toEqual(dataAttrsIn(serverHtml));
    expect(attrIn(container.innerHTML, c.root, c.attr)).toBe(expected);
  });
});
