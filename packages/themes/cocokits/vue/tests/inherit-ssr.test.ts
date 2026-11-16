// @vitest-environment node
import { createSSRApp, defineComponent, h, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { attrIn, inheritCases } from './inherit-cases';

const server = (ui: () => VNode): Promise<string> =>
  renderToString(
    createSSRApp(defineComponent({ setup: () => () => h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, ui) })),
  );

describe.each(inheritCases.map((c) => [c.name, c] as const))('group inheritance on the server: %s', (_name, c) => {
  const attr = async (parent: string | null | undefined, own: string | null | undefined): Promise<string | null> =>
    attrIn(await server(() => c.ui(parent, own)), c.root, c.attr);

  it('renders the value of the parent in the server HTML', async () => {
    expect(await attr(c.parent, undefined)).toBe(c.parent);
  });

  it('renders its own value over the parent', async () => {
    expect(await attr(c.parent, c.own)).toBe(c.own);
  });

  it('renders no attribute for an own null, and none when the parent is null', async () => {
    expect(await attr(c.parent, null)).toBeNull();
    expect(await attr(null, undefined)).toBeNull();
  });
});
