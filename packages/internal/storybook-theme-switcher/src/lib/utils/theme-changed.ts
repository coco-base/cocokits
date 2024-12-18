import { addons } from '@storybook/preview-api';
import { distinctUntilChanged, fromEventPattern, shareReplay, startWith } from 'rxjs';

import { getSelectedCckTheme } from '../components/theme-switcher.utils';
import { CCK_THEME_CHANGED_EVENT_NAME } from '../config/cck-theme.config';
import { CckThemeChangedEvent } from '../config/cck-themes.model';

export const themeChanged$ = fromEventPattern<CckThemeChangedEvent>(
  (handler) => addons.getChannel().on(CCK_THEME_CHANGED_EVENT_NAME, handler),
  (handler) => addons.getChannel().off(CCK_THEME_CHANGED_EVENT_NAME, handler)
).pipe(startWith(getSelectedCckTheme()), distinctUntilChanged(), shareReplay());
