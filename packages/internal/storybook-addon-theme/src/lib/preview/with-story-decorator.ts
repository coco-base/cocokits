import { PartialStoryFn, Renderer } from '@storybook/types';

import { getInstance } from '@cocokits/common-utils';

import { ColorModeEvent } from '../data-access/colo-mode-event/manager-color-mode-event';
import { ThemeEvent } from '../data-access/theme-event/preview-theme-event';

export const WithStoryDecorator = (StoryFn: PartialStoryFn<Renderer>) => {
  getInstance(ThemeEvent);
  getInstance(ColorModeEvent);

  return StoryFn();
};
