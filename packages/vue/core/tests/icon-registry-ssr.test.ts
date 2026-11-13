// @vitest-environment node
import { createSSRApp, defineComponent, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it, vi } from 'vitest';
import { checkIcon, searchIcon } from '@cocokits/icons';
import { IconProvider, useIconRegistry } from '../src/index';

/** Renders which of the two names the registry of this tree knows. */
const Probe = defineComponent({
  setup() {
    const registry = useIconRegistry();
    return () => h('i', { 'data-has': ['search', 'check'].filter((name) => registry.get(name)).join(',') });
  },
});

const render = (root: Component): Promise<string> => renderToString(createSSRApp(root));

describe('icon registry on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('keeps the icons of two renders in one process apart', async () => {
    const withSearch = defineComponent({
      setup: () => () => h(IconProvider, { icons: { search: searchIcon } }, () => h(Probe)),
    });
    const bare = defineComponent({ setup: () => () => h(IconProvider, null, () => h(Probe)) });
    const first = await render(withSearch);
    const second = await render(bare);
    const third = await render(withSearch);
    expect(first).toContain('data-has="search,check"');
    expect(second).toContain('data-has="check"');
    expect(third).toBe(first);
  });

  it('draws only the base icons without a provider, and a register call writes nothing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const Writer = defineComponent({
      setup() {
        useIconRegistry().registerIcons({ search: checkIcon });
        return () => h(Probe);
      },
    });
    expect(await render(Writer)).toContain('data-has="check"');
    expect(await render(Probe)).toContain('data-has="check"');
    expect(error).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });
});
