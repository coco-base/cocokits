/** The handle {@link trackLabelActivation} returns. */
export interface LabelActivation {
  /**
   * Whether the click being handled was raised by the browser because a `label` of the control was clicked.
   * Call it from the control's click handler; it answers `true` once per label click.
   */
  consume(): boolean;
  /** Removes the listener and the pending timer; idempotent. */
  destroy(): void;
}

/**
 * Tells a click that a `label` forwards to its control apart from a click on the control itself. A control
 * that opens on click (a Select trigger) uses it to only take focus when its label is clicked. The browser
 * dispatches the forwarded click in the same task as the label click, so a capture listener on the document
 * sees the label click first and marks the control for the rest of the task. Create it after mount.
 *
 * @param control - The labelable control, for example a button.
 * @returns The handle; call `destroy()` when the control goes away.
 */
export function trackLabelActivation(control: HTMLElement): LabelActivation {
  const doc = control.ownerDocument;
  let pending = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const onClick = (event: Event): void => {
    const target = event.target as Element | null;
    if (target === control || !target) return;
    const label = target.closest<HTMLLabelElement>('label');
    if (label?.control !== control) return;
    pending = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      pending = false;
    }, 0);
  };
  doc.addEventListener('click', onClick, true);

  return {
    consume() {
      const was = pending;
      pending = false;
      return was;
    },
    destroy() {
      doc.removeEventListener('click', onClick, true);
      clearTimeout(timer);
      pending = false;
    },
  };
}
