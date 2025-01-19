import { Channel } from '@storybook/channels';
import events from '@storybook/core/core-events';
import { Args, StoryId } from '@storybook/types';
import { distinctUntilChanged, filter, map, Observable, startWith } from 'rxjs';

import { deepComparator } from '@cocokits/common-utils';

import { StoreState } from './story-control.model';
import { GlobalEventBase } from '../../data-access/global-event/global-event.base';
import { ThemeEventBase } from '../../data-access/theme-event/theme-event.base';
import { AddonParameters } from '../../model/addon.model';

export abstract class StoryControlStoreBase {
  protected abstract store: Map<StoryId, StoreState>;
  protected abstract globalEvent: GlobalEventBase;

  constructor(
    protected change: Channel,
    protected themeEvent: ThemeEventBase
  ) {}

  public updateStoryArgs(storyId: StoryId, args: Args, remount = false) {
    const state = this.store.get(storyId);
    if (!state) {
      throw new Error(`Story has not been registered in the StoryControlStore for story ID: ${storyId}`);
    }

    const parameters = state.story.parameters as AddonParameters;
    const currentArgs = state.args;

    const cckExampleArgs = parameters.cckAddon.exampleStory?.templateArgsMap?.[this.themeEvent.currentTheme.id];
    const cssArgs = parameters.cckAddon.exampleStory?.cssArgsMap?.[this.themeEvent.currentTheme.id];
    const cckExampleCssVariables = Object.entries(cssArgs ?? {})
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    const updatedArgs = {
      cckControl: { ...currentArgs, ...args },
      cckExampleArgs,
      cckExampleCssVariables,
    };

    this.change.emit(events.UPDATE_STORY_ARGS, { storyId, updatedArgs });

    if (remount) {
      this.change.emit(events.FORCE_REMOUNT, { storyId });
    }
  }

  public getState(storyId: StoryId): StoreState {
    const storeState = this.store.get(storyId);

    if (!storeState) {
      throw new Error(`Story state is missing for story ID: ${storyId}`);
    }

    return storeState;
  }
  public getArgs(storyId: StoryId): Args {
    const storeState = this.store.get(storyId);
    return storeState?.args ?? {};
  }

  public getArgs$(storyId: StoryId): Observable<Args> {
    return this.globalEvent.changeStoryControl$.pipe(
      map(() => this.getArgs(storyId)),
      startWith(this.getArgs(storyId)),
      distinctUntilChanged(deepComparator)
    );
  }

  public getState$(storyId: StoryId): Observable<StoreState> {
    return this.globalEvent.changeStoryControl$.pipe(
      map(() => this.store.get(storyId)),
      startWith(this.store.get(storyId)),
      distinctUntilChanged(),
      filter((state) => !!state)
    );
  }
}
