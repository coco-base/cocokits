import type { Component } from 'vue';
import type { ButtonProps as MachineButtonProps } from '@cocokits/machines/button';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A button that shows only an icon. It has the behaviour and props of the Button: it renders a native
 * `<button type="button">`. With an `as` other than `'button'`, or with `asChild`, it renders a link (an `<a>`).
 *
 * It has no text, so it needs a name: `aria-label` or `aria-labelledby`, or a labelled `SvgIcon` inside. In
 * development, a missing name logs a `CocoKits:` error. Keep the icon inside decorative, so the button carries the
 * name. A toggle keeps one name and sets `aria-pressed`.
 *
 * Native button attributes and listeners fall through to the rendered element. A disabled link blocks its click in
 * the capture phase. So your `@click.capture` runs first and can stop the guard with `preventDefault()`.
 *
 * @example
 * <IconButton aria-label="Add item"><SvgIcon icon-name="plus" /></IconButton>
 *
 * @cckPart root
 */
export interface IconButtonProps extends Pick<MachineButtonProps, 'disabled'> {
  /**
   * The tag or component to render. `'button'` renders a native `<button>`. Any other value, such as `'a'` or
   * `RouterLink`, renders a link, and a component must render an `<a>`.
   *
   * It is ignored with `asChild`.
   *
   * A link has no `role` and no `type`. A disabled link gets `aria-disabled="true"` and `tabindex="-1"`, and it
   * blocks its click.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`. A non-`button` value renders link semantics.
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the IconButton merges onto its first element or component child, such as a router link, instead of
   * rendering an element. Text and comments before the child are skipped. The child must render an `<a>`.
   *
   * The props of the child win, except the state markers the IconButton sets while disabled: `aria-disabled`,
   * `tabindex` and `data-disabled`. The class of the IconButton joins the class of the child.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
