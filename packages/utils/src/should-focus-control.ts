const INTERACTIVE =
  'a[href], button, input, select, textarea, label, summary, [tabindex], [contenteditable]:not([contenteditable="false"])';

/** The element a node stands for: the node itself, or the parent of a text node. */
function elementOf(node: EventTarget | null): Element | null {
  const candidate = node as Node | null;
  if (!candidate) return null;
  return candidate.nodeType === 1 ? (candidate as Element) : candidate.parentElement;
}

/**
 * Decides whether a press on the wrapper of a field belongs to the control inside it, so the field should focus the control.
 * The wrapper can have padding, a prefix or a suffix.
 *
 * @remarks
 * Bind it on the wrapper for `mousedown`, to keep a focused control focused, and for `click`, to focus the control.
 * It reads the DOM only when you call it.
 *
 * It returns `false` when the event was already handled (`defaultPrevented`). It returns `false` when there is no
 * control, or when the target is the control or is inside it. It also returns `false` when the control is disabled,
 * `hidden` or `inert`, itself or through an ancestor.
 *
 * It returns `false` when the target is, or is inside, interactive content within the wrapper. That is a link, a
 * button, a form control, a label or a summary. An element with `tabindex` or `contenteditable` other than `"false"` is
 * too.
 *
 * It returns `false` when the document has a selection that is not collapsed and lies outside the control.
 *
 * A read-only control can take focus, so it returns `true` for it.
 *
 * @param event - The `mousedown` or `click` event. Its `currentTarget` is the wrapper.
 * @param control - The control of the field, or `null` when there is none.
 * @returns `true` when the control should take the press.
 * @example
 * const wrapper = document.querySelector<HTMLElement>('.field-wrapper')!;
 * const input = wrapper.querySelector<HTMLInputElement>('input')!;
 * wrapper.addEventListener('click', (event) => {
 *   if (shouldFocusControl(event, input)) input.focus();
 * });
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
