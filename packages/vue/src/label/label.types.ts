/**
 * The visible label of a control. It renders a native `<label>`, so a click on it focuses or activates the control
 * it names. Native attributes fall through to the root.
 *
 * Inside a FormField with a CocoKits control, the label names that control. Outside a field, or for another
 * control, set `for` to the `id` of the control. A control that a `<label>` cannot name uses `aria-labelledby` with
 * the id of the label.
 *
 * While the control is required, the label ends with a `*` marker. Assistive technology does not read it, because
 * it announces the native `required`. `hideRequiredMarker` on the FormField hides the marker.
 *
 * @example
 * <Label for="email">Email address</Label>
 * <Input id="email" type="email" />
 *
 * @cckPart root
 * @cckPart requiredMarker
 */
export interface LabelProps {
  /**
   * The id of the control to label. When not set, inside a FormField with a CocoKits control it is the id of that
   * control. A value you set always wins.
   *
   * @cckSemantic label.for
   */
  readonly for?: string | undefined;
}
