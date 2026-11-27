/**
 * Runs a task in the next animation frame of a document. Use it to move focus after the page has updated,
 * instead of a bare `setTimeout`.
 *
 * @remarks
 * The task must read the state again when it runs, because the overlay may have closed in the meantime.
 * A document without a window, such as one on a server, schedules nothing.
 *
 * @param doc - The document whose frames drive the task.
 * @param task - The work to run once.
 * @returns The cancel function. Calling it again does nothing.
 * @example
 * const input = document.querySelector<HTMLInputElement>('input')!;
 * const cancel = scheduleFocus(document, () => input.focus());
 * // To stop it before the frame:
 * cancel();
 */
export function scheduleFocus(doc: Document, task: () => void): () => void {
  const view = doc.defaultView;
  if (!view) return () => undefined;
  const handle = view.requestAnimationFrame(task);
  return () => {
    view.cancelAnimationFrame(handle);
  };
}
