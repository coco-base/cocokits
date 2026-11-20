import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { avatarGroupAnatomy, getAvatarGroupProps } from '@cocokits/machines/avatar-group';

/**
 * Shows several avatars overlapping in a row. The `cck-avatar` elements must be direct children, in the order they should stack: a later avatar paints over the one before it.
 *
 * The group has no role. To name it for screen readers, put `role="group"` and `aria-label` on it.
 *
 * @example
 * <cck-avatar-group role="group" aria-label="Team">
 *   <cck-avatar><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>
 *   <cck-avatar><cck-avatar-fallback>GH</cck-avatar-fallback></cck-avatar>
 * </cck-avatar-group>
 * @cckPart root
 * @cckSlot default - The avatars. When not set, the group is empty.
 */
@Directive({
  selector: 'cck-avatar-group',
  exportAs: 'cckAvatarGroup',
  host: {
    '[class]': 'parts.root.class',
  },
})
export class CckAvatarGroup {
  protected readonly parts = getAvatarGroupProps();

  constructor() {
    themeAttrs(avatarGroupAnatomy); // applies the root part's theme attributes to the host
  }
}
