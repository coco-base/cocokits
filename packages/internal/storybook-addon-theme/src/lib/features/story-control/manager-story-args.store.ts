import events from '@storybook/core/core-events';
import { addons } from '@storybook/manager-api';
import { PreparedStory, StoryId } from '@storybook/types';

import { getInstance, reduceMerge } from '@cocokits/common-utils';

import { StoryControlStoreBase } from './story-args.store.base';
import { StoreState } from './story-control.model';
import { getStoryControls } from './story-control.util';
import { GlobalEvent } from '../../data-access/global-event/manager-global-event';
import { ThemeEvent } from '../../data-access/theme-event/manager-theme-event';
import { AddonParameters, StoryArgs } from '../../model/addon.model';
import { ThemeChangeEvent } from '../../model/event.model';

export class StoryControlStore extends StoryControlStoreBase {
  private themeEvent = getInstance(ThemeEvent);
  protected globalEvent = getInstance(GlobalEvent);

  protected store = new Map<StoryId, StoreState>();

  constructor() {
    super(addons.getChannel());
    this.globalEvent.newStory$.subscribe((story) => this.onNewStory(story));
    this.change.addListener(events.UPDATE_STORY_ARGS, (e) => this.onUpdateArgs(e));
    this.themeEvent.themeChange$.subscribe((theme) => this.onThemeChange(theme));
  }

  private onNewStory(story: PreparedStory) {
    const theme = this.themeEvent.getCurrentTheme();
    const state = this.getInitializeState(story, theme);

    this.store.set(story.id, state);
    this.globalEvent.dispatch.changeStoryControl(state);
    this.updateStoryArgs(story.id, state.args);
  }

  private onUpdateArgs({ storyId, updatedArgs }: { storyId: string; updatedArgs: StoryArgs }) {
    const cckUpdatedArgs = updatedArgs.cckControl;
    const currentState = this.store.get(storyId);

    if (!currentState || !cckUpdatedArgs) {
      return;
    }

    const newState: StoreState = {
      ...currentState,
      args: { ...currentState.args, ...cckUpdatedArgs },
    };

    this.store.set(storyId, newState);
    this.globalEvent.dispatch.changeStoryControl(newState);
  }

  private onThemeChange(theme: ThemeChangeEvent) {
    this.store.forEach((currentState, storyId) => {
      const state = this.getInitializeState(currentState.story, theme);
      this.store.set(storyId, state);
      this.globalEvent.dispatch.changeStoryControl(state);

      this.updateStoryArgs(storyId, state.args, true);
    });
  }

  private getInitializeState(story: PreparedStory, theme: ThemeChangeEvent): StoreState {
    const parameters = story.parameters as AddonParameters;
    const uiBaseComponentName = parameters.cckAddon.componentName;

    if (!uiBaseComponentName) {
      throw new Error(`Component name is missing in the story parameters for story ID: ${story.id}`);
    }

    const themeComponentConfig = theme.themeConfig.components[uiBaseComponentName];

    if (!themeComponentConfig) {
      throw new Error(
        `Component config is missing in the themeConfig of ${theme.id} for component name: ${uiBaseComponentName}`
      );
    }

    const controls = getStoryControls(story, theme);
    const args: StoreState['args'] = reduceMerge(controls, (value) => ({ [value.storyArgKey]: value.default }), {
      themeComponentConfig: theme.themeConfig.components[uiBaseComponentName],
    });

    const state = { storyId: story.id, componentName: uiBaseComponentName, story, args, controls };

    return state;
  }
}
