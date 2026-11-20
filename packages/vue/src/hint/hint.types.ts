import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A short help text for a control, shown under it. It renders a `<div>` and has no role. Native attributes fall
 * through to the root.
 *
 * Inside a `FormField`, the hint describes the control. Outside one, set `id` on the hint and `aria-describedby` on
 * the control.
 *
 * @example
 * <Hint id="email-hint">We only use it for the receipt.</Hint>
 * <Input aria-label="Email" aria-describedby="email-hint" />
 *
 * @cckPart root
 */
export interface HintProps {
  /**
   * The tag or component to render. It is ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Hint merges its attributes onto the one element or component child of its default slot,
   * instead of rendering an element.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
