/**
 * The visible label of a control. It renders a native `<label>`, so a click on it focuses or
 * activates the control it names. Inside a FormField with a CocoKits control `for` defaults to that control's
 * id and the label names it; a `for` you write wins. Outside a field, or for a control that is not a CocoKits
 * control, set `for` to the `id` of the control. A control that is not labelable uses `aria-labelledby` with
 * the id of the label. While the control is required, the label ends with a `*` marker that is hidden from
 * assistive technology (the native `required` is announced); `hideRequiredMarker` on the FormField hides it.
 * Native attributes fall through to the root.
 *
 * @example
 * <Label for="email">Email address</Label>
 *
 * @cckPart root
 * @cckPart requiredMarker
 */
export interface LabelProps {
  /**
   * The id of the control to label. Inside a FormField with a CocoKits control it defaults to that
   * control's id; an explicit value always wins.
   *
   * @cckSemantic label.for
   */
  readonly for?: string | undefined;
}
