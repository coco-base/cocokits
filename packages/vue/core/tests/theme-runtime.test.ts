import { createSSRApp, defineComponent, h, ref, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { defineAnatomy, defineThemeConfig, type ThemeOptionValues } from '@cocokits/shared';
import { provideThemeOptions, ThemeProvider, useThemeAttrs } from '../src/index';

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    box: {
      variant: { attrName: 'variant', values: ['a', 'b'], default: 'a' },
      color: { attrName: 'cck-color', values: ['x', 'y'], default: 'x' },
      size: { attrName: 'size', values: ['sm', 'md', 'lg'], default: 'md' },
      tone: { attrName: 'tone', values: ['soft'], default: 'soft', partNames: ['content'] },
    },
  },
});

const anatomy = defineAnatomy({
  block: 'box',
  parts: {
    root: { name: 'Root', description: 'The host.' },
    content: { name: 'Content', description: 'The content.' },
  },
});

const Probe = defineComponent({
  setup() {
    const attrs = useThemeAttrs(anatomy);
    return () => h('i', { 'data-probe': JSON.stringify(attrs.value.root) });
  },
});

function wrapper(options: () => ThemeOptionValues): Component {
  return defineComponent({
    setup() {
      provideThemeOptions('box', options);
      return () => h(Probe);
    },
  });
}

async function attrsOf(root: Component, props: Record<string, unknown> = {}): Promise<Record<string, string>> {
  const markup = await renderToString(createSSRApp(root, props));
  const raw = /data-probe="([^"]*)"/.exec(markup)?.[1] ?? '';
  return JSON.parse(raw.replaceAll('&quot;', '"')) as Record<string, string>;
}

function themed(child: Component, overrides?: Record<string, ThemeOptionValues>): Component {
  return defineComponent({ setup: () => () => h(ThemeProvider, { themeConfig, overrides }, () => h(child)) });
}

describe('vue-core theme runtime', () => {
  it('registers the provider as CckThemeProvider', () => {
    expect((ThemeProvider as unknown as { name: string }).name).toBe('CckThemeProvider');
  });

  it('returns an empty record without a provider and never throws', async () => {
    expect(await attrsOf(Probe)).toEqual({});
  });

  it('resolves the config defaults', async () => {
    expect(await attrsOf(themed(Probe))).toEqual({ 'data-variant': 'a', 'data-cck-color': 'x', 'data-size': 'md' });
  });

  it('resolves the record of every anatomy part in one call', () => {
    const Parts = defineComponent({
      setup() {
        const attrs = useThemeAttrs(anatomy);
        return () => h('i', { 'data-probe': JSON.stringify(attrs.value) });
      },
    });
    return renderToString(createSSRApp(themed(Parts))).then((markup) => {
      const raw = /data-probe="([^"]*)"/.exec(markup)?.[1] ?? '';
      expect(JSON.parse(raw.replaceAll('&quot;', '"'))).toEqual({
        root: { 'data-variant': 'a', 'data-cck-color': 'x', 'data-size': 'md' },
        content: { 'data-tone': 'soft' },
      });
    });
  });

  it('applies the provider override over the default', async () => {
    const attrs = await attrsOf(themed(Probe, { box: { size: 'lg', variant: null } }));
    expect(attrs).toEqual({ 'data-cck-color': 'x', 'data-size': 'lg' });
  });

  it('gives the own option the top precedence, and undefined defers down', async () => {
    const own = themed(
      wrapper(() => ({ size: 'sm', color: undefined, variant: undefined })),
      {
        box: { size: 'lg', color: 'y' },
      },
    );
    expect(await attrsOf(own)).toEqual({ 'data-variant': 'a', 'data-cck-color': 'y', 'data-size': 'sm' });
  });

  it('removes an attribute with null, also over an override', async () => {
    const own = themed(
      wrapper(() => ({ size: null })),
      { box: { size: 'lg' } },
    );
    expect(await attrsOf(own)).toEqual({ 'data-variant': 'a', 'data-cck-color': 'x' });
  });

  it('ignores options provided for another component', async () => {
    const other = defineComponent({
      setup() {
        provideThemeOptions('other', () => ({ size: 'lg' }));
        return () => h(Probe);
      },
    });
    expect((await attrsOf(themed(other)))['data-size']).toBe('md');
  });

  it('follows a changed option getter', async () => {
    const size = ref('sm');
    const own = themed(wrapper(() => ({ size: size.value })));
    expect((await attrsOf(own))['data-size']).toBe('sm');
    size.value = 'lg';
    expect((await attrsOf(own))['data-size']).toBe('lg');
  });
});
