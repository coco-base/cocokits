import { Channel } from '@storybook/channels';
import { fromStorybookEvent } from '../../utils/rxjs.util';
import { EVENTS } from '../../config/events.config';
import { SelectedTheme } from '../../model/theme.model';
import { map, Observable } from 'rxjs';
import { StoryControlDialogProps } from '../../features/story-control/story-control-dialog';
import events from '@storybook/core/core-events';
import { PreparedStory } from '@storybook/types';
import { StoreState } from '../../features/story-control/story-control.model';
import { TokenId } from '@cocokits/core';

export type OpenStoryControlParams = StoryControlDialogProps;

export interface PageChangeEvent {
  storyId: string; // theme-config-tokens--docs or ui-components-button--default
}

export abstract class GlobalEventBase {
  protected channel: Channel;

  // Pages
  public newStory$: Observable<PreparedStory>;
  public pageChange$: Observable<PageChangeEvent>;

  // Theme Selection
  public openThemeSelection$: Observable<void>;
  public closeThemeSelection$: Observable<SelectedTheme>;

  // Story Control
  public openStoryControl$: Observable<OpenStoryControlParams>;
  public closeStoryControl$: Observable<void>;
  public changeStoryControl$: Observable<StoreState>;

  // Token
  public changeTokenInfo$: Observable<TokenId>;
  public closeTokenInfo$: Observable<TokenId>;

  public dispatch = {
    // Render
    newStory: (story: PreparedStory) => this.channel.emit(EVENTS.NEW_STORY, story),

    // Theme Selection
    openThemeSelection: () => this.channel.emit(EVENTS.OPEN_THEME_SELECTION),
    closeThemeSelection: (e: SelectedTheme) => this.channel.emit(EVENTS.THEME_SELECTION_CLOSED, e),

    // Story Control
    openStoryControl: (params: OpenStoryControlParams) => this.channel.emit(EVENTS.OPEN_STORY_CONTROL, params),
    closeStoryControl: () => this.channel.emit(EVENTS.CLOSE_STORY_CONTROL),
    changeStoryControl: (event: StoreState) => this.channel.emit(EVENTS.CHANGE_STORY_CONTROL, event),

    // Token
    changeTokenInfo: (tokenId: TokenId) => this.channel.emit(EVENTS.CHANGE_TOKEN_INFO, tokenId),
    closeTokenInfo: () => this.channel.emit(EVENTS.CLOSE_TOKEN_INFO),
  };

  constructor(channel: Channel) {
    this.channel = channel;

    // Render
    this.newStory$ = fromStorybookEvent<PreparedStory>(this.channel, EVENTS.NEW_STORY);
    this.pageChange$ = fromStorybookEvent<{ storyId: string }>(this.channel, events.SET_CURRENT_STORY).pipe(
      map((event) => ({ storyId: event.storyId }))
    );

    // Theme Selection
    this.openThemeSelection$ = fromStorybookEvent<void>(this.channel, EVENTS.OPEN_THEME_SELECTION);
    this.closeThemeSelection$ = fromStorybookEvent<SelectedTheme>(this.channel, EVENTS.THEME_SELECTION_CLOSED);

    // Story Control
    this.openStoryControl$ = fromStorybookEvent<OpenStoryControlParams>(this.channel, EVENTS.OPEN_STORY_CONTROL);
    this.closeStoryControl$ = fromStorybookEvent<void>(this.channel, EVENTS.CLOSE_STORY_CONTROL);
    this.changeStoryControl$ = fromStorybookEvent<StoreState>(this.channel, EVENTS.CHANGE_STORY_CONTROL);

    this.changeTokenInfo$ = fromStorybookEvent<TokenId>(this.channel, EVENTS.CHANGE_TOKEN_INFO);
    this.closeTokenInfo$ = fromStorybookEvent<TokenId>(this.channel, EVENTS.CLOSE_TOKEN_INFO);
  }
}
