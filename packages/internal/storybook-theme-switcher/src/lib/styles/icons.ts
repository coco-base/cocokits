import type { ThemeSvgIcon } from '@coco-kits/common-types';
import { CckThemeId } from '@coco-kits/storybook-theme-switcher';
import { svgIconMap as svgIconMapDefaultTheme } from '@coco-kits/theme-default';
import { svgIconMap as svgIconMapFrameXTheme } from '@coco-kits/theme-frame-x';

export const themeIconSvg: Record<CckThemeId, Record<string, ThemeSvgIcon>> = {
  default: svgIconMapDefaultTheme,
  'frame-x': svgIconMapFrameXTheme,
};
