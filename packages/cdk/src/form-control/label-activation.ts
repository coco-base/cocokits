/** The handle {@link trackLabelActivation} returns. */
export interface LabelActivation {
  /**
   * Whether the browser raised the click being handled because a `label` of the control was clicked.
   * Call it from the click handler of the control. It answers `true` once for each label click.
   */
  consume(): boolean;
  /** Removes the listener and the pending timer. Calling it again does nothing. */
  destroy(): void;
}

/**
 * Tells a click that a `label` forwards to its control apart from a click on the control itself.
 * A custom control that opens on click can use it to take focus only when its label is clicked.
 *
 * @remarks
 * The browser sends the forwarded click in the same task as the label click. A capture listener on the
 * document sees the label click first and marks the control for the rest of the task.
 *
 * Call it after the control is in the document.
 *
 * @param control - The labelable control, for example a `button`.
 * @returns The handle. Call `destroy()` when the control goes away.
 * @example
 * const button = document.querySelector<HTMLButtonElement>('#colour')!;
 * const activation = trackLabelActivation(button);
 * button.addEventListener('click', () => {
 *   if (activation.consume()) button.focus();
 * });
 * // When the control goes away:
 * activation.destroy();
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
