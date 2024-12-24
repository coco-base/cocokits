import { Args, PreparedStory, StoryId } from '@storybook/types';
import { Channel } from '@storybook/channels';
import events from '@storybook/core/core-events';
import { StoreState } from './story-control.model';
import { distinctUntilChanged, filter, map, Observable, startWith } from 'rxjs';
import { GlobalEventBase } from '../../data-access/global-event/global-event.base';

export abstract class StoryControlStoreBase {
  protected abstract store: Map<StoryId, StoreState>;
  protected abstract globalEvent: GlobalEventBase;

  constructor(protected change: Channel) {}

  public updateStoryArgs(storyId: StoryId, args: Args, remount = false) {
    const currentArgs = this.store.get(storyId)?.args;

    if (!currentArgs) {
      throw new Error(`Story has not been registered in the StoryControlStore for story ID: ${storyId}`);
    }

    const updatedArgs = { cckControl: { ...currentArgs, ...args } };
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

    if (!storeState) {
      throw new Error(`Story state is missing for story ID: ${storyId}`);
    }

    return storeState.args;
  }

  public getArgs$(storyId: StoryId): Observable<Args> {
    return this.globalEvent.changeStoryControl$.pipe(
      map(() => this.getArgs(storyId)),
      distinctUntilChanged(),
      startWith(this.getArgs(storyId))
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
