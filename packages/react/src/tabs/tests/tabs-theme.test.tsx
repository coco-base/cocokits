// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { tabsAnatomy } from '@cocokits/machines/tabs';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { Example } from './fixtures';

afterEach(cleanup);

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
  it('puts the theme attribute on every part', () => {
    render(
      <ThemeProvider themeConfig={themeConfig}>
        <Example defaultValue="account" />
      </ThemeProvider>,
    );
    const { root, list, trigger, triggerLabel, indicator, panel } = tabsAnatomy.classes;
    for (const className of [root, list, trigger, triggerLabel, indicator, panel]) {
      expect(document.querySelector(`.${className}`)?.getAttribute('data-probe'), className).toBe('on');
    }
    expect(screen.getAllByRole('tab')[0]?.getAttribute('data-probe')).toBe('on');
  });

  it('renders no theme attribute without a theme', () => {
    render(<Example defaultValue="account" />);
    expect(document.querySelector('[data-probe]')).toBeNull();
  });
});
