/** Resolves after the next task. */
export const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
