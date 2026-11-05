import { StrictMode, type ReactElement } from 'react';

/** Returns the value, or fails the test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

/** Resolves after the next task. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** The ways a test renders a node: as is, and inside StrictMode. */
export const wrappers = [
  { name: 'plain', wrap: (node: ReactElement) => node },
  { name: 'StrictMode', wrap: (node: ReactElement) => <StrictMode>{node}</StrictMode> },
];
