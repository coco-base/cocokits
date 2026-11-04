/** A React event handler. */
export type EventHandler<E> = (event: E) => void;

/**
 * Runs two handlers in order: the consumer's first, ours second. Ours must check `defaultPrevented`
 * itself, because the consumer's `preventDefault()` is a veto.
 *
 * @param theirs - The consumer's handler.
 * @param ours - The part's handler.
 * @returns One handler; the other one when only one is given.
 */
export function composeEventHandlers<E>(
  theirs: EventHandler<E> | undefined,
  ours: EventHandler<E> | undefined,
): EventHandler<E> | undefined {
  if (!theirs || !ours) return theirs ?? ours;
  return (event) => {
    theirs(event);
    ours(event);
  };
}
