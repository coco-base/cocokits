import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * Several avatars that overlap in a row. It renders a `<div>`; each avatar must be a direct child. Native attributes
 * fall through to the root.
 *
 * The group has no role. To name it for assistive technology, give it `role="group"` and an `aria-label`.
 *
 * @example
 * <AvatarGroup role="group" aria-label="Team">
 *   <AvatarRoot><AvatarFallback>AL</AvatarFallback></AvatarRoot>
 *   <AvatarRoot><AvatarFallback>GH</AvatarFallback></AvatarRoot>
 * </AvatarGroup>
 *
 * @cckPart root
 */
export interface AvatarGroupProps {
  /**
   * The tag or component to render in place of the `<div>`. It is ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the class of the part. When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
