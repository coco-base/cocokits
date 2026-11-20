import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { provideDirection, useDirection, type Direction } from '../src/index';

const Probe = defineComponent({
  props: { dir: { type: String, default: undefined } },
  setup(props) {
    const dir = useDirection(() => props.dir as Direction | undefined);
    return () => h('i', { 'data-dir': dir.value });
  },
});

describe('direction runtime', () => {
  it('defaults to ltr without a provider', async () => {
    expect(await renderToString(createSSRApp(Probe))).toContain('data-dir="ltr"');
  });

  it('uses the app-wide setting', async () => {
    const app = createSSRApp(Probe);
    provideDirection('rtl', app);
    expect(await renderToString(app)).toContain('data-dir="rtl"');
  });

  it('uses the nearest provider over the app setting', async () => {
    const Inner = defineComponent({ setup: () => () => h(Probe) });
    const Provider = defineComponent({
      setup() {
        provideDirection(() => 'ltr');
        return () => h(Inner);
      },
    });
    const app = createSSRApp(Provider);
    provideDirection('rtl', app);
    expect(await renderToString(app)).toContain('data-dir="ltr"');
  });

  it('lets the prop win over the provided direction', async () => {
    const Provider = defineComponent({
      setup() {
        provideDirection('rtl');
        return () => h(Probe, { dir: 'ltr' });
      },
    });
    expect(await renderToString(createSSRApp(Provider))).toContain('data-dir="ltr"');
  });
});
