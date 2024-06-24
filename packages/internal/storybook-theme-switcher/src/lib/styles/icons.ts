import type { ThemeSvgIcon } from '@cocokits/common-types';
import { CckThemeId } from '@cocokits/storybook-theme-switcher';
import { svgIconMap as svgIconMapDefaultTheme } from '@cocokits/theme-default';
import { svgIconMap as svgIconMapFrameXTheme } from '@cocokits/theme-frame-x';

export const themeIconSvg: Record<CckThemeId, Record<string, ThemeSvgIcon>> = {
  default: svgIconMapDefaultTheme,
  'frame-x': svgIconMapFrameXTheme,
};
