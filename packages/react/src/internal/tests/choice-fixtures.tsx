import { StrictMode, type ReactElement } from 'react';
import { expect } from 'vitest';

export function strict(ui: ReactElement): ReactElement {
  return <StrictMode>{ui}</StrictMode>;
}

/** Resolves after the next task, where the cdk reports a reset. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** Resolves after the next frame, where the development name check runs. */
export const nextFrame = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve();
    }),
  );

export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

/** Whether the element carries the attribute. */
export const isSet = (element: Element, name: string): boolean => element.hasAttribute(name);

const kebab = (name: string): string => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** The attribute names of the element that start with `data-`, sorted. */
export function dataNames(element: Element): string[] {
  return element
    .getAttributeNames()
    .filter((name) => name.startsWith('data-'))
    .sort();
}

/** Asserts that every part of the meta renders its default element below the block root. */
export function expectDefaultElements(
  root: Element,
  block: string,
  defaultElements: Readonly<Partial<Record<string, string>>> | undefined,
): void {
  if (!defaultElements) throw new Error(`The ${block} meta has no default elements.`);
  for (const [part, tag] of Object.entries(defaultElements)) {
    const element = part === 'root' ? root : root.querySelector(`.cck-${block}__${kebab(part)}`);
    if (!element) throw new Error(`The ${block} renders no ${part} part.`);
    expect(element.localName, `${block} ${part}`).toBe(tag);
  }
}

/** The ids a markup string points at with the attribute (`for`, `aria-describedby`). */
export const idsIn = (html: string, attribute: string): string[] =>
  [...html.matchAll(new RegExp(` ${attribute}="([^"]+)"`, 'g'))].flatMap((match) => match[1].split(' '));
