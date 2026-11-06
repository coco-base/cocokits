import type { Component } from 'vue';
import type { ButtonProps as MachineButtonProps } from '@cocokits/machines/button';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A button for actions. It renders a native `<button type="button">` by default; with `as` other
 * than `'button'`, or `asChild`, it renders link semantics (an `<a>`). Native button attributes and
 * listeners fall through to the rendered element. A disabled link blocks its click in the capture
 * phase, so a consumer `@click.capture` runs first and can veto the guard with `preventDefault()`.
 *
 * @example
 * <Button @click="save">Save</Button>
 *
 * @cckPart root
 */
export interface ButtonProps extends Pick<MachineButtonProps, 'disabled'> {
  /**
   * The tag or component to render. `'button'` renders a native `<button>`; any other value
   * (`'a'`, `RouterLink`, `NuxtLink`) renders link semantics: no `role`, no `type`, and a disabled
   * Button gets `aria-disabled="true"` and `tabindex="-1"` and blocks its click. A component must
   * render an `<a>`.
   *
   * @cckSemantic none
   * @cckParity Vue's element override (Reka); a non-`button` value renders link semantics.
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Button merges onto its first element or component child (text and comments are skipped) instead of
   * rendering an element, for example a router link. The child must render an `<a>`; its own props win except the state markers the Button sets
   * (while disabled: `aria-disabled`, `tabindex`, `data-disabled`), and the class joins its class.
   *
   * @cckSemantic none
   * @cckParity Vue's merge onto one link child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
