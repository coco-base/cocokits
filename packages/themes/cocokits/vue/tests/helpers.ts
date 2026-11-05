import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { defineComponent, h, type Component, type VNode } from 'vue';

/** A component that renders the nodes inside the cocokits theme, with optional overrides. */
export const themed = (
  renderFn: () => VNode | VNode[],
  overrides?: Record<string, Record<string, string | null>>,
): Component =>
  defineComponent({
    setup: () => () => h(ThemeProvider, { themeConfig: cocokitsThemeConfig, overrides }, renderFn),
  });
