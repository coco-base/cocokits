import { addons } from '@storybook/preview-api';
import { StoryId } from '@storybook/types';

import { getInstance } from '@cocokits/common-utils';

import { StoryControlStoreBase } from './story-args.store.base';
import { StoreState } from './story-control.model';
import { GlobalEvent } from '../../data-access/global-event/preview-global-event';
import { ThemeEvent } from '../../data-access/theme-event/preview-theme-event';

export class StoryControlStore extends StoryControlStoreBase {
  protected globalEvent = getInstance(GlobalEvent);
  private themeEvent = getInstance(ThemeEvent);
  protected store = new Map<StoryId, StoreState>();

  constructor() {
    super(addons.getChannel());
    this.globalEvent.changeStoryControl$.subscribe((state) => {
      this.store.set(state.storyId, state);
    });
  }
}
