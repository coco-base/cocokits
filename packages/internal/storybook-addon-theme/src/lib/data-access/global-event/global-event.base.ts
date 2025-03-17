import { Channel } from '@storybook/channels';
import events from '@storybook/core/core-events';
import { PreparedStory } from '@storybook/types';
import { map, Observable } from 'rxjs';

import { TokenId } from '@cocokits/core';

import { EVENTS } from '../../config/events.config';
import { StoreState } from '../../features/story-control/story-control.model';
import { StoryControlDialogProps } from '../../features/story-control/story-control-dialog';
import { StoryTab } from '../../features/story-doc-page/story-doc-page';
import { SelectedTheme } from '../../model/theme.model';
import { fromStorybookEvent } from '../../utils/rxjs.util';

export type OpenStoryControlParams = StoryControlDialogProps;

export interface PageChangeEvent {
  storyId: string; // theme-config-tokens--docs or ui-components-button--default
}

export interface DocTabChange {
  tabName: StoryTab;
}

export interface DocExampleToggle {
  isOpen: boolean;
  storyName: string;
}

export interface DocOverviewSourceToggle {
  isOpen: boolean;
  storyName: string;
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

  // Doc
  public docTabChange$: Observable<DocTabChange>;
  public docExampleToggle$: Observable<DocExampleToggle>;
  public docOverviewSourceToggle$: Observable<DocOverviewSourceToggle>;

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

    // Doc
    docTabChange: (e: DocTabChange) => this.channel.emit(EVENTS.DOC_TAB_CHANGE, e),
    docExampleToggle: (e: DocExampleToggle) => this.channel.emit(EVENTS.DOC_EXAMPLE_TOGGLE, e),
    docOverviewSourceToggle: (e: DocOverviewSourceToggle) => this.channel.emit(EVENTS.DOC_OVERVIEW_SOURCE_TOGGLE, e),
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

    // Doc
    this.docTabChange$ = fromStorybookEvent<DocTabChange>(this.channel, EVENTS.DOC_TAB_CHANGE);
    this.docExampleToggle$ = fromStorybookEvent<DocExampleToggle>(this.channel, EVENTS.DOC_EXAMPLE_TOGGLE);
    this.docOverviewSourceToggle$ = fromStorybookEvent<DocOverviewSourceToggle>(
      this.channel,
      EVENTS.DOC_OVERVIEW_SOURCE_TOGGLE
    );
  }
}
