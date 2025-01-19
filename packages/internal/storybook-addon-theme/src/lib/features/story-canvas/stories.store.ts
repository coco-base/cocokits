import events from '@storybook/core/core-events';
import { addons } from '@storybook/preview-api';
import { StoryId } from '@storybook/types';
import { filter, map, Observable, startWith, Subject, takeWhile } from 'rxjs';

import { fromStorybookEvent } from '../../utils/rxjs.util';

export interface StoriesStoreState {
  canRender: boolean;
}

interface StorybookStoryRenderPhaseChanged {
  newPhase: 'completed' | 'rendering' | 'loading';
  storyId: StoryId;
}

const MAX_CONCURRENT_RENDERS = 1;

export class StoriesStore {
  private renderingStoriesId: StoryId[] = [];
  private waitingQueue: StoryId[] = [];

  private renderingStoriesId$ = new Subject<StoryId[]>();

  constructor() {
    fromStorybookEvent<StorybookStoryRenderPhaseChanged>(addons.getChannel(), events.STORY_RENDER_PHASE_CHANGED)
      .pipe(filter((e) => e.newPhase === 'completed'))
      .subscribe((e) => {
        this.renderingStoriesId = this.renderingStoriesId.filter((id) => id !== e.storyId);

        // Move a story from the waiting queue to the rendering list if:
        // 1. There is a story in the waiting queue.
        // 2. There is available capacity to render a new story.
        if (this.waitingQueue.length > 0 && this.renderingStoriesId.length < MAX_CONCURRENT_RENDERS) {
          const storyId = this.waitingQueue.shift();
          if (storyId) {
            this.renderingStoriesId.push(storyId);
          }
        }

        this.renderingStoriesId$.next(this.renderingStoriesId);
      });
  }

  public registerNewStory(storyId: StoryId) {
    if (this.renderingStoriesId.length < MAX_CONCURRENT_RENDERS) {
      this.renderingStoriesId.push(storyId);
      this.renderingStoriesId$.next(this.renderingStoriesId);
    } else {
      this.waitingQueue.push(storyId);
    }
  }

  public removeStory(storyId: StoryId) {
    this.renderingStoriesId = this.renderingStoriesId.filter((id) => id !== storyId);
    this.waitingQueue = this.waitingQueue.filter((id) => id !== storyId);
    this.renderingStoriesId$.next(this.renderingStoriesId);
  }

  public canRenderStory$(storyID: StoryId): Observable<boolean> {
    return this.renderingStoriesId$.pipe(
      map((renderingStoriesId) => renderingStoriesId.includes(storyID)),
      startWith(this.renderingStoriesId.includes(storyID)),
      takeWhile((canRenderStory) => !canRenderStory, true)
    );
  }
}
