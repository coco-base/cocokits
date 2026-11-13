// @vitest-environment jsdom
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { ThemeProvider, useThemeIcons } from '../src/index';

const themeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {},
  icons: { star: { viewBox: '0 0 24 24', paths: [{ d: 'M1 1' }] } },
  partIconNames: { select: { dropdownIcon: 'star' } },
});

const Probe = defineComponent({
  setup() {
    const icons = useThemeIcons();
    return () => h('i', { 'data-probe': JSON.stringify(icons.value) });
  },
});

const probeOf = (markup: string): unknown =>
  JSON.parse((/data-probe="([^"]*)"/.exec(markup)?.[1] ?? '').replaceAll('&quot;', '"'));

const themed = (config: ThemeConfig): Component =>
  defineComponent({ setup: () => () => h(ThemeProvider, { themeConfig: config }, () => h(Probe)) });

function clientHtml(root: Component): string {
  const host = document.createElement('div');
  createApp(root).mount(host);
  return host.innerHTML;
}

describe('useThemeIcons', () => {
  it('returns empty records without a provider', async () => {
    expect(probeOf(await renderToString(createSSRApp(Probe)))).toEqual({ icons: {}, partIconNames: {} });
  });

  it('returns the provided theme fields, the same on the server and the first client render', async () => {
    const expected = { icons: themeConfig.icons, partIconNames: themeConfig.partIconNames };
    const server = await renderToString(createSSRApp(themed(themeConfig)));
    expect(probeOf(server)).toEqual(expected);
    expect(probeOf(clientHtml(themed(themeConfig)))).toEqual(expected);
  });

  it('returns empty records for a theme without the fields', async () => {
    const bare = defineThemeConfig({ name: 'bare', components: {} });
    expect(probeOf(await renderToString(createSSRApp(themed(bare))))).toEqual({ icons: {}, partIconNames: {} });
  });

  it('follows a changed provider prop', async () => {
    const config = ref(themeConfig);
    const app = defineComponent({
      setup: () => () => h(ThemeProvider, { themeConfig: config.value }, () => h(Probe)),
    });
    const host = document.createElement('div');
    createApp(app).mount(host);
    expect(probeOf(host.innerHTML)).toMatchObject({ partIconNames: { select: { dropdownIcon: 'star' } } });
    config.value = defineThemeConfig({
      name: 'next',
      components: {},
      partIconNames: { select: { dropdownIcon: 'x' } },
    });
    await nextTick();
    expect(probeOf(host.innerHTML)).toEqual({ icons: {}, partIconNames: { select: { dropdownIcon: 'x' } } });
  });
});
