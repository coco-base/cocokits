// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { tabsAnatomy } from '@cocokits/machines/tabs';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { mountView, tabsView } from './fixtures';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [tabsAnatomy.block]: {
      probe: {
        attrName: 'probe',
        values: ['on'],
        default: 'on',
        partNames: ['root', 'list', 'trigger', 'triggerLabel', 'indicator', 'panel'],
      },
    },
  },
});

describe('Tabs theme', () => {
  it('puts the theme attribute on every part', async () => {
    render(
      defineComponent({
        render: () => h(ThemeProvider, { themeConfig }, () => tabsView({ root: { modelValue: 'account' } })()),
      }),
    );
    await nextTick();
    const { root, list, trigger, triggerLabel, indicator, panel } = tabsAnatomy.classes;
    for (const className of [root, list, trigger, triggerLabel, indicator, panel]) {
      expect(document.querySelector(`.${className}`)?.getAttribute('data-probe'), className).toBe('on');
    }
    expect(screen.getAllByRole('tab')[0]?.getAttribute('data-probe')).toBe('on');
  });

  it('renders no theme attribute without a theme', async () => {
    mountView(tabsView({ root: { modelValue: 'account' } }));
    await nextTick();
    expect(document.querySelector('[data-probe]')).toBeNull();
  });
});
