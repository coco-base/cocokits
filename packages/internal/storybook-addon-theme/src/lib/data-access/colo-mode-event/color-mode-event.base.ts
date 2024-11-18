import { ColorModeChangeEvent } from '../../model/event.model';
import { EVENTS } from '../../config/events.config';
import { Observable } from 'rxjs';
import { ColorMode } from '../../model/theme.model';
import { fromStorybookEvent } from '../../utils/rxjs.util';
import { Channel } from '@storybook/channels';
import { LocalStorage } from '../local-storage';
import { getInstance } from '@cocokits/common-utils';

export abstract class ColorModeEventBase {
  protected channel: Channel;

  public colorModeChange$: Observable<ColorModeChangeEvent>;
  protected localStorage = getInstance(LocalStorage);

  constructor(channel: Channel) {
    this.channel = channel;
    // Don't move this line outside if `constructor`, otherwise the channel will be undefined, event if it's initialized in the constructor props.
    this.colorModeChange$ = fromStorybookEvent<ColorModeChangeEvent>(this.channel, EVENTS.COLOR_MODE_CHANGE);

    /**
     * We you need to ensure that the observable chain has always an active subscription.
     * Observables in RxJS are cold by default and won't emit values unless subscribed to.
     * Even if we don't subscribe to the source observable directly,
     * we should subscribe to the observable resulting from `withLatestFrom`.
     * This will initiate the data flow and allow you to receive values.
     */
    this.colorModeChange$.subscribe(() => {});
  }

  public getCurrentColorMode(): ColorModeChangeEvent {
    return { colorMode: this.localStorage.getColorModeOrDefault() };
  }

  public dispatchColorMode(colorMode: ColorMode) {
    const event: ColorModeChangeEvent = { colorMode };
    this.channel.emit(EVENTS.COLOR_MODE_CHANGE, event);
  }
}
