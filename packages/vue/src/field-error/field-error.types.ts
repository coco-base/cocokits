import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * The error message of a field. It renders a `<div>` with `aria-live="polite"`, which is always there. Its content
 * is inserted only while it shows, so the message is announced when it appears.
 *
 * Inside a FormField, it shows while the field is invalid and was touched, or the form was submitted, or with
 * `force`. Outside a FormField, it always shows, and you render the content only when you need it.
 *
 * The message is not rendered while hidden, so a hidden FieldError adds nothing to the description of the control.
 * Put it in the `error` slot of a FormField; several are allowed. It has no role and does not move the focus.
 * Native attributes fall through to the root.
 *
 * @example
 * <FormField>
 *   <template #label><Label>Email</Label></template>
 *   <Input type="email" invalid />
 *   <template #error><FieldError>Enter an email address.</FieldError></template>
 * </FormField>
 *
 * @cckPart root
 */
export interface FieldErrorProps {
  /**
   * Whether the content shows whatever the state of the field.
   *
   * @defaultValue false
   */
  readonly force?: boolean | undefined;
  /**
   * The tag or component to render. It is ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the FieldError merges its attributes onto the one element or component child of its default slot,
   * instead of rendering an element. The children of the child are the message.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
