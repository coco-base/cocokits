import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { avatarAnatomy } from '@cocokits/machines/avatar';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckAvatarImports } from '../index';

// An option that targets every part of the anatomy.
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [avatarAnatomy.block]: {
      probe: {
        attrName: 'probe',
        values: ['on'],
        default: 'on',
        partNames: Object.keys(avatarAnatomy.parts),
      },
    },
  },
});

describe('CckAvatar theme', () => {
  it('puts the theme attribute on the root, the image and the fallback', async () => {
    const { container } = await render(
      `<cck-avatar><img cckAvatarImage alt="Ada" /><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>`,
      { imports: [...CckAvatarImports], providers: [provideCckTheme(themeConfig)] },
    );
    for (const className of Object.values(avatarAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});
