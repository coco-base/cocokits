import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { badgeAnatomy } from '@cocokits/machines/badge';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckBadgeImports } from '../index';

// An option that targets every part of the anatomy.
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [badgeAnatomy.block]: {
      probe: {
        attrName: 'probe',
        values: ['on'],
        default: 'on',
        partNames: Object.keys(badgeAnatomy.parts),
      },
    },
  },
});

describe('CckBadge theme', () => {
  it('puts the theme attribute on every rendered part', async () => {
    const { container } = await render(`<cck-badge [content]="120" [max]="99"></cck-badge>`, {
      imports: [...CckBadgeImports],
      providers: [provideCckTheme(themeConfig)],
    });
    for (const className of Object.values(badgeAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});
