import { Channel } from '@storybook/channels';
import { fromEventPattern, shareReplay } from 'rxjs';

export function fromStorybookEvent<T>(channel: Channel, eventName: string) {
  return fromEventPattern<T>(
    (handler) => channel.on(eventName, handler),
    (removeHandler) => channel.off(eventName, removeHandler)
  ).pipe(shareReplay(1));
}
