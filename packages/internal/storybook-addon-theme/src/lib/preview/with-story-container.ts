import { PartialStoryFn, Renderer } from '@storybook/types';
import { getInstance } from '@cocokits/common-utils';
import { ThemeEvent } from '../data-access/theme-event/preview-theme-event';
import { ColorModeEvent } from '../data-access/colo-mode-event/manager-color-mode-event';

export const WithStoryContainer = (StoryFn: PartialStoryFn<Renderer>) => {
  getInstance(ThemeEvent);
  getInstance(ColorModeEvent);

  return StoryFn();
};
