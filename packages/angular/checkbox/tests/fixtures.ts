import { screen } from '@testing-library/angular';
import { expect } from 'vitest';

/** A task later: the reset of a form is reported from a timer, after the browser reset the element. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** The only checkbox on the page (a switch has the role `switch`). */
export const box = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('checkbox');

/** Whether the element carries the attribute. */
export const isSet = (el: Element, name: string): boolean => el.hasAttribute(name);

/** The value, or a failed test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

const kebab = (name: string): string => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** The root's attribute names that start with `data-`, sorted. */
export function dataNames(root: Element): string[] {
  return root
    .getAttributeNames()
    .filter((name) => name.startsWith('data-'))
    .sort();
}

/** Asserts that every part of the meta renders its default element below the block root, which is the `cck-<block>` tag. */
export function expectDefaultElements(
  root: Element,
  block: string,
  defaultElements: Readonly<Partial<Record<string, string>>> | undefined,
): void {
  if (!defaultElements) throw new Error(`The ${block} meta has no default elements.`);
  for (const [part, tag] of Object.entries(defaultElements)) {
    const element = part === 'root' ? root : root.querySelector(`.cck-${block}__${kebab(part)}`);
    if (!element) throw new Error(`The ${block} renders no ${part} part.`);
    expect(element.localName, `${block} ${part}`).toBe(part === 'root' ? `cck-${block}` : tag);
  }
}
