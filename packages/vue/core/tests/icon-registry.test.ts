// @vitest-environment jsdom
import { createApp, defineComponent, h, nextTick, ref, shallowRef, type Component } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IconRegistry } from '@cocokits/cdk/icon-registry';
import { checkIcon, chevronDownIcon, searchIcon, type Icon } from '@cocokits/icons';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { IconProvider, ThemeProvider, useIconRegistry, useThemeConfig } from '../src/index';

afterEach(() => {
  vi.restoreAllMocks();
});

function mount(root: Component): HTMLElement {
  const host = document.createElement('div');
  createApp(root).mount(host);
  return host;
}

/** Collects the registry the probe sees. */
function probe(seen: IconRegistry[]): Component {
  return defineComponent({
    setup() {
      seen.push(useIconRegistry());
      return () => h('i');
    },
  });
}

describe('IconProvider and useIconRegistry', () => {
  it('registers icons at creation and keeps the base icons', () => {
    const seen: IconRegistry[] = [];
    const Probe = probe(seen);
    mount(defineComponent({ setup: () => () => h(IconProvider, { icons: { search: searchIcon } }, () => h(Probe)) }));
    expect(seen[0]?.get('search')).toBe(searchIcon);
    expect(seen[0]?.get('check')).toBe(checkIcon);
  });

  it('registers lazy icons and loads them once', async () => {
    const seen: IconRegistry[] = [];
    const Probe = probe(seen);
    const load = vi.fn(() => Promise.resolve(searchIcon));
    mount(defineComponent({ setup: () => () => h(IconProvider, { lazyIcons: { search: load } }, () => h(Probe)) }));
    expect(seen[0]?.has('search')).toBe(true);
    expect(seen[0]?.get('search')).toBeUndefined();
    await Promise.all([seen[0]?.load('search'), seen[0]?.load('search')]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(seen[0]?.get('search')).toBe(searchIcon);
  });

  it('falls back to the outer provider in a nested one', () => {
    const seen: IconRegistry[] = [];
    const Probe = probe(seen);
    mount(
      defineComponent({
        setup: () => () =>
          h(IconProvider, { icons: { search: searchIcon } }, () =>
            h(IconProvider, { icons: { check: chevronDownIcon } }, () => h(Probe)),
          ),
      }),
    );
    expect(seen[0]?.get('search')).toBe(searchIcon);
    expect(seen[0]?.get('check')).toBe(chevronDownIcon);
  });

  it('registers the new entries of a changed record, and replaces names', async () => {
    const seen: IconRegistry[] = [];
    const Probe = probe(seen);
    const icons = shallowRef<Record<string, Icon>>({ search: searchIcon });
    mount(defineComponent({ setup: () => () => h(IconProvider, { icons: icons.value }, () => h(Probe)) }));
    icons.value = { search: checkIcon, more: chevronDownIcon };
    await nextTick();
    expect(seen[0]?.get('search')).toBe(checkIcon);
    expect(seen[0]?.get('more')).toBe(chevronDownIcon);
  });

  it('does not reload an icon when a parent re-render passes the same loader', async () => {
    const seen: IconRegistry[] = [];
    const Probe = probe(seen);
    const load = vi.fn(() => Promise.resolve(searchIcon));
    const tick = ref(0);
    mount(
      defineComponent({
        setup: () => () => {
          tick.value.toFixed();
          return h(IconProvider, { lazyIcons: { search: load } }, () => h(Probe));
        },
      }),
    );
    await seen[0]?.load('search');
    tick.value++;
    await nextTick();
    await seen[0]?.load('search');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('gives a read-only registry of the base icons without a provider, and logs a register call', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const seen: IconRegistry[] = [];
    mount(probe(seen));
    const registry = seen[0];
    if (registry === undefined) throw new Error('The probe saw no registry.');
    expect(registry.get('check')).toBe(checkIcon);
    registry.registerIcons({ search: searchIcon });
    registry.registerIcon('x', () => Promise.resolve(searchIcon));
    expect(registry.has('search')).toBe(false);
    expect(registry.has('x')).toBe(false);
    expect(error).toHaveBeenCalledTimes(2);
    expect(error.mock.calls[0]?.[0]).toContain('CocoKits:');
  });

  it('stops notifying after the provider unmounts', async () => {
    const seen: IconRegistry[] = [];
    const Probe = probe(seen);
    const shown = ref(true);
    mount(
      defineComponent({
        setup: () => () => (shown.value ? h(IconProvider, null, () => h(Probe)) : h('i')),
      }),
    );
    const listener = vi.fn();
    seen[0]?.subscribe(listener);
    shown.value = false;
    await nextTick();
    seen[0]?.registerIcons({ search: searchIcon });
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('useThemeConfig', () => {
  const themeConfig = defineThemeConfig({
    name: 'test',
    components: { select: { icons: { dropdownIcon: 'chevron-down' } } },
  });
  const reader = (seen: unknown[]): Component =>
    defineComponent({
      setup() {
        const config = useThemeConfig();
        return () => {
          seen.push(config.value);
          return h('i');
        };
      },
    });

  it('is undefined without a provider and the provided config with one', () => {
    const seen: unknown[] = [];
    const Reader = reader(seen);
    mount(Reader);
    mount(defineComponent({ setup: () => () => h(ThemeProvider, { themeConfig }, () => h(Reader)) }));
    expect(seen).toEqual([undefined, themeConfig]);
  });

  it('follows a changed provider prop', async () => {
    const seen: unknown[] = [];
    const Reader = reader(seen);
    const config = shallowRef<ThemeConfig>(themeConfig);
    const next = defineThemeConfig({ name: 'next', components: {} });
    mount(defineComponent({ setup: () => () => h(ThemeProvider, { themeConfig: config.value }, () => h(Reader)) }));
    config.value = next;
    await nextTick();
    expect(seen.at(-1)).toBe(next);
  });
});
