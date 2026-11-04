const INTERACTIVE =
  'a[href], button, input, select, textarea, label, summary, [tabindex], [contenteditable]:not([contenteditable="false"])';

/** The element a node stands for: the node itself, or the parent of a text node. */
function elementOf(node: EventTarget | null): Element | null {
  const candidate = node as Node | null;
  if (!candidate) return null;
  return candidate.nodeType === 1 ? (candidate as Element) : candidate.parentElement;
}

/**
 * Whether a press on a field's input wrapper (its padding, a prefix or a suffix) belongs to the
 * control, so the field should focus it. Use it for `mousedown` (to keep a focused control focused)
 * and for `click` (to focus it), bound on the input wrapper. It reads the DOM only when called.
 *
 * It returns `false` when the event was already handled (`defaultPrevented`); when the target is the
 * control or inside it; when the target is, or is inside, interactive content within the wrapper (a link,
 * button, form control, label, summary, or an element with `tabindex` or a `contenteditable` other than
 * `"false"`); when there is no control; when the control is disabled, `hidden` or `inert` (itself or an
 * ancestor); or when the document has a non-collapsed selection outside the control.
 * A read-only control is focusable, so it returns `true` for it.
 *
 * @param event - The `mousedown` or `click` event, with `currentTarget` the input wrapper.
 * @param control - The control the field registered, or `null` when there is none.
 * @returns `true` when the control should take the press.
 */
export function shouldFocusControl(event: MouseEvent, control: HTMLElement | null): boolean {
  if (event.defaultPrevented || !control) return false;
  const target = elementOf(event.target);
  if (!target || control.contains(target)) return false;

  const wrapper = elementOf(event.currentTarget);
  const interactive = target.closest(INTERACTIVE);
  if (interactive && (!wrapper || wrapper.contains(interactive))) return false;

  if (control.matches(':disabled') || control.closest('[hidden], [inert]')) return false;

  const selection = control.ownerDocument.getSelection();
  return !(
    selection &&
    !selection.isCollapsed &&
    !(control.contains(selection.anchorNode) && control.contains(selection.focusNode))
  );
}
