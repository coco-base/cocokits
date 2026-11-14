import type { Component } from 'vue';
import type { ButtonProps as MachineButtonProps } from '@cocokits/machines/button';
import type { AsTag } from '@cocokits/vue-core';

/** The props the Button and the IconButton share. The Button builds its props on them. @internal */
export interface ButtonBaseProps extends Pick<MachineButtonProps, 'disabled'> {
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
   * Whether the component merges onto its first element or component child, such as a router link, instead of
   * rendering an element. Text and comments before the child are skipped. The child must render an `<a>`.
   *
   * The props of the child win, except the state markers the component sets while disabled: `aria-disabled`,
   * `tabindex` and `data-disabled`. The class of the component joins the class of the child.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
