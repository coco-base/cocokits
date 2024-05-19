import { addons } from '@storybook/preview-api';
import { fromEventPattern } from 'rxjs';

import { SvgIcon } from '@coco-kits/theme-core';

import { THEME_CHANGED_EVENT_NAME } from '../config/constants';

export interface ThemeChangedEvent {
  name: string;
  iconList: Record<string, SvgIcon>;
}

export const themeChanged$ = fromEventPattern<ThemeChangedEvent>(
  (handler) => addons.getChannel().on(THEME_CHANGED_EVENT_NAME, handler),
  (handler) => addons.getChannel().off(THEME_CHANGED_EVENT_NAME, handler)
);
