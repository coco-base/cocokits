import { screen } from '@testing-library/angular';

/** A task later: the reset of a form is reported from a timer, after the browser reset the element. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** The only textarea on the page. */
export const textarea = (): HTMLTextAreaElement => screen.getByRole<HTMLTextAreaElement>('textbox');

/** Whether the element carries the attribute. */
export const isSet = (el: Element, name: string): boolean => el.hasAttribute(name);

/** The value, or a failed test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}
