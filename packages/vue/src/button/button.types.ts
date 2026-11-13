import type { Component } from 'vue';
import type { ButtonProps as MachineButtonProps } from '@cocokits/machines/button';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A button for actions. It renders a native `<button type="button">`. With an `as` other than `'button'`, or with
 * `asChild`, it renders a link (an `<a>`).
 *
 * For a Button with only an icon, use the IconButton; it needs `aria-label` or `aria-labelledby`.
 *
 * Native button attributes and listeners fall through to the rendered element. A disabled link blocks its click in
 * the capture phase. So your `@click.capture` runs first and can stop the guard with `preventDefault()`.
 *
 * @example
 * <Button @click="save">Save</Button>
 *
 * @cckPart root
 */
export interface ButtonProps extends Pick<MachineButtonProps, 'disabled'> {
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
   * Whether the Button merges onto its first element or component child, such as a router link, instead of
   * rendering an element. Text and comments before the child are skipped. The child must render an `<a>`.
   *
   * The props of the child win, except the state markers the Button sets while disabled: `aria-disabled`,
   * `tabindex` and `data-disabled`. The class of the Button joins the class of the child.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
