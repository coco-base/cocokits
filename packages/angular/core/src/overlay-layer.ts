import { Injectable } from '@angular/core';
import type { DismissLayer } from '@cocokits/cdk/dismissal';

/**
 * The dismiss layer of an open overlay. List it in the `providers` of every overlay root (Popover, Dialog,
 * Tooltip, Select) next to `CckPortal`; the root sets `current` while it is open. An overlay declared inside
 * another overlay's content finds the parent's with `inject(CckOverlayLayer, { optional: true, skipSelf: true })`
 * and passes it as `getParent` of its own layer, so a press inside the child is not outside the parent and the child stacks above it.
 *
 * @internal
 */
@Injectable()
export class CckOverlayLayer {
  /** The layer while the overlay is open, else `null`. */
  current: DismissLayer | null = null;
}
