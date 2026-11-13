import { Directive, afterRenderEffect, computed, input, linkedSignal, numberAttribute, untracked } from '@angular/core';
import { getAvatarProps } from '@cocokits/machines/avatar';
import { injectCckAvatar } from './avatar';

const toDelay = (value: unknown): number | undefined => (value == null ? undefined : numberAttribute(value));

/**
 * What an avatar shows while the picture is not loaded: initials, an icon or any content. It hides when the picture has loaded.
 *
 * It replaces a separate fallback picture and a text label: put an `img` or the initials inside it. Give `delayMs` to keep it hidden for a short time, so a picture that loads fast does not flash the fallback.
 *
 * @example
 * <cck-avatar-fallback delayMs="300">AL</cck-avatar-fallback>
 * @cckPart fallback
 * @cckSlot default - The content to show. When not set, the fallback is empty.
 */
@Directive({
  selector: 'cck-avatar-fallback',
  exportAs: 'cckAvatarFallback',
  host: {
    '[class]': 'parts().class',
    '[hidden]': 'parts().hidden === true',
    '[attr.delayMs]': 'null',
  },
})
export class CckAvatarFallback {
  /**
   * How many milliseconds to wait, after the first render, before the fallback may show. It is hidden until then, also in the server render. When not set, there is no delay.
   */
  readonly delayMs = input<number | undefined, unknown>(undefined, { transform: toDelay });

  private readonly root = injectCckAvatar('cck-avatar-fallback');

  // A change of `delayMs` starts over: hidden again when there is a delay.
  private readonly delayPassed = linkedSignal(() => this.delayMs() === undefined);

  protected readonly parts = computed(
    () => getAvatarProps({ status: this.root.status(), delayPassed: this.delayPassed() }).fallback,
  );

  constructor() {
    // Client only (after render), restarted on each change of `delayMs`.
    afterRenderEffect((onCleanup) => {
      const delay = this.delayMs();
      if (delay === undefined || untracked(this.delayPassed)) return;
      const timer = setTimeout(() => {
        this.delayPassed.set(true);
      }, delay);
      onCleanup(() => {
        clearTimeout(timer);
      });
    });
  }
}
