import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * An avatar with the name of the person and a description beside it. It renders a `<div>` that holds your avatar,
 * written first, and then the text. Native attributes fall through to the root.
 *
 * @remarks The avatar is a direct child. The text is a `<span>` with the name and the description, and it is
 * rendered only when `name` or `description` is set.
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
export interface AvatarLabelProps {
  /**
   * The name of the person, printed beside the avatar. When not set or empty, no name is rendered.
   *
   * @cckSemantic avatar-label.name
   * @cckParity Rendered in the name part of the label.
   */
  readonly name?: string | undefined;
  /**
   * A second line, such as a role or an email. When not set or empty, no description is rendered.
   *
   * @cckSemantic avatar-label.description
   * @cckParity Rendered in the description part of the label.
   */
  readonly description?: string | undefined;
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
