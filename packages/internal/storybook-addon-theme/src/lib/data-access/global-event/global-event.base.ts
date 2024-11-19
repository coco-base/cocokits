import { Channel } from '@storybook/channels';
import { fromStorybookEvent } from '../../utils/rxjs.util';
import { EVENTS } from '../../config/events.config';
import { SelectedTheme } from '../../model/theme.model';
import { Observable } from 'rxjs';

export abstract class GlobalEventBase {
  protected channel: Channel;

  // Theme Selection
  public openThemeSelection$: Observable<void>;
  public themeSelectionClosed$: Observable<SelectedTheme>;

  // Story Control
  public openStoryControl$: Observable<void>;
  public storyControlClosed$: Observable<void>;
  public storyControlChanged$: Observable<void>;

  public dispatch = {
    // Theme Selection
    openThemeSelection: () => this.channel.emit(EVENTS.OPEN_THEME_SELECTION),
    themeSelectionClosed: (e: SelectedTheme) => this.channel.emit(EVENTS.THEME_SELECTION_CLOSED, e),

    // Story Control
    openStoryControl: () => this.channel.emit(EVENTS.OPEN_STORY_CONTROL),
    storyControlClosed: () => this.channel.emit(EVENTS.STORY_CONTROL_CLOSED),
    storyControlChanged: () => this.channel.emit(EVENTS.STORY_CONTROL_CHANGED),
  };

  constructor(channel: Channel) {
    this.channel = channel;

    // Theme Selection
    this.openThemeSelection$ = fromStorybookEvent<void>(this.channel, EVENTS.OPEN_THEME_SELECTION);
    this.themeSelectionClosed$ = fromStorybookEvent<SelectedTheme>(this.channel, EVENTS.THEME_SELECTION_CLOSED);

    // Story Control
    this.openStoryControl$ = fromStorybookEvent<void>(this.channel, EVENTS.OPEN_STORY_CONTROL);
    this.storyControlClosed$ = fromStorybookEvent<void>(this.channel, EVENTS.STORY_CONTROL_CLOSED);
    this.storyControlChanged$ = fromStorybookEvent<void>(this.channel, EVENTS.STORY_CONTROL_CHANGED);
  }
}
