import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { badgeContainerAnatomy } from '@cocokits/machines/badge-container';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckBadgeContainerImports } from '../index';

// An option that targets every part of the anatomy.
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [badgeContainerAnatomy.block]: {
      probe: {
        attrName: 'probe',
        values: ['on'],
        default: 'on',
        partNames: Object.keys(badgeContainerAnatomy.parts),
      },
    },
  },
});

describe('CckBadgeContainer theme', () => {
  it('puts the theme attribute on every rendered part', async () => {
    const { container } = await render(`<cck-badge-container></cck-badge-container>`, {
      imports: [...CckBadgeContainerImports],
      providers: [provideCckTheme(themeConfig)],
    });
    for (const className of Object.values(badgeContainerAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});
