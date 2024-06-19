import type { ThemeSvgIcon } from '@coco-kits/common-types';
import { svgIconMap } from '@coco-kits/theme-default';
import { CckThemeName } from '@coco-kits/storybook-theme-switcher';

export const themeIconSvg: Record<CckThemeName, Record<string, ThemeSvgIcon>> = {
  Default: svgIconMap,
  FrameX: {
    'caret-alt-to-right-2': {
      name: 'caret-alt-to-right-2',
      content: '<path d="m128 128 192 128-192 128zm224 256V128h-32v256z" />',
      viewBox: '0 0 512 512',
    },
    'caret-alt-to-bottom-2': {
      name: 'caret-alt-to-bottom-2',
      content: '<path d="M384 128 256 320 128 128zM128 352h256v-32H128z" />',
      viewBox: '0 0 512 512',
    },
  },
  Theme2: {},
};
