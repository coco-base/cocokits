/**
 * The one scheduler of deferred focus: runs `task` in the next animation frame of the document and
 * returns the cancel. The task must re-read state when it runs (the overlay may have closed). Use it
 * instead of a bare `setTimeout`. Without a window (a server document) nothing is scheduled.
 *
 * @param doc - The document whose frames drive the task.
 * @param task - The work, run once.
 * @returns An idempotent cancel.
 */
export function scheduleFocus(doc: Document, task: () => void): () => void {
  const view = doc.defaultView;
  if (!view) return () => undefined;
  const handle = view.requestAnimationFrame(task);
  return () => {
    view.cancelAnimationFrame(handle);
  };
}
