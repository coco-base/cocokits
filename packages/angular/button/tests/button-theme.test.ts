import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { buttonAnatomy } from '@cocokits/machines/button';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckButtonImports } from '../index';

// An option that targets every part of the anatomy.
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [buttonAnatomy.block]: {
      probe: {
        attrName: 'probe',
        values: ['on'],
        default: 'on',
        partNames: Object.keys(buttonAnatomy.parts),
      },
    },
  },
});

describe('CckButton theme', () => {
  it('puts the theme attribute on every rendered part', async () => {
    const { container } = await render(`<button cckButton>Save</button>`, {
      imports: [...CckButtonImports],
      providers: [provideCckTheme(themeConfig)],
    });
    for (const className of Object.values(buttonAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});
