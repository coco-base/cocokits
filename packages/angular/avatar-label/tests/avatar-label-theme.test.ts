import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { avatarLabelAnatomy } from '@cocokits/machines/avatar-label';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckAvatarLabelImports } from '../index';

// An option that targets every part of the anatomy.
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [avatarLabelAnatomy.block]: {
      probe: {
        attrName: 'probe',
        values: ['on'],
        default: 'on',
        partNames: Object.keys(avatarLabelAnatomy.parts),
      },
    },
  },
});

describe('CckAvatarLabel theme', () => {
  it('puts the theme attribute on every rendered part', async () => {
    const { container } = await render(`<cck-avatar-label name="Ada" description="Maths"></cck-avatar-label>`, {
      imports: [...CckAvatarLabelImports],
      providers: [provideCckTheme(themeConfig)],
    });
    for (const className of Object.values(avatarLabelAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});
