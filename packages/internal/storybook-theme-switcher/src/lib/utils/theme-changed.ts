import { addons } from '@storybook/preview-api';
import { fromEventPattern, distinctUntilChanged, shareReplay } from 'rxjs';

import { THEME_CHANGED_EVENT_NAME, ThemeChangedEvent } from '../config/constants';

export const themeChanged$ = fromEventPattern<ThemeChangedEvent>(
  (handler) => addons.getChannel().on(THEME_CHANGED_EVENT_NAME, handler),
  (handler) => addons.getChannel().off(THEME_CHANGED_EVENT_NAME, handler)
).pipe(distinctUntilChanged(), shareReplay());
