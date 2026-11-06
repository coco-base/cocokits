import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * Renders a `<div>` by default with the error message of a field. The `div` is a polite live region
 * (`aria-live="polite"`) that is always rendered; its content is inserted only while it shows, so the message is
 * announced when it appears. Inside a FormField it shows while the field is invalid and was touched or the form was
 * submitted, or with `force`; outside a FormField it always shows, and you render the content conditionally. The
 * message is not rendered while hidden, so a hidden FieldError adds nothing to the description of the control. Put
 * it in the `error` slot of a FormField; several are allowed. It has no role and does not move focus. Native
 * attributes fall through to the root.
 *
 * @example
 * <FormField><template #label><Label>Email</Label></template><template #error><FieldError>Enter an email address.</FieldError></template><Input type="email" invalid /></FormField>
 *
 * @cckPart root
 */
export interface FieldErrorProps {
  /**
   * Whether the content shows regardless of the field state.
   *
   * @defaultValue false
   */
  readonly force?: boolean | undefined;
  /**
   * The tag or component to render.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the FieldError merges its attributes onto the one element or component child of its
   * default slot instead of rendering an element. The message is the child's own children.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
