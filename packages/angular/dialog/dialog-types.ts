import type { DialogChangeReason } from '@cocokits/machines/dialog';
import type { ChangeDetails } from '@cocokits/shared';

/** Why the open state of a Dialog changed. */
export type DialogOpenChangeReason = DialogChangeReason;

/** What `opened`, `closed` and `closePredicate` receive: the `reason` of the change and the `event` behind it. */
export type DialogChangeDetails = ChangeDetails<DialogOpenChangeReason>;
