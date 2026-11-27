/** Resolves after the next task. */
export const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
