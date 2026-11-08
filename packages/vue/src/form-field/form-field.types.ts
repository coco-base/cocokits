import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * Lays out a label, a control, its zones and its hints in fixed places, whatever order you write them in. It
 * renders a `<div>`. It holds one control.
 *
 * The order is the `label` slot, then the wrapper, then the `hint` and `error` slots. The wrapper holds the
 * `leading` slot, the input wrapper and the `trailing` slot. The input wrapper holds the `prefix` slot, the default
 * slot (the control) and the `suffix` slot.
 *
 * A click on the box, its padding, a prefix or a suffix focuses the control. That is not so when it lands on
 * interactive content or a disabled control, or after the user selects text.
 *
 * The field wires a CocoKits control (an Input or a Textarea) for you. The field has an id: your `id`, or a
 * generated one. The control gets the id `<id>-control`, and the `for` of the Label points at it.
 *
 * The `aria-describedby` of the control ends with the ids of its hints, then of its errors. A Hint or a FieldError
 * keeps its own `id`, or gets `<id>-hint-<n>` or `<id>-error-<n>`. An `id`, `for` or `aria-describedby` you write
 * wins or comes first.
 *
 * Put each Hint and FieldError directly in its slot. Anything else there gets no id and is not listed: an element,
 * a wrapper or a component, also one that renders a Hint itself. In development, the field then warns once.
 *
 * `disabled`, `readonly`, `required` and `invalid` reach the control. The facts of the control are `data-*`
 * attributes on the root: those four and `touched`, `dirty`, `submitted`, `focused`, `filled` and `pending`.
 *
 * Another control gets none of this. Give it an `id`, give the Label the same `for`, and add the hint ids to its
 * `aria-describedby`. Native attributes fall through to the root.
 *
 * @example
 * <FormField required>
 *   <template #label><Label>Price</Label></template>
 *   <template #leading><Leading>From</Leading></template>
 *   <template #prefix><Prefix>$</Prefix></template>
 *   <Input v-model="price" />
 *   <template #suffix><Suffix>USD</Suffix></template>
 *   <template #trailing><Trailing><Button>Convert</Button></Trailing></template>
 *   <template #hint><Hint>Enter the price of one item.</Hint></template>
 *   <template #error><FieldError>Enter a price.</FieldError></template>
 * </FormField>
 *
 * @cckPart root
 */
export interface FormFieldProps {
  /**
   * The id that the ids of the control and the feedback start from: `<id>-control` and `<id>-feedback`. When not
   * set, the field generates one, which the root does not render.
   */
  readonly id?: string | undefined;
  /**
   * Whether the control is disabled. The `disabled` of the control, a disabled `fieldset` or a forms library can
   * disable it too.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the control is read-only.
   *
   * @cckSemantic form-field.readOnly
   * @cckParity Spelled as the native `readonly` attribute.
   * @defaultValue false
   */
  readonly readonly?: boolean | undefined;
  /**
   * Whether the control is required. The Label then shows its required marker.
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Whether the control is invalid. `aria-invalid` appears only after the control was touched or the form was
   * submitted.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * Whether the required marker of the Label is hidden. It does not change `required`.
   *
   * @defaultValue false
   */
  readonly hideRequiredMarker?: boolean | undefined;
  /**
   * Whether the field is hidden. It sets the native `hidden` attribute. The root is also hidden while the control is
   * hidden, and `false` here does not show it again.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   * @defaultValue false
   */
  readonly hidden?: boolean | undefined;
  /**
   * The tag or component to render. It is ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the FormField merges its attributes onto the one element or component child of its default slot,
   * instead of rendering an element. The FormField renders the label, control and hint zones inside the child. The
   * children of the child become the control.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
