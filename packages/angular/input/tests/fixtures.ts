import { Validators, type ValidatorFn } from '@angular/forms';
import { screen } from '@testing-library/angular';

/** `Validators.required` itself (Angular finds it by identity), typed as a plain function for the unbound-method rule. */
export const requiredValidator = (Validators as unknown as { required: ValidatorFn }).required;

/** A task later: the reset of a form is reported from a timer, after the browser reset the element. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** The only text input on the page. */
export const textbox = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('textbox');

/** Whether the element carries the attribute. */
export const isSet = (el: Element, name: string): boolean => el.hasAttribute(name);

/** The value, or a failed test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}
