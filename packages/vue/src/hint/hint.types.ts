import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A short help text for a control, shown under it. It renders a `<div>` by default and has no role.
 * Set `id` on the hint and `aria-describedby` on the control. It works on its own and inside a
 * `FormField`. Native attributes fall through to the root.
 *
 * @example
 * <Hint id="email-hint">We only use it for the receipt.</Hint>
 *
 * @cckPart root
 */
export interface HintProps {
  /**
   * The tag or component to render.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Hint merges its attributes onto the one element or component child of its
   * default slot instead of rendering an element.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
