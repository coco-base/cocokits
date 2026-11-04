import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { tabsAnatomy } from '@cocokits/machines/tabs';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckTabsImports } from '../index';

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

const template = `<div cckTabs aria-label="x"><div cckTab label="A">a</div></div>`;

describe('Tabs theme', () => {
  it('puts the theme attribute on every part with an element', async () => {
    await render(template, { imports: [...CckTabsImports], providers: [provideCckTheme(themeConfig)] });
    const { root, list, trigger, triggerLabel, indicator, panel } = tabsAnatomy.classes;
    for (const className of [root, list, trigger, triggerLabel, indicator, panel]) {
      expect(document.querySelector(`.${className}`)?.getAttribute('data-probe'), className).toBe('on');
    }
    expect(screen.getByRole('tab').getAttribute('data-probe')).toBe('on');
  });

  it('renders no theme attribute without a theme', async () => {
    await render(template, { imports: [...CckTabsImports] });
    expect(document.querySelector('[data-probe]')).toBeNull();
  });
});
