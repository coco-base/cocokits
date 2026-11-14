import {
  Directive,
  Injectable,
  forwardRef,
  input,
  signal,
  type InputSignal,
  type Provider,
  type Signal,
} from '@angular/core';
import type { Direction } from '@cocokits/shared';

export type { Direction };

/**
 * The direction of the nearest provider; `'ltr'` when none is provided. Components read it for RTL
 * arrow keys and logical placement. Provide it with `[cckDir]` for a subtree or
 * {@link provideCckDirection} for an app.
 */
@Injectable({ providedIn: 'root', useFactory: () => new CckDirection(signal('ltr')) })
export class CckDirection {
  /** @param dir - The current direction, as a signal. */
  constructor(readonly dir: Signal<Direction>) {}
}

/**
 * Provides a direction for the app. A `[cckDir]` directive below it wins for its subtree.
 *
 * @param dir - The direction.
 */
export function provideCckDirection(dir: Direction): Provider {
  return { provide: CckDirection, useValue: new CckDirection(signal(dir)) };
}

/**
 * Provides the direction of its element's subtree to the components below, and sets `dir` on the element.
 *
 * @example
 * ```html
 * <div cckDir dir="rtl">...</div>
 * ```
 */
@Directive({
  selector: '[cckDir]',
  providers: [{ provide: CckDirection, useExisting: forwardRef(() => CckDir) }],
  host: { '[attr.dir]': 'dir()' },
})
export class CckDir extends CckDirection {
  /** The direction of the subtree. @defaultValue `'ltr'` */
  override readonly dir: InputSignal<Direction> = input<Direction>('ltr');

  constructor() {
    super(signal('ltr'));
  }
}
