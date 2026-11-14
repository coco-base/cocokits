import { heartIcon, plusIcon } from '@cocokits/icons';
import { IconProvider, ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig, cocokitsThemeIcons } from '@cocokits/theme-cocokits';
import { defineComponent, h, type Component, type VNode } from 'vue';

/** The icons the tests draw by name: the theme's icons, `heart` and `plus`. */
export const testIcons = { ...cocokitsThemeIcons, heart: heartIcon, plus: plusIcon };

/** A component that renders the nodes inside the cocokits theme, with optional overrides. */
export const themed = (
  renderFn: () => VNode | VNode[],
  overrides?: Record<string, Record<string, string | boolean | null>>,
): Component =>
  defineComponent({
    setup: () => () =>
      h(IconProvider, { icons: testIcons }, () =>
        h(ThemeProvider, { themeConfig: cocokitsThemeConfig, overrides }, renderFn),
      ),
  });
