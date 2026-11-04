/** Resolves after the tasks queued so far, which is when a reset has been reported. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** Resolves after pending mutation observer callbacks. */
export const nextMicrotask = (): Promise<void> => Promise.resolve();

/** Returns the value, or fails the test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}
