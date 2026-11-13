import type { Component } from 'vue';
import type { AvatarLabelProps as MachineAvatarLabelProps } from '@cocokits/machines/avatar-label';
import type { AsTag } from '@cocokits/vue-core';

/**
 * An avatar with the name of the person and a description beside it. It renders a `<div>` that holds your avatar, a
 * direct child written first, and then a `<span>` with the name and the description. The text is rendered only when
 * `name` or `description` is set. Native attributes fall through to the root.
 *
 * The name is printed beside the avatar, so hide the avatar from assistive technology with `aria-hidden="true"` on
 * its root.
 *
 * @example
 * <AvatarLabel name="Ada Lovelace" description="Mathematician">
 *   <AvatarRoot aria-hidden="true"><AvatarFallback>AL</AvatarFallback></AvatarRoot>
 * </AvatarLabel>
 *
 * @cckPart root
 * @cckPart text
 * @cckPart name
 * @cckPart description
 */
export interface AvatarLabelProps extends Pick<MachineAvatarLabelProps, 'name' | 'description'> {
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
   * label renders the avatar and the text inside that child, in place of its children. When not set, the part
   * renders its own element.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
