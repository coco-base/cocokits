import type { InjectionKey, ShallowRef } from 'vue';
import type { DismissLayer } from '@cocokits/cdk/dismissal';

/**
 * The dismiss layer of the overlay content a part is inside, so an overlay opened from inside it names it as
 * its parent (`getParent`), a press inside the child is not outside the parent, and the child stacks above it. Every overlay content (Popover, Dialog,
 * Tooltip, Select) provides its own layer under this key and reads the parent's. Not exported from any entry
 * point.
 */
export const DISMISS_LAYER_KEY: InjectionKey<ShallowRef<DismissLayer | null>> = Symbol('cck-dismiss-layer');
